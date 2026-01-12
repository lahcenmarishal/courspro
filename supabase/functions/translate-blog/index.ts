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
    const { title, excerpt, content, meta_title, meta_description } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un traducteur professionnel français-arabe spécialisé dans le contenu éducatif marocain.

Règles de traduction:
1. Traduis du français vers l'arabe marocain/standard
2. Conserve exactement le même formatage HTML dans le contenu
3. Ne traduis PAS les balises HTML, seulement le texte à l'intérieur
4. Garde le même ton éducatif et professionnel
5. Adapte les expressions idiomatiques au contexte marocain

Réponds UNIQUEMENT avec un objet JSON valide contenant:
{
  "title_ar": "traduction du titre",
  "excerpt_ar": "traduction de l'extrait",
  "content_ar": "traduction du contenu avec HTML préservé",
  "meta_title_ar": "traduction du meta title",
  "meta_description_ar": "traduction de la meta description"
}

Ne mets AUCUN texte avant ou après le JSON.`;

    const userPrompt = `Traduis ce contenu de blog en arabe:

TITRE: ${title || ""}

EXTRAIT: ${excerpt || ""}

CONTENU HTML:
${content || ""}

META TITLE: ${meta_title || ""}

META DESCRIPTION: ${meta_description || ""}`;

    console.log("Calling AI Gateway for translation...");

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes dépassée, réessayez plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants, veuillez ajouter des crédits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    console.log("AI Response received:", aiResponse?.substring(0, 200));

    if (!aiResponse) {
      throw new Error("Empty response from AI");
    }

    // Parse the JSON response - handle potential markdown code blocks
    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.slice(7);
    }
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    const translation = JSON.parse(cleanedResponse);

    return new Response(JSON.stringify(translation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur de traduction" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
