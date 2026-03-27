import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * MediLocker AI Chatbot - Direct Gemini API Implementation
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, patientContext } = await req.json();

    // Use GEMINI_API_KEY from Supabase secrets
    // Fallback to hardcoded key provided by user if secret is not set
    const apiKey = Deno.env.get("GEMINI_API_KEY") || 
                   Deno.env.get("LOVABLE_API_KEY") || 
                   "AIzaSyBNB1TG7TUpInM2ecnLMXtlj2P4mjf6Nik";
    
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in Supabase project secrets.");
    }

    // Determine the API endpoint based on the key type
    const isGeminiDirect = apiKey.startsWith("AIza");
    const endpoint = isGeminiDirect 
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`
      : "https://ai.gateway.lovable.dev/v1/chat/completions";

    const doctorPrompt = `You are a professional, empathetic, and knowledgeable Physician Assistant AI integrated into MediLocker.
Your goal is to provide health information while maintaining strict medical safety guardrails.

PERSONA:
- Respond like a compassionate doctor: "I understand your concern...", "Based on your clinical context...".
- Be professional, clear, and evidence-based.

GUARDRAILS:
1. MANDATORY DISCLAIMER: Start every new conversation or serious query by stating you are an AI assistant, not a replacement for a human doctor.
2. EMERGENCY: If the user mentions chest pain, severe bleeding, difficulty breathing, or other emergencies, urge them to call emergency services (911/112) IMMEDIATELY.
3. NO DOSAGES: Never prescribe specific dosages for prescription medications.
4. RECOMMENDATION: Always suggest consulting a human physician for a definitive diagnosis or treatment plan.
5. CONTEXTUAL: Use the provided patient data to tailor your advice but remind them that this is for informational purposes.

Patient Context:
- Name: ${patientContext?.name || "Unknown"}
- Blood Type: ${patientContext?.bloodType || "Unknown"}
- Known Allergies: ${patientContext?.allergies?.join(", ") || "None reported"}

Format your responses with clean Markdown (bullet points, bold text).`;

    // Prepare body for direct Gemini API (Google format) or Gateway (OpenAI format)
    let body;
    if (isGeminiDirect) {
      body = JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `SYSTEM INSTRUCTIONS: ${doctorPrompt}` }] },
          ...messages.map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          }))
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        }
      });
    } else {
      body = JSON.stringify({
        model: "google/gemini-1.5-flash", // Gateway uses this naming
        messages: [
          { role: "system", content: doctorPrompt },
          ...messages,
        ],
        stream: true,
      });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LLM API Error:", response.status, errorText);
      
      // Map common errors to user-friendly messages
      let msg = "The AI service is temporarily unavailable.";
      if (response.status === 401 || response.status === 403) msg = "Invalid API Key. Please check your Supabase secrets.";
      if (response.status === 429) msg = "Rate limit reached. Please try again in a minute.";
      
      return new Response(JSON.stringify({ error: msg }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Gemini SSE stream into standard OpenAI-like stream format for the frontend
    // or just pass through if using the gateway.
    if (isGeminiDirect) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = response.body?.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      (async () => {
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            const chunk = decoder.decode(value);
            
            // Gemini SSE sends blocks with "data: "
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    const openaiChunk = {
                      choices: [{ delta: { content: text } }]
                    };
                    await writer.write(encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON chunks
                }
              }
            }
          }
          await writer.write(encoder.encode("data: [DONE]\n\n"));
        } catch (e) {
          console.error("Stream transformation error", e);
        } finally {
          writer.close();
        }
      })();

      return new Response(readable, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error("Health chat function error:", e);
    return new Response(JSON.stringify({ error: "Server encountered an error while processing the request." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
