import { useState, useEffect } from 'react';

interface ContextScreenProps {
  areaName: string;
  initialContext: string;
  onContinue: (context: string) => void;
  onBack: () => void;
}

export default function ContextScreen({ areaName, initialContext, onContinue, onBack }: ContextScreenProps) {
  const [context, setContext] = useState(initialContext);

  useEffect(() => {
    setContext(initialContext);
  }, [initialContext]);

  return (
    <div>
      <button
        className="px-4 py-2 text-sm border rounded-lg bg-background font-medium hover:bg-muted mb-4"
        onClick={onBack}
      >
        ← Voltar
      </button>

      <h1 className="text-lg font-medium mb-1">Contexto da área: {areaName}</h1>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Antes de iniciar a avaliação, descreva brevemente o contexto da atuação da sua equipe nesta área.
        Isso ajudará a IA a gerar um plano de ação mais personalizado e relevante.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1.5">
          Descreva a atuação da equipe nesta área
        </label>
        <textarea
          className="w-full min-h-[140px] rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
          placeholder={`Ex: A área de ${areaName} é composta por X pessoas, atua com foco em Y, utiliza ferramentas como Z, e tem como principal desafio W...`}
          value={context}
          onChange={e => setContext(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Exemplos: tamanho da equipe, ferramentas usadas, principais desafios, processos atuais, objetivos estratégicos.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          className="px-5 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          onClick={() => onContinue(context)}
        >
          Iniciar avaliação →
        </button>
        <button
          className="px-4 py-2 text-sm border rounded-lg bg-background font-medium hover:bg-muted transition-colors"
          onClick={() => onContinue('')}
        >
          Pular esta etapa
        </button>
      </div>
    </div>
  );
}
