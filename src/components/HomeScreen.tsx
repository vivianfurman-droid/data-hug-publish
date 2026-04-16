import { BarChart3, Target } from 'lucide-react';

interface HomeScreenProps {
  onDiagnosis: () => void;
  onKPIManagement: () => void;
}

export default function HomeScreen({ onDiagnosis, onKPIManagement }: HomeScreenProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold mb-1.5">Data Maturity Hub</h1>
        <p className="text-sm text-muted-foreground">
          Avalie a maturidade de dados das suas áreas e gerencie indicadores de evolução.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Diagnosis Card */}
        <button
          onClick={onDiagnosis}
          className="group bg-card rounded-xl border p-6 text-left transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
            style={{ background: 'hsl(var(--level-4-bg))', color: 'hsl(var(--level-4))' }}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-medium mb-1.5 group-hover:text-primary transition-colors">
            Diagnóstico de Maturidade
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Avalie cada área da empresa nos 6 domínios de maturidade de dados. Receba um diagnóstico completo com radar, plano de ação e recomendações com IA.
          </p>
          <div className="mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Acessar →
          </div>
        </button>

        {/* KPI Management Card */}
        <button
          onClick={onKPIManagement}
          className="group bg-card rounded-xl border p-6 text-left transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
            style={{ background: 'hsl(var(--level-5-bg))', color: 'hsl(var(--level-5))' }}
          >
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-base font-medium mb-1.5 group-hover:text-primary transition-colors">
            Gestão de KPIs & Checklist
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Crie a árvore de indicadores de cada área, defina metas e acompanhe a evolução. Receba checklists de ações sugeridas pela IA com base na maturidade.
          </p>
          <div className="mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Acessar →
          </div>
        </button>
      </div>
    </div>
  );
}
