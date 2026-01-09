import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

AVAILABLE TESTS AT HEALTHSWIFT (mention when relevant):
- Complete Blood Count (CBC) - ₹299
- Thyroid Profile (T3, T4, TSH) - ₹399
- Vitamin D & B12 - ₹799
- Liver Function Test - ₹449
- Kidney Function Test - ₹499
- Lipid Profile - ₹349
- HbA1c (Diabetes) - ₹399
- Full Body Checkup - ₹1499
- Sexual Health Test - ₹1499
- Allergy Panel - ₹1899

Remember: You're here to educate and support, not to replace medical professionals. Always prioritize user safety and well-being.`;

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
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
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
