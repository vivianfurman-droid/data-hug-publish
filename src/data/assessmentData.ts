export const DEFAULT_AREAS = ['Comercial','Marketing','Operações','Financeiro','RH','Tecnologia','Produto','Logística'];

export interface Topic {
  id: string;
  lb: string;
  short: string;
  ref: string;
}

export const TOPICS: Topic[] = [
  {id:'infra',lb:'Arquitetura & Engenharia de Dados', short:'Engenharia de Dados', ref:'DAMA-DMBOK · Data Architecture & Infrastructure'},
  {id:'gov',  lb:'Governança & Qualidade de Dados',   short:'Governança',          ref:'DAMA-DMBOK · Data Governance & Quality'},
  {id:'ind',  lb:'KPIs, Métricas & Performance',       short:'KPIs & Métricas',    ref:'Gartner Analytics Maturity Model'},
  {id:'dev',  lb:'Cultura Data-Driven & Experimentação',short:'Cultura de Dados',  ref:'Google HEART · Lean Analytics · DAMA'},
  {id:'rel',  lb:'Analytics & Business Intelligence',  short:'Analytics & BI',     ref:'Gartner BI Maturity Model'},
  {id:'ia',   lb:'AI/ML & Automação Inteligente',      short:'AI/ML',              ref:'McKinsey AI Maturity · TDWI AI Maturity'},
];

export interface Question {
  t: string;
  q: string;
  o: { s: number; tx: string }[];
}

export const QUESTIONS: Question[] = [
  {t:'infra',q:'Como os dados da área estão organizados e armazenados?',o:[
    {s:1,tx:'Planilhas isoladas, sem centralização'},
    {s:2,tx:'Banco ou DW local, sem padronização'},
    {s:3,tx:'Dados no Databricks com camadas Bronze/Silver'},
    {s:4,tx:'Camadas Silver e Gold; pipelines confiáveis e monitorados'},
    {s:5,tx:'Lakehouse maduro com dados em tempo real e observabilidade'},
  ]},
  {t:'infra',q:'Qual é o nível de qualidade e documentação dos dados?',o:[
    {s:1,tx:'Sem documentação; erros descobertos reativamente'},
    {s:2,tx:'Verificações manuais pontuais'},
    {s:3,tx:'Dicionário de dados básico; testes automatizados em pipelines'},
    {s:4,tx:'Data catalog ativo; monitoramento contínuo de qualidade'},
    {s:5,tx:'Data observability completo; anomalias detectadas por ML'},
  ]},
  {t:'gov',q:'Como a área gerencia ownership e acesso aos dados?',o:[
    {s:1,tx:'Sem controle; todos acessam tudo'},
    {s:2,tx:'Controle informal, depende de pessoas-chave'},
    {s:3,tx:'Data owners definidos; RBAC parcialmente implementado'},
    {s:4,tx:'Governança completa; compliance com LGPD monitorado'},
    {s:5,tx:'Ownership consolidado; auditoria e compliance automatizados'},
  ]},
  {t:'ind',q:'Qual é o nível de estruturação dos KPIs e indicadores?',o:[
    {s:1,tx:'Sem KPIs definidos; decisões por percepção'},
    {s:2,tx:'Alguns indicadores calculados manualmente'},
    {s:3,tx:'KPIs definidos e calculados de forma consistente'},
    {s:4,tx:'Dashboard automático com histórico e owners por indicador'},
    {s:5,tx:'OKRs integrados; árvore de métricas com alertas automáticos'},
  ]},
  {t:'ind',q:'Com que frequência a área revisa resultados com base em dados?',o:[
    {s:1,tx:'Só em crises; sem rotina estabelecida'},
    {s:2,tx:'Revisão mensal sem estrutura definida'},
    {s:3,tx:'Reunião semanal com dados e pauta estruturada'},
    {s:4,tx:'Ritmo cadenciado (daily/weekly); indicadores com dono'},
    {s:5,tx:'Acompanhamento em tempo real; alertas disparam revisões'},
  ]},
  {t:'dev',q:'Projetos são acompanhados por métricas de sucesso?',o:[
    {s:1,tx:'Sem métricas antes de iniciar; resultado subjetivo'},
    {s:2,tx:'Métricas informais; sem baseline definido'},
    {s:3,tx:'Métricas de sucesso definidas antes; comparadas ao baseline'},
    {s:4,tx:'Experimentos com grupo de controle; análise de impacto'},
    {s:5,tx:'Cultura de A/B test; decisões 100% orientadas por dados'},
  ]},
  {t:'dev',q:'A área realiza testes e experimentos baseados em dados?',o:[
    {s:1,tx:'Mudanças implementadas sem validação'},
    {s:2,tx:'Pilotos informais sem metodologia'},
    {s:3,tx:'Testes com hipóteses definidas e análise pós-implementação'},
    {s:4,tx:'A/B tests frequentes; framework de experimentação ativo'},
    {s:5,tx:'Testes contínuos e automatizados com plataforma dedicada'},
  ]},
  {t:'rel',q:'Como são gerados e consumidos os relatórios e dashboards?',o:[
    {s:1,tx:'Relatórios manuais em Excel; sem frequência definida'},
    {s:2,tx:'Semi-automatizados; alto esforço de preparação'},
    {s:3,tx:'Dashboards em BI (Power BI, Looker) com atualização automática'},
    {s:4,tx:'Self-service analytics; stakeholders autônomos nos dados'},
    {s:5,tx:'Relatórios inteligentes com narrativas e alertas proativos por IA'},
  ]},
  {t:'ia',q:'A área usa automação ou modelos de ML/IA em seus processos?',o:[
    {s:1,tx:'Sem automação; tudo é manual'},
    {s:2,tx:'Scripts simples; casos de uso identificados, não implementados'},
    {s:3,tx:'Workflows automatizados; modelos em produção (churn, previsão)'},
    {s:4,tx:'ML integrado a processos; feedback loop e re-treinamento estruturado'},
    {s:5,tx:'AI-first; modelos auto-ajustados com dados da área'},
  ]},
  {t:'ia',q:'Qual o nível de preparo para agentes autônomos de IA?',o:[
    {s:1,tx:'Sem interesse ou conhecimento sobre agentes de IA'},
    {s:2,tx:'Explorando IA generativa para tarefas pontuais (Copilot)'},
    {s:3,tx:'LLMs integrados a fluxos (análises, resumos automáticos)'},
    {s:4,tx:'Agentes em produção tomando ações com base em dados em tempo real'},
    {s:5,tx:'Ecossistema de agentes autônomos; decisão prescritiva automatizada'},
  ]},
];

export interface Level {
  min: number;
  max: number;
  n: number;
  label: string;
  name: string;
  col: string;
  bg: string;
  desc: string;
  focus: string;
  next: string;
}

export const LEVELS: Level[] = [
  {min:0,max:1.8,n:1,label:'Nível 1',name:'Inicial',col:'#E24B4A',bg:'#FCEBEB',
   desc:'Os dados da área são tratados de forma reativa e fragmentada. Há dependência de planilhas, processos manuais e conhecimento concentrado em pessoas. Indicadores são inexistentes ou informais e as decisões raramente são embasadas em dados.',
   focus:'Antes de qualquer coisa, é preciso estabilizar a base: centralizar os dados em uma única plataforma, definir responsáveis formais e criar 3 KPIs prioritários que toda a equipe acompanhe semanalmente.',
   next:'Nível 2 — Emergente'},
  {min:1.8,max:2.6,n:2,label:'Nível 2',name:'Emergente',col:'#EF9F27',bg:'#FAEEDA',
   desc:'A área começa a se organizar, mas ainda há muita inconsistência. Existem tentativas de estruturar dados e indicadores, porém sem processos consolidados. A confiança nos dados é parcial e gerar relatórios ainda exige muito esforço manual.',
   focus:'O próximo passo é eliminar retrabalho: automatizar o cálculo dos KPIs principais, padronizar dados em uma plataforma centralizada e estabelecer um ritual semanal de revisão de resultados com dados.',
   next:'Nível 3 — Desenvolvido'},
  {min:2.6,max:3.4,n:3,label:'Nível 3',name:'Desenvolvido',col:'#639922',bg:'#EAF3DE',
   desc:'A área já opera com boas práticas de dados. Dashboards funcionam, KPIs estão definidos e há rotina de acompanhamento. O BI está em uso e a confiança nos dados é alta. O desafio é escalar e integrar dados ao ciclo de decisão estratégica.',
   focus:'Com a base estruturada, é hora de sofisticar: introduzir análise preditiva, implementar self-service analytics para os stakeholders e integrar métricas de sucesso a todos os projetos e iniciativas.',
   next:'Nível 4 — Avançado'},
  {min:3.4,max:4.2,n:4,label:'Nível 4',name:'Avançado',col:'#378ADD',bg:'#E6F1FB',
   desc:'A área é referência no uso de dados. Automações e modelos de ML estão em produção, o self-service analytics é realidade e as decisões estratégicas são suportadas por análises preditivas. O próximo diferencial está no ecossistema de IA.',
   focus:'Para atingir o nível máximo, é preciso construir um ecossistema de IA: modelos que re-treinam automaticamente com novos dados, agentes autônomos para tarefas rotineiras e arquitetura orientada a dados em tempo real.',
   next:'Nível 5 — Transformacional'},
  {min:4.2,max:5.1,n:5,label:'Nível 5',name:'Transformacional',col:'#534AB7',bg:'#EEEDFE',
   desc:'A área atingiu o nível máximo de maturidade. Dados fluem em tempo real, IA e agentes autônomos operam continuamente, e as decisões são em grande parte prescritivas — o sistema sugere ou executa ações de forma autônoma.',
   focus:'O desafio agora é sustentação e inovação: garantir ROI claro das iniciativas de IA, disseminar a cultura data-driven para outras áreas e manter-se na fronteira com novos casos de uso.',
   next:'Nível máximo atingido'},
];

export const PRESCRIPTIONS: Record<string, [string, string, string, string, string][]> = {
  infra:[
    ['Curto prazo','#A32D2D','#FCEBEB','Centralizar dados em plataforma única','Migre as principais fontes de dados (ERP, CRM, planilhas) para um data warehouse ou Databricks. Elimine silos e garanta uma única fonte da verdade (Single Source of Truth) para a área.'],
    ['Médio prazo','#854F0B','#FAEEDA','Documentar os dados críticos com data catalog','Crie um dicionário de dados com definições, responsáveis e regras de negócio das principais tabelas. Ferramentas como Unity Catalog ou DataHub reduzem a dependência de pessoas-chave.'],
    ['Longo prazo','#3C3489','#EEEDFE','Implementar data observability e testes automatizados','Adicione validações automáticas nos pipelines (ex: dbt tests, Great Expectations) e monitore anomalias proativamente. Dados confiáveis são pré-requisito para ML e IA.'],
  ],
  gov:[
    ['Curto prazo','#A32D2D','#FCEBEB','Definir data owners por domínio de negócio','Atribua formalmente um responsável para cada conjunto de dados crítico. Essa pessoa valida qualidade, acesso e uso dos dados — sem isso, ninguém é responsável por nada.'],
    ['Médio prazo','#854F0B','#FAEEDA','Implementar controle de acesso baseado em papéis (RBAC)','Documente quem pode acessar o quê e por quê. Implemente RBAC para proteger dados sensíveis e garantir conformidade com a LGPD. Ferramentas: Unity Catalog, IAM, DBT.'],
    ['Longo prazo','#3C3489','#EEEDFE','Automatizar auditoria e monitoramento de compliance','Configure logs de acesso e alertas automáticos para uso fora do padrão. Governança deixa de ser manual e passa a ser monitorada por sistemas — essencial para escala.'],
  ],
  ind:[
    ['Curto prazo','#A32D2D','#FCEBEB','Definir e publicar 3 a 5 KPIs prioritários','Escolha os indicadores que mais impactam o resultado da área, documente as fórmulas e publique em um dashboard acessível a toda equipe. Sem KPIs claros, não há como medir evolução.'],
    ['Médio prazo','#854F0B','#FAEEDA','Criar ritual semanal de revisão com dados','Estabeleça uma reunião cadenciada onde os KPIs são o ponto de partida — não a percepção. Defina um owner para cada indicador que responde pelos resultados.'],
    ['Longo prazo','#3C3489','#EEEDFE','Construir árvore de métricas com alertas automáticos','Conecte KPIs a sub-indicadores (drivers) para entender causas. Configure alertas que notificam automaticamente quando um indicador sai da faixa esperada — sem precisar verificar manualmente.'],
  ],
  dev:[
    ['Curto prazo','#A32D2D','#FCEBEB','Definir métricas de sucesso antes de qualquer projeto','Antes de iniciar qualquer iniciativa, documente: qual problema resolve, qual métrica medirá o sucesso e qual o baseline atual. Sem baseline, é impossível saber se o projeto funcionou.'],
    ['Médio prazo','#854F0B','#FAEEDA','Criar framework simples de experimentação','Implante um template para hipóteses e testes: objetivo, público, métrica primária, critério de sucesso. Registre os aprendizados para consulta futura e tome decisões com evidências.'],
    ['Longo prazo','#3C3489','#EEEDFE','Escalar cultura de A/B test e experimentos contínuos','Implante uma plataforma de experimentação para testar mudanças com grupos de controle antes de escalar. Decisões passam a ser guiadas por evidências — não opiniões ou hierarquia.'],
  ],
  rel:[
    ['Curto prazo','#A32D2D','#FCEBEB','Migrar o relatório mais consumido para BI automatizado','Escolha o relatório com maior impacto e maior esforço de geração. Automatize a atualização e a entrega. Isso libera tempo analítico e aumenta a frequência das análises.'],
    ['Médio prazo','#854F0B','#FAEEDA','Habilitar self-service analytics para a equipe','Treine a equipe para explorar dados de forma autônoma no BI. Crie painéis com filtros e drill-downs. Reduza a dependência de analistas para perguntas de negócio rotineiras.'],
    ['Longo prazo','#3C3489','#EEEDFE','Implementar relatórios inteligentes com IA generativa','Use LLMs para transformar dados em narrativas automáticas, destacando anomalias, tendências e recomendações sem intervenção humana. O relatório passa a ser um assistente estratégico.'],
  ],
  ia:[
    ['Curto prazo','#A32D2D','#FCEBEB','Mapear e automatizar as 3 tarefas mais repetitivas','Identifique processos manuais com alto volume e baixa complexidade decisória. Automatize com scripts, RPA ou integrações via API. Libere tempo para trabalho de maior valor.'],
    ['Médio prazo','#854F0B','#FAEEDA','Implantar o primeiro modelo preditivo em produção','Escolha um caso de uso com dados suficientes (ex: previsão de demanda, propensão ao churn). Implante um modelo simples em produção, meça o impacto e itere.'],
    ['Longo prazo','#3C3489','#EEEDFE','Construir agentes de IA para decisões em tempo real','Integre LLMs e agentes autônomos aos fluxos críticos. Agentes monitoram dados, detectam anomalias e disparam ações automaticamente — reduzindo latência nas decisões operacionais.'],
  ],
};

export const CHART_PALETTE = ['#378ADD','#E24B4A','#EF9F27','#534AB7','#1D9E75','#D85A30'];

export function getLevel(score: number): Level {
  return LEVELS.find(l => score >= l.min && score < l.max) || LEVELS[LEVELS.length - 1];
}

export interface AreaResult {
  ts: Record<string, number>;
  total: number;
}
