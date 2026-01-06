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
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a medical prescription analyzer. Analyze the prescription image and extract the names of medical tests that are recommended or prescribed.

IMPORTANT: Only extract actual medical/diagnostic test names. Do not include medications, dosages, or general instructions.

Common medical tests include:
- Blood tests: CBC, Hemoglobin, Blood Sugar, HbA1c, Lipid Profile, etc.
- Thyroid tests: T3, T4, TSH, Thyroid Profile
- Liver tests: LFT, SGOT, SGPT, Bilirubin
- Kidney tests: KFT, Creatinine, BUN, Uric Acid
- Diabetes tests: Fasting Blood Sugar, Post Prandial Blood Sugar, HbA1c
- Heart tests: ECG, Troponin, BNP
- Vitamin tests: Vitamin D, Vitamin B12, Iron, Ferritin
- Urine tests: Urine Routine, Urine Culture
- Other: X-Ray, Ultrasound, CT Scan, MRI, etc.

Respond with a JSON object in this exact format:
{
  "tests": [
    {
      "name": "Full test name",
      "shortName": "Abbreviation if any",
      "category": "Blood/Thyroid/Liver/Kidney/Diabetes/Heart/Vitamin/Urine/Imaging/Other"
    }
  ],
  "confidence": "high/medium/low",
  "notes": "Any relevant observations about the prescription"
}

If you cannot identify any tests or the image is not a valid prescription, respond with:
{
  "tests": [],
  "confidence": "low",
  "notes": "Explanation of why no tests were found"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this prescription image and extract all medical test names that are prescribed or recommended."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze prescription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the AI response - try to extract JSON
    let parsedResult;
    try {
      // Try to find JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        parsedResult = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      // Return a structured error with the raw response
      parsedResult = {
        tests: [],
        confidence: "low",
        notes: "Could not parse prescription. Please ensure the image is clear and contains medical test recommendations.",
        rawResponse: aiResponse
      };
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-prescription:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
