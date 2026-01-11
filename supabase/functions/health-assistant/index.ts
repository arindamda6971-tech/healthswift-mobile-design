import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// List of allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://healthswift.app',
  'https://www.healthswift.app',
];

// Check if origin matches Lovable preview pattern
const isLovablePreview = (origin: string): boolean => {
  return /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(origin) ||
         /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/.test(origin);
};

// Check if origin is localhost for development
const isLocalhost = (origin: string): boolean => {
  return /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
         /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
};

const getCorsHeaders = (request: Request): Record<string, string> => {
  const origin = request.headers.get('origin') || '';
  
  const isAllowed = 
    ALLOWED_ORIGINS.includes(origin) ||
    isLovablePreview(origin) ||
    isLocalhost(origin);
  
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0] || 'https://healthswift.app';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are HealthSwift's AI Health Assistant - a friendly, knowledgeable, and empathetic virtual health advisor. Your role is to help users understand health topics, explain medical tests, provide wellness tips, and guide them through HealthSwift's services.

IMPORTANT GUIDELINES:
1. Always be warm, supportive, and professional
2. Provide accurate, evidence-based health information
3. Never diagnose conditions - always recommend consulting healthcare professionals for medical advice
4. Explain medical terms in simple, easy-to-understand language
5. When discussing tests, explain what they measure, why they're important, and what results might indicate
6. Suggest relevant tests from HealthSwift's catalog when appropriate
7. Encourage preventive health measures and regular check-ups
8. Be culturally sensitive and inclusive
9. If unsure, acknowledge limitations and recommend professional consultation

CRITICAL - TEST RECOMMENDATION FORMAT:
When you recommend tests, you MUST use this exact format for each test so the app can create booking buttons:
[TEST:test_name:price]

For example: "I recommend getting a [TEST:Complete Blood Count (CBC):299] to check your blood health."

AVAILABLE TESTS AT HEALTHSWIFT (use exact names with [TEST:name:price] format when recommending):
- [TEST:Complete Blood Count (CBC):299]
- [TEST:Thyroid Profile:399]
- [TEST:Vitamin D Test:499]
- [TEST:Vitamin B12 Test:399]
- [TEST:Vitamin D & B12 Combo:799]
- [TEST:Liver Function Test:449]
- [TEST:Kidney Function Test:499]
- [TEST:Lipid Profile:349]
- [TEST:HbA1c Test:399]
- [TEST:Full Body Checkup:1499]
- [TEST:Sexual Health Test:1499]
- [TEST:Allergy Panel:1899]
- [TEST:Diabetes Screening:599]
- [TEST:Iron Studies:449]
- [TEST:Urine Routine:149]

Remember: You're here to educate and support, not to replace medical professionals. Always prioritize user safety and well-being. Use the [TEST:name:price] format whenever mentioning a test so users can easily book it.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ error: "Unable to process your request. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Health assistant error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
