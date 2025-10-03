import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get auth header for supabase
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user profile and documents for context
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fetch user's documents for RAG context
    const { data: documents } = await supabase
      .from("documents")
      .select("file_name, extracted_text")
      .eq("user_id", user.id)
      .limit(5);

    // Build context from profile and documents
    let contextInfo = "Student Profile:\n";
    if (profile) {
      contextInfo += `Name: ${profile.full_name || "Not provided"}\n`;
      contextInfo += `Academic Level: ${profile.academic_level || "Not provided"}\n`;
      contextInfo += `Interests: ${profile.interests?.join(", ") || "Not provided"}\n`;
      contextInfo += `Skills: ${profile.skills?.join(", ") || "Not provided"}\n`;
      if (profile.academic_scores) {
        contextInfo += `Academic Scores: ${JSON.stringify(profile.academic_scores)}\n`;
      }
    }

    // Add document context
    if (documents && documents.length > 0) {
      contextInfo += "\n\nRelevant Documents:\n";
      documents.forEach((doc, idx) => {
        if (doc.extracted_text) {
          contextInfo += `\nDocument ${idx + 1} (${doc.file_name}):\n${doc.extracted_text.substring(0, 2000)}\n`;
        }
      });
    }

    // System prompt for academic guidance
    const systemPrompt = `You are an intelligent Academic Guidance Counselor AI assistant. Your role is to help students make informed decisions about their academic and career paths.

${contextInfo}

Guidelines:
- Provide personalized advice based on the student's profile, interests, skills, and academic background
- Suggest relevant courses, majors, career paths, and learning resources
- Be encouraging and supportive while being realistic
- Ask clarifying questions when needed to better understand their goals
- Reference their uploaded documents when relevant
- Provide actionable steps and concrete recommendations
- Stay focused on academic and career guidance

Keep responses clear, concise, and student-friendly.`;

    // Call Lovable AI Gateway
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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
