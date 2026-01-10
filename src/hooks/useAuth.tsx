import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile
} from "firebase/auth";
import { auth } from "@/integrations/firebase/config";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

// Bridge Firebase auth to Supabase for RLS to work
const bridgeFirebaseToSupabase = async (firebaseUser: User) => {
  try {
    const idToken = await firebaseUser.getIdToken();
    
    const { data, error } = await supabase.functions.invoke('firebase-auth-bridge', {
      body: { firebaseIdToken: idToken }
    });

    if (error) {
      console.error('Firebase-Supabase bridge error:', error);
      return;
    }

    // If we got a magic link, complete the Supabase auth
    if (data?.magicLink) {
      // Extract the token from magic link and verify
      const url = new URL(data.magicLink);
      const token = url.searchParams.get('token');
      const type = url.searchParams.get('type');
      
      if (token && type) {
        await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as 'magiclink'
        });
      }
    }

    console.log('Firebase-Supabase bridge successful');
  } catch (error) {
    console.error('Error bridging Firebase to Supabase:', error);
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      
      // Bridge to Supabase when user signs in
      if (firebaseUser) {
        await bridgeFirebaseToSupabase(firebaseUser);
      } else {
        // Sign out of Supabase when Firebase user signs out
        await supabase.auth.signOut();
      }
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timeout - forcing completion");
        setLoading(false);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Bridge will be called by onAuthStateChanged
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: fullName });
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const setupRecaptcha = (elementId: string) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha verified");
        },
      });
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      // Create a temporary button for recaptcha if it doesn't exist
      let recaptchaContainer = document.getElementById("recaptcha-container");
      if (!recaptchaContainer) {
        recaptchaContainer = document.createElement("div");
        recaptchaContainer.id = "recaptcha-container";
        document.body.appendChild(recaptchaContainer);
      }
      
      setupRecaptcha("recaptcha-container");
      const confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      return { error: null };
    } catch (error) {
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined as any;
      }
      return { error: error as Error };
    }
  };

  const verifyOtp = async (_phone: string, token: string) => {
    try {
      if (!window.confirmationResult) {
        return { error: new Error("No OTP request found. Please request a new code.") };
      }
      await window.confirmationResult.confirm(token);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithPhone,
        verifyOtp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
