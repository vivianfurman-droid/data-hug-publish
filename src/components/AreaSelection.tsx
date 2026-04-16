import { useState } from 'react';

interface AreaSelectionProps {
  areas: string[];
  selectedArea: string | null;
  results: Record<string, { total: number }>;
  onSelect: (area: string) => void;
  onAdd: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onStart: () => boolean;
  onShowConsolidated: () => void;
  onBackToMain?: () => void;
}

export default function AreaSelection({
  areas, selectedArea, results, onSelect, onAdd, onRename, onStart, onShowConsolidated, onBackToMain
}: AreaSelectionProps) {
  const [editIdx, setEditIdx] = useState(-1);
  const [editValue, setEditValue] = useState('');
  const [warning, setWarning] = useState(false);

  const handleStart = () => {
    if (!onStart()) setWarning(true);
  };

  const handleAdd = () => {
    const name = prompt('Nome da nova área:');
    if (name?.trim()) {
      onAdd(name.trim());
      setWarning(false);
    }
  };

  const hasResults = Object.keys(results).length > 0;

  return (
    <div>
      {onBackToMain && (
        <button onClick={onBackToMain} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          ← Voltar
        </button>
      )}
      <h1 className="text-lg font-medium mb-1">Diagnóstico de Maturidade</h1>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        Selecione a área para avaliar. Duplo clique para editar o nome.
      </p>
      
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 mb-4">
        {areas.map((area, i) => (
          editIdx === i ? (
            <div key={area} className="flex flex-col gap-1">
              <input
                className="text-sm px-2 py-2 border-2 border-primary rounded-lg bg-background text-foreground outline-none"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && editValue.trim()) {
                    onRename(area, editValue.trim());
                    setEditIdx(-1);
                  }
                  if (e.key === 'Escape') setEditIdx(-1);
                }}
                maxLength={30}
                autoFocus
                onClick={e => e.stopPropagation()}
              />
              <div className="flex gap-1">
                <button
                  className="flex-1 px-1.5 py-1 text-xs rounded-md bg-primary text-primary-foreground"
                  onClick={() => { if (editValue.trim()) { onRename(area, editValue.trim()); setEditIdx(-1); } }}
                >Salvar</button>
                <button
                  className="flex-1 px-1.5 py-1 text-xs rounded-md border bg-background"
                  onClick={() => setEditIdx(-1)}
                >Cancelar</button>
              </div>
            </div>
          ) : (
            <button
              key={area}
              className={`area-btn ${selectedArea === area ? 'selected' : ''}`}
              onClick={() => { onSelect(area); setWarning(false); }}
              onDoubleClick={e => { e.stopPropagation(); setEditIdx(i); setEditValue(area); }}
            >
              {results[area] && <span className="text-green-600">✓ </span>}
              {area}
              {results[area] && (
                <span className="text-xs text-muted-foreground ml-1">{results[area].total.toFixed(1)}</span>
              )}
              <span className="block text-[10px] text-muted-foreground/60 mt-0.5">duplo clique p/ editar</span>
            </button>
          )
        ))}
      </div>

      <div className="mb-4">
        <button className="px-4 py-2 text-sm border rounded-lg bg-background font-medium hover:bg-muted transition-colors" onClick={handleAdd}>
          + Nova área
        </button>
      </div>

      {warning && <p className="text-sm text-destructive mb-2">Selecione uma área para continuar.</p>}

      <div className="flex gap-2 flex-wrap">
        <button className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity" onClick={handleStart}>
          Iniciar avaliação →
        </button>
        {hasResults && (
          <button className="px-4 py-2 text-sm border rounded-lg bg-background font-medium hover:bg-muted transition-colors" onClick={onShowConsolidated}>
            Ver consolidado
          </button>
        )}
      </div>
    </div>
  );
}
