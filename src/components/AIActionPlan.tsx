import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2, AlertCircle, Save, CheckCircle } from 'lucide-react';

interface AIActionPlanProps {
  areaName: string;
  sessionId: string;
  savedContent: string;
  onSave: (content: string) => void;
}

export default function AIActionPlan({ areaName, sessionId, savedContent, onSave }: AIActionPlanProps) {
  const [content, setContent] = useState(savedContent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(!!savedContent);
  const [saved, setSaved] = useState(!!savedContent);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setContent('');
    setHasGenerated(true);
    setSaved(false);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-action-plan`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ session_id: sessionId, area_name: areaName }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${resp.status}`);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              accumulated += delta;
              setContent(accumulated);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Auto-save after generation
      if (accumulated) {
        onSave(accumulated);
        setSaved(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [areaName, sessionId, onSave]);

  const handleSave = () => {
    onSave(content);
    setSaved(true);
  };

  if (!hasGenerated) {
    return (
      <button
        onClick={generate}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg"
      >
        <Sparkles className="w-4 h-4" />
        Gerar Plano de Ação com IA
      </button>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <h3 className="text-sm font-medium">Plano de Ação gerado por IA</h3>
        <div className="ml-auto flex items-center gap-2">
          {saved && !isLoading && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="w-3 h-3" />
              Salvo
            </span>
          )}
          {!isLoading && content && !saved && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
            >
              <Save className="w-3 h-3" />
              Salvar
            </button>
          )}
          {!isLoading && content && (
            <button onClick={generate} className="text-xs text-muted-foreground hover:text-foreground">
              Regenerar
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={generate} className="ml-auto underline text-xs">Tentar novamente</button>
        </div>
      )}

      {isLoading && !content && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analisando resultados e gerando plano personalizado...
        </div>
      )}

      {content && (
        <div className="prose prose-sm max-w-none bg-card rounded-xl p-5 border">
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <Loader2 className="w-3 h-3 animate-spin" />
              Gerando...
            </div>
          )}
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
