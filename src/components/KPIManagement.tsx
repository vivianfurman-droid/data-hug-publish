import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Plus, Trash2, ChevronRight, ChevronDown, Sparkles, Loader2, Check, Save, CheckCircle, Edit2, AlertCircle } from 'lucide-react';
import { getLevel, type AreaResult } from '@/data/assessmentData';

interface KPI {
  id: string;
  parent_id: string | null;
  name: string;
  target_value: string;
  current_value: string;
  unit: string;
  sort_order: number;
}

interface ChecklistItemData {
  id: string;
  text: string;
  completed: boolean;
  ai_generated: boolean;
  priority: string;
  sort_order: number;
}

interface KPIManagementProps {
  sessionId: string;
  areas: string[];
  results: Record<string, AreaResult>;
  onBack: () => void;
}

export default function KPIManagement({ sessionId, areas, results, onBack }: KPIManagementProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newKPI, setNewKPI] = useState({ name: '', target: '', current: '', unit: '', parentId: null as string | null });
  const [newCheckItem, setNewCheckItem] = useState('');
  const [editingCheck, setEditingCheck] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [generatingChecklist, setGeneratingChecklist] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const loadData = useCallback(async (area: string) => {
    setLoading(true);
    const [kpiRes, checkRes] = await Promise.all([
      supabase.from('area_kpis').select('*').eq('session_id', sessionId).eq('area_name', area).order('sort_order'),
      supabase.from('area_checklist_items').select('*').eq('session_id', sessionId).eq('area_name', area).order('sort_order'),
    ]);
    setKpis((kpiRes.data as KPI[]) || []);
    setChecklist((checkRes.data as ChecklistItemData[]) || []);
    setLoading(false);
    setDirty(false);
  }, [sessionId]);

  useEffect(() => {
    if (selectedArea) loadData(selectedArea);
  }, [selectedArea, loadData]);

  const selectArea = (area: string) => {
    setSelectedArea(area);
    setExpanded(new Set());
  };

  // KPI tree helpers
  const rootKPIs = kpis.filter(k => !k.parent_id);
  const childrenOf = (parentId: string) => kpis.filter(k => k.parent_id === parentId);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addKPI = async () => {
    if (!newKPI.name.trim() || !selectedArea) return;
    const { data } = await supabase.from('area_kpis').insert({
      session_id: sessionId,
      area_name: selectedArea,
      parent_id: newKPI.parentId,
      name: newKPI.name.trim(),
      target_value: newKPI.target,
      current_value: newKPI.current,
      unit: newKPI.unit,
      sort_order: kpis.length,
    }).select().single();
    if (data) {
      setKpis(prev => [...prev, data as KPI]);
      if (newKPI.parentId) setExpanded(prev => new Set(prev).add(newKPI.parentId!));
    }
    setNewKPI({ name: '', target: '', current: '', unit: '', parentId: null });
  };

  const deleteKPI = async (id: string) => {
    await supabase.from('area_kpis').delete().eq('id', id);
    setKpis(prev => prev.filter(k => k.id !== id && k.parent_id !== id));
  };

  const addCheckItem = async () => {
    if (!newCheckItem.trim() || !selectedArea) return;
    const { data } = await supabase.from('area_checklist_items').insert({
      session_id: sessionId,
      area_name: selectedArea,
      text: newCheckItem.trim(),
      completed: false,
      ai_generated: false,
      priority: 'medium',
      sort_order: checklist.length,
    }).select().single();
    if (data) setChecklist(prev => [...prev, data as ChecklistItemData]);
    setNewCheckItem('');
  };

  const toggleCheck = async (id: string) => {
    const item = checklist.find(c => c.id === id);
    if (!item) return;
    await supabase.from('area_checklist_items').update({ completed: !item.completed }).eq('id', id);
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const deleteCheck = async (id: string) => {
    await supabase.from('area_checklist_items').delete().eq('id', id);
    setChecklist(prev => prev.filter(c => c.id !== id));
  };

  const saveCheckEdit = async (id: string) => {
    if (!editText.trim()) return;
    await supabase.from('area_checklist_items').update({ text: editText.trim() }).eq('id', id);
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, text: editText.trim() } : c));
    setEditingCheck(null);
  };

  const generateChecklist = async () => {
    if (!selectedArea) return;
    setGeneratingChecklist(true);
    setGenError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-checklist`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ session_id: sessionId, area_name: selectedArea }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${resp.status}`);
      }
      const { items } = await resp.json();
      if (items?.length) {
        // Insert all items
        const toInsert = items.map((item: any, i: number) => ({
          session_id: sessionId,
          area_name: selectedArea,
          text: item.text,
          completed: false,
          ai_generated: true,
          priority: item.priority || 'medium',
          sort_order: checklist.length + i,
        }));
        const { data } = await supabase.from('area_checklist_items').insert(toInsert).select();
        if (data) setChecklist(prev => [...prev, ...(data as ChecklistItemData[])]);
      }
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setGeneratingChecklist(false);
    }
  };

  const doneCount = checklist.filter(c => c.completed).length;

  // Area list screen
  if (!selectedArea) {
    const assessedAreas = areas.filter(a => results[a]);
    const notAssessed = areas.filter(a => !results[a]);

    return (
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h1 className="text-lg font-medium mb-1">Gestão de KPIs & Checklist</h1>
        <p className="text-sm text-muted-foreground mb-5">
          Selecione uma área avaliada para gerenciar seus indicadores e checklist de ações.
        </p>

        {assessedAreas.length > 0 && (
          <div className="space-y-2 mb-5">
            {assessedAreas.map(area => {
              const r = results[area];
              const level = getLevel(r.total);
              return (
                <button
                  key={area}
                  onClick={() => selectArea(area)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border bg-card text-left hover:border-primary/40 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ background: level.bg, color: level.col }}
                  >
                    {r.total.toFixed(1)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{area}</div>
                    <div className="text-xs text-muted-foreground">{level.label} — {level.name}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}

        {notAssessed.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Áreas ainda não avaliadas</p>
            <div className="flex flex-wrap gap-2">
              {notAssessed.map(area => (
                <span key={area} className="text-xs px-3 py-1.5 rounded-lg border bg-muted/50 text-muted-foreground">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const areaResult = results[selectedArea];
  const level = areaResult ? getLevel(areaResult.total) : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setSelectedArea(null)} className="text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-medium">{selectedArea}</h1>
          {level && (
            <span className="text-xs" style={{ color: level.col }}>
              {level.label} — {level.name} · {areaResult!.total.toFixed(1)}/5.0
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando...
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Tree */}
          <section>
            <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
              📊 Árvore de Indicadores
              {kpis.length > 0 && <span className="text-xs text-muted-foreground font-normal">({kpis.length})</span>}
            </h2>

            {rootKPIs.length > 0 && (
              <div className="space-y-1 mb-4">
                {rootKPIs.map(kpi => (
                  <KPINode
                    key={kpi.id}
                    kpi={kpi}
                    children={childrenOf(kpi.id)}
                    expanded={expanded.has(kpi.id)}
                    onToggle={() => toggleExpand(kpi.id)}
                    onDelete={deleteKPI}
                    onAddChild={(parentId) => setNewKPI(prev => ({ ...prev, parentId }))}
                    depth={0}
                  />
                ))}
              </div>
            )}

            {/* Add KPI form */}
            <div className="bg-muted/30 rounded-lg p-3 border border-dashed border-border">
              {newKPI.parentId && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">
                    Sub-indicador de: <strong>{kpis.find(k => k.id === newKPI.parentId)?.name}</strong>
                  </span>
                  <button onClick={() => setNewKPI(p => ({ ...p, parentId: null }))} className="text-xs text-destructive hover:underline">
                    cancelar
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-end flex-wrap">
                <input
                  className="flex-1 min-w-[200px] text-sm rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nome do indicador"
                  value={newKPI.name}
                  onChange={e => setNewKPI(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addKPI()}
                />
                <input
                  className="w-20 text-sm rounded-lg border border-input bg-background px-2 py-2 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Meta"
                  value={newKPI.target}
                  onChange={e => setNewKPI(p => ({ ...p, target: e.target.value }))}
                />
                <input
                  className="w-20 text-sm rounded-lg border border-input bg-background px-2 py-2 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Atual"
                  value={newKPI.current}
                  onChange={e => setNewKPI(p => ({ ...p, current: e.target.value }))}
                />
                <input
                  className="w-16 text-sm rounded-lg border border-input bg-background px-2 py-2 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Un."
                  value={newKPI.unit}
                  onChange={e => setNewKPI(p => ({ ...p, unit: e.target.value }))}
                />
                <button
                  onClick={addKPI}
                  disabled={!newKPI.name.trim()}
                  className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Checklist */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium flex items-center gap-2">
                ✅ Checklist de Ações
                {checklist.length > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({doneCount}/{checklist.length})
                  </span>
                )}
              </h2>
              <button
                onClick={generateChecklist}
                disabled={generatingChecklist || !areaResult}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {generatingChecklist ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Gerando...</>
                ) : (
                  <><Sparkles className="w-3 h-3" /> Gerar com IA</>
                )}
              </button>
            </div>

            {genError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {genError}
              </div>
            )}

            {!areaResult && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-3">
                ⚠️ Faça o diagnóstico desta área primeiro para gerar checklist com IA.
              </p>
            )}

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
                        item.completed ? 'bg-green-50 border-green-200' : 'bg-card border-border'
                      }`}
                    >
                      <button
                        onClick={() => toggleCheck(item.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          item.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-muted-foreground/30 hover:border-primary'
                        }`}
                      >
                        {item.completed && <Check className="w-3 h-3" />}
                      </button>
                      {editingCheck === item.id ? (
                        <input
                          className="flex-1 text-sm bg-transparent outline-none border-b border-primary"
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveCheckEdit(item.id); if (e.key === 'Escape') setEditingCheck(null); }}
                          onBlur={() => saveCheckEdit(item.id)}
                          autoFocus
                        />
                      ) : (
                        <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.text}
                          {item.ai_generated && (
                            <Sparkles className="inline w-3 h-3 text-purple-400 ml-1.5" />
                          )}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        {editingCheck !== item.id && (
                          <button
                            onClick={() => { setEditingCheck(item.id); setEditText(item.text); }}
                            className="text-muted-foreground/40 hover:text-foreground transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => deleteCheck(item.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add manual item */}
            <div className="flex gap-2">
              <input
                className="flex-1 text-sm rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                placeholder="Adicionar ação manualmente..."
                value={newCheckItem}
                onChange={e => setNewCheckItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCheckItem()}
              />
              <button
                onClick={addCheckItem}
                disabled={!newCheckItem.trim()}
                className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// KPI tree node component
function KPINode({ kpi, children, expanded, onToggle, onDelete, onAddChild, depth }: {
  kpi: KPI;
  children: KPI[];
  expanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  depth: number;
}) {
  const hasChildren = children.length > 0;

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
        {hasChildren ? (
          <button onClick={onToggle} className="text-muted-foreground">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{kpi.name}</div>
          {(kpi.target_value || kpi.current_value) && (
            <div className="text-xs text-muted-foreground">
              {kpi.current_value && <span>Atual: {kpi.current_value}{kpi.unit && ` ${kpi.unit}`}</span>}
              {kpi.current_value && kpi.target_value && <span className="mx-1.5">·</span>}
              {kpi.target_value && <span>Meta: {kpi.target_value}{kpi.unit && ` ${kpi.unit}`}</span>}
            </div>
          )}
        </div>
        <button
          onClick={() => onAddChild(kpi.id)}
          className="text-muted-foreground/40 hover:text-primary transition-colors"
          title="Adicionar sub-indicador"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(kpi.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {expanded && hasChildren && (
        <div className="mt-1 space-y-1">
          {children.map(child => (
            <KPINode
              key={child.id}
              kpi={child}
              children={[]}
              expanded={false}
              onToggle={() => {}}
              onDelete={onDelete}
              onAddChild={onAddChild}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
