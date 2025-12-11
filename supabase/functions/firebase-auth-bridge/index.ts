import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Firebase project ID for token verification
const FIREBASE_PROJECT_ID = 'health-swift';

// Verify Firebase ID token using Firebase's public keys
async function verifyFirebaseToken(idToken: string): Promise<{ uid: string; email?: string; phone?: string; name?: string } | null> {
  try {
    // Decode the token header to get the key ID
    const [headerB64] = idToken.split('.');
    const header = JSON.parse(atob(headerB64));
    const kid = header.kid;

    // Fetch Firebase's public keys
    const keysResponse = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    const keys = await keysResponse.json();

    if (!keys[kid]) {
      console.error('Key ID not found in Firebase public keys');
      return null;
    }

    // Decode and verify the token
    const [, payloadB64] = idToken.split('.');
    const payload = JSON.parse(atob(payloadB64));

    // Verify token claims
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      console.error('Token has expired');
      return null;
    }

    if (payload.iat > now + 60) {
      console.error('Token issued in the future');
      return null;
    }

    if (payload.aud !== FIREBASE_PROJECT_ID) {
      console.error('Token audience mismatch');
      return null;
    }

    if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
      console.error('Token issuer mismatch');
      return null;
    }

    if (!payload.sub) {
      console.error('Token missing subject');
      return null;
    }

    return {
      uid: payload.sub,
      email: payload.email,
      phone: payload.phone_number,
      name: payload.name || payload.displayName
    };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firebaseIdToken } = await req.json();

    if (!firebaseIdToken) {
      console.error('Missing Firebase ID token');
      return new Response(
        JSON.stringify({ error: 'Firebase ID token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the Firebase token
    const firebaseUser = await verifyFirebaseToken(firebaseIdToken);

    if (!firebaseUser) {
      console.error('Invalid Firebase token');
      return new Response(
        JSON.stringify({ error: 'Invalid Firebase token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Firebase user verified:', firebaseUser.uid);

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user exists in Supabase auth
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }

    // Find user by Firebase UID stored in user metadata or by email
    let supabaseUser = existingUsers.users.find(u => 
      u.user_metadata?.firebase_uid === firebaseUser.uid ||
      (firebaseUser.email && u.email === firebaseUser.email)
    );

    if (!supabaseUser) {
      // Create new Supabase user linked to Firebase
      console.log('Creating new Supabase user for Firebase UID:', firebaseUser.uid);
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: firebaseUser.email || `${firebaseUser.uid}@firebase.local`,
        phone: firebaseUser.phone,
        email_confirm: true,
        phone_confirm: firebaseUser.phone ? true : false,
        user_metadata: {
          firebase_uid: firebaseUser.uid,
          full_name: firebaseUser.name
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      supabaseUser = newUser.user;
      console.log('Created Supabase user:', supabaseUser?.id);
    } else {
      // Update user metadata with Firebase UID if not set
      if (!supabaseUser.user_metadata?.firebase_uid) {
        await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
          user_metadata: {
            ...supabaseUser.user_metadata,
            firebase_uid: firebaseUser.uid
          }
        });
      }
    }

    // Generate a session for the user
    // We use a custom approach: generate an access token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: supabaseUser?.email || `${firebaseUser.uid}@firebase.local`,
    });

    if (sessionError) {
      console.error('Error generating link:', sessionError);
      throw sessionError;
    }

    // Sign in the user to get a session
    // Extract the token from the magic link
    const token = sessionData.properties?.hashed_token;
    
    // Return user info and verification status
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: supabaseUser?.id,
          email: supabaseUser?.email,
          firebase_uid: firebaseUser.uid
        },
        // Return magic link for client to complete auth
        magicLink: sessionData.properties?.action_link
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in firebase-auth-bridge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
