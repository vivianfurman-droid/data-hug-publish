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

    // Fetch assessment data
    const { data: assessment, error: dbError } = await supabase
      .from("assessments")
      .select("*")
      .eq("session_id", session_id)
      .eq("area_name", area_name)
      .single();

    if (dbError || !assessment) {
      return new Response(JSON.stringify({ error: "Assessment not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scores = assessment.scores as Record<string, number>;
    const totalScore = assessment.total_score;
    const areaContext = assessment.area_context || '';

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um consultor especialista em maturidade de dados, com profundo conhecimento nos frameworks DAMA-DMBOK, Gartner Analytics Maturity Model, McKinsey AI Maturity e Google HEART.

Sua tarefa é analisar os resultados de um diagnóstico de maturidade de dados de uma área de negócio e gerar um plano de ação personalizado, detalhado e prático.

Os domínios avaliados são:
- infra: Arquitetura & Engenharia de Dados (DAMA-DMBOK · Data Architecture & Infrastructure)
- gov: Governança & Qualidade de Dados (DAMA-DMBOK · Data Governance & Quality)
- ind: KPIs, Métricas & Performance (Gartner Analytics Maturity Model)
- dev: Cultura Data-Driven & Experimentação (Google HEART · Lean Analytics · DAMA)
- rel: Analytics & Business Intelligence (Gartner BI Maturity Model)
- ia: AI/ML & Automação Inteligente (McKinsey AI Maturity · TDWI AI Maturity)

A escala vai de 1 (Inicial) a 5 (Transformacional):
- 1.0-1.8: Nível 1 - Inicial
- 1.8-2.6: Nível 2 - Emergente
- 2.6-3.4: Nível 3 - Desenvolvido
- 3.4-4.2: Nível 4 - Avançado
- 4.2-5.0: Nível 5 - Transformacional

Responda SEMPRE em português brasileiro. Use markdown formatado com headers, bullets e bold.

Estruture o plano de ação assim:
## 📊 Diagnóstico Geral
Resumo executivo da situação atual da área.

## 🔴 Pontos Críticos
Os 3 domínios com menor pontuação e por que são prioritários.

## 🎯 Plano de Ação Personalizado
Para cada domínio prioritário, forneça:
### [Nome do domínio] (score: X.X)
- **Ação imediata (1-2 semanas):** ação concreta e específica para a área
- **Curto prazo (1-3 meses):** iniciativa estruturante
- **Médio prazo (3-6 meses):** projeto de transformação
- **Responsável sugerido:** perfil ideal para liderar
- **KPI de sucesso:** como medir progresso

## 🏆 Quick Wins
3-5 ações de alto impacto e baixo esforço que podem ser iniciadas imediatamente.

## 📈 Roadmap de 12 Meses
Timeline trimestral com marcos e entregas esperadas.

Seja ESPECÍFICO para a área de negócio indicada. Não seja genérico. Dê exemplos concretos de ferramentas, processos e métricas.`;

    const userPrompt = `Analise os resultados do diagnóstico de maturidade de dados da área "${area_name}":

${areaContext ? `**Contexto da área:** ${areaContext}\n` : ''}
Pontuação total: ${totalScore}/5.0

Pontuação por domínio:
- Arquitetura & Engenharia de Dados (infra): ${scores.infra?.toFixed(1) || "N/A"}
- Governança & Qualidade de Dados (gov): ${scores.gov?.toFixed(1) || "N/A"}
- KPIs, Métricas & Performance (ind): ${scores.ind?.toFixed(1) || "N/A"}
- Cultura Data-Driven & Experimentação (dev): ${scores.dev?.toFixed(1) || "N/A"}
- Analytics & Business Intelligence (rel): ${scores.rel?.toFixed(1) || "N/A"}
- AI/ML & Automação Inteligente (ia): ${scores.ia?.toFixed(1) || "N/A"}

Gere um plano de ação detalhado e personalizado para a área de ${area_name}.${areaContext ? ` Considere o contexto descrito acima para tornar as recomendações mais específicas e relevantes.` : ''}`;

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
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-action-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
