import { useState } from 'react';
import { Plus, Trash2, GripVertical, Check } from 'lucide-react';

export interface KPIItem {
  id: string;
  name: string;
  target: string;
  current: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface KPIChecklistProps {
  kpis: KPIItem[];
  checklist: ChecklistItem[];
  onKPIsChange: (kpis: KPIItem[]) => void;
  onChecklistChange: (checklist: ChecklistItem[]) => void;
}

export default function KPIChecklist({ kpis, checklist, onKPIsChange, onChecklistChange }: KPIChecklistProps) {
  const [newKPI, setNewKPI] = useState({ name: '', target: '', current: '' });
  const [newCheckItem, setNewCheckItem] = useState('');

  const addKPI = () => {
    if (!newKPI.name.trim()) return;
    onKPIsChange([...kpis, { id: crypto.randomUUID(), ...newKPI }]);
    setNewKPI({ name: '', target: '', current: '' });
  };

  const removeKPI = (id: string) => {
    onKPIsChange(kpis.filter(k => k.id !== id));
  };

  const updateKPI = (id: string, field: keyof KPIItem, value: string) => {
    onKPIsChange(kpis.map(k => k.id === id ? { ...k, [field]: value } : k));
  };

  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    onChecklistChange([...checklist, { id: crypto.randomUUID(), text: newCheckItem.trim(), done: false }]);
    setNewCheckItem('');
  };

  const toggleCheckItem = (id: string) => {
    onChecklistChange(checklist.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  const removeCheckItem = (id: string) => {
    onChecklistChange(checklist.filter(c => c.id !== id));
  };

  const doneCount = checklist.filter(c => c.done).length;

  return (
    <div className="space-y-6">
      {/* KPIs Section */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          📊 Métricas de Sucesso & KPIs
          {kpis.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">({kpis.length} definido{kpis.length > 1 ? 's' : ''})</span>
          )}
        </h3>

        {kpis.length > 0 && (
          <div className="space-y-2 mb-3">
            {kpis.map(kpi => (
              <div key={kpi.id} className="bg-card rounded-lg border p-3 flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <input
                    className="w-full text-sm font-medium bg-transparent outline-none border-b border-transparent hover:border-border focus:border-primary transition-colors pb-0.5"
                    value={kpi.name}
                    onChange={e => updateKPI(kpi.id, 'name', e.target.value)}
                    placeholder="Nome do KPI"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Meta</label>
                      <input
                        className="w-full text-xs bg-transparent outline-none border-b border-transparent hover:border-border focus:border-primary transition-colors"
                        value={kpi.target}
                        onChange={e => updateKPI(kpi.id, 'target', e.target.value)}
                        placeholder="Ex: 95%"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Atual</label>
                      <input
                        className="w-full text-xs bg-transparent outline-none border-b border-transparent hover:border-border focus:border-primary transition-colors"
                        value={kpi.current}
                        onChange={e => updateKPI(kpi.id, 'current', e.target.value)}
                        placeholder="Ex: 72%"
                      />
                    </div>
                  </div>
                </div>
                <button onClick={() => removeKPI(kpi.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors mt-0.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <input
              className="w-full text-sm rounded-lg border border-input bg-background px-3 py-2 placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nome do KPI (ex: Taxa de conversão)"
              value={newKPI.name}
              onChange={e => setNewKPI(p => ({ ...p, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addKPI()}
            />
          </div>
          <input
            className="w-20 text-sm rounded-lg border border-input bg-background px-2 py-2 placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            placeholder="Meta"
            value={newKPI.target}
            onChange={e => setNewKPI(p => ({ ...p, target: e.target.value }))}
          />
          <input
            className="w-20 text-sm rounded-lg border border-input bg-background px-2 py-2 placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            placeholder="Atual"
            value={newKPI.current}
            onChange={e => setNewKPI(p => ({ ...p, current: e.target.value }))}
          />
          <button
            onClick={addKPI}
            disabled={!newKPI.name.trim()}
            className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Checklist Section */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          ✅ Checklist de Melhoria
          {checklist.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              ({doneCount}/{checklist.length} concluído{doneCount > 1 ? 's' : ''})
            </span>
          )}
        </h3>

        {checklist.length > 0 && (
          <div className="mb-3">
            <div className="w-full h-1.5 rounded-full bg-muted mb-2.5">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${checklist.length > 0 ? (doneCount / checklist.length * 100) : 0}%` }}
              />
            </div>
            <div className="space-y-1">
              {checklist.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${
                    item.done ? 'bg-green-50 border-green-200' : 'bg-card border-border'
                  }`}
                >
                  <button
                    onClick={() => toggleCheckItem(item.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.done
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-muted-foreground/30 hover:border-primary'
                    }`}
                  >
                    {item.done && <Check className="w-3 h-3" />}
                  </button>
                  <span className={`flex-1 text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                    {item.text}
                  </span>
                  <button onClick={() => removeCheckItem(item.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            className="flex-1 text-sm rounded-lg border border-input bg-background px-3 py-2 placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            placeholder="Nova ação (ex: Documentar os 5 KPIs prioritários)"
            value={newCheckItem}
            onChange={e => setNewCheckItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCheckItem()}
          />
          <button
            onClick={addCheckItem}
            disabled={!newCheckItem.trim()}
            className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
