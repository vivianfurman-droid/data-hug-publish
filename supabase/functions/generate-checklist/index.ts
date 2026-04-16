import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { session_id, area_name } = await req.json();
    if (!session_id || !area_name) {
      return new Response(JSON.stringify({ error: "session_id and area_name are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: assessment } = await supabase
      .from("assessments")
      .select("*")
      .eq("session_id", session_id)
      .eq("area_name", area_name)
      .single();

    if (!assessment) {
      return new Response(JSON.stringify({ error: "Assessment not found. Run diagnosis first." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scores = assessment.scores as Record<string, number>;
    const totalScore = assessment.total_score;
    const areaContext = assessment.area_context || '';

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Você é um consultor especialista em maturidade de dados. Analise o diagnóstico da área "${area_name}" e gere um checklist de ações práticas.

${areaContext ? `Contexto da área: ${areaContext}\n` : ''}
Pontuação total: ${totalScore}/5.0
Scores por domínio:
- Engenharia de Dados: ${scores.infra?.toFixed(1) || "N/A"}
- Governança: ${scores.gov?.toFixed(1) || "N/A"}
- KPIs & Métricas: ${scores.ind?.toFixed(1) || "N/A"}
- Cultura Data-Driven: ${scores.dev?.toFixed(1) || "N/A"}
- Analytics & BI: ${scores.rel?.toFixed(1) || "N/A"}
- AI/ML: ${scores.ia?.toFixed(1) || "N/A"}

Gere entre 8 e 15 ações concretas e específicas para esta área melhorar sua maturidade de dados. Priorize os domínios com menor score.

Cada ação deve ser:
- Específica para a área de ${area_name}
- Mensurável e verificável (pode ser marcada como "feita" ou "não feita")
- Ordenada por prioridade (high, medium, low)

IMPORTANTE: Responda APENAS com um JSON válido, sem markdown, no formato:
{"items": [{"text": "Ação específica aqui", "priority": "high|medium|low"}]}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "generate_checklist",
            description: "Generate a checklist of improvement actions for data maturity",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] }
                    },
                    required: ["text", "priority"],
                    additionalProperties: false
                  }
                }
              },
              required: ["items"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_checklist" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let items = [];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      items = parsed.items || [];
    }

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-checklist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
