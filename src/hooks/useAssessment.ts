import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TOPICS, QUESTIONS, DEFAULT_AREAS, getLevel, type AreaResult } from '@/data/assessmentData';
import type { KPIItem, ChecklistItem } from '@/components/KPIChecklist';

function getSessionId(): string {
  let id = localStorage.getItem('assessment_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('assessment_session_id', id);
  }
  return id;
}

export interface AreaExtra {
  context: string;
  kpis: KPIItem[];
  checklist: ChecklistItem[];
  actionPlanContent: string;
}

export function useAssessment() {
  const [areas, setAreas] = useState<string[]>([...DEFAULT_AREAS]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, AreaResult>>({});
  const [extras, setExtras] = useState<Record<string, AreaExtra>>({});
  const [screen, setScreen] = useState<'home' | 'context' | 'questions' | 'result' | 'consolidated'>('home');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const sessionId = getSessionId();

  // Load saved results from DB
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('assessments')
        .select('*')
        .eq('session_id', sessionId);
      if (data && data.length > 0) {
        const loaded: Record<string, AreaResult> = {};
        const loadedExtras: Record<string, AreaExtra> = {};
        const areaNames = new Set(areas);
        data.forEach((row: any) => {
          loaded[row.area_name] = {
            ts: row.scores as Record<string, number>,
            total: Number(row.total_score),
          };
          loadedExtras[row.area_name] = {
            context: row.area_context || '',
            kpis: (row.kpis as KPIItem[]) || [],
            checklist: (row.checklist as ChecklistItem[]) || [],
            actionPlanContent: row.action_plan_content || '',
          };
          areaNames.add(row.area_name);
        });
        setResults(loaded);
        setExtras(loadedExtras);
        setAreas(Array.from(areaNames));
      }
    };
    load();
  }, [sessionId]);

  const saveResult = useCallback(async (areaName: string, result: AreaResult, ans: Record<number, number>, extra?: Partial<AreaExtra>) => {
    const currentExtra = extras[areaName] || { context: '', kpis: [], checklist: [], actionPlanContent: '' };
    const merged = { ...currentExtra, ...extra };
    
    await supabase.from('assessments').upsert({
      session_id: sessionId,
      area_name: areaName,
      answers: ans,
      scores: result.ts,
      total_score: Number(result.total.toFixed(1)),
      area_context: merged.context,
      kpis: merged.kpis as any,
      checklist: merged.checklist as any,
      action_plan_content: merged.actionPlanContent,
    }, { onConflict: 'session_id,area_name' });
  }, [sessionId, extras]);

  const saveExtras = useCallback(async (areaName: string, extra: Partial<AreaExtra>) => {
    setExtras(prev => ({
      ...prev,
      [areaName]: { ...(prev[areaName] || { context: '', kpis: [], checklist: [], actionPlanContent: '' }), ...extra },
    }));

    const result = results[areaName];
    if (result) {
      const currentExtra = extras[areaName] || { context: '', kpis: [], checklist: [], actionPlanContent: '' };
      const merged = { ...currentExtra, ...extra };
      await supabase.from('assessments').upsert({
        session_id: sessionId,
        area_name: areaName,
        answers: {} as any,
        scores: result.ts,
        total_score: Number(result.total.toFixed(1)),
        area_context: merged.context,
        kpis: merged.kpis as any,
        checklist: merged.checklist as any,
        action_plan_content: merged.actionPlanContent,
      }, { onConflict: 'session_id,area_name' });
    }
  }, [sessionId, results, extras]);

  const startContext = useCallback(() => {
    if (!selectedArea) return false;
    setScreen('context');
    return true;
  }, [selectedArea]);

  const continueFromContext = useCallback((context: string) => {
    if (!selectedArea) return;
    setExtras(prev => ({
      ...prev,
      [selectedArea]: { ...(prev[selectedArea] || { context: '', kpis: [], checklist: [], actionPlanContent: '' }), context },
    }));
    setCurrentQ(0);
    setAnswers({});
    setScreen('questions');
  }, [selectedArea]);

  const selectAnswer = useCallback((questionIndex: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  }, []);

  const nextQuestion = useCallback(() => {
    if (answers[currentQ] === undefined) return;
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      const byT: Record<string, { s: number; n: number }> = {};
      TOPICS.forEach(t => { byT[t.id] = { s: 0, n: 0 }; });
      QUESTIONS.forEach((q, i) => {
        if (answers[i] !== undefined) {
          byT[q.t].s += answers[i];
          byT[q.t].n++;
        }
      });
      const ts: Record<string, number> = {};
      TOPICS.forEach(t => { ts[t.id] = byT[t.id].n ? byT[t.id].s / byT[t.id].n : 0; });
      const total = Object.values(ts).reduce((a, b) => a + b, 0) / TOPICS.length;
      const result: AreaResult = { ts, total };
      
      setResults(prev => ({ ...prev, [selectedArea!]: result }));
      const extra = extras[selectedArea!];
      saveResult(selectedArea!, result, answers, extra);
      setScreen('result');
    }
  }, [currentQ, answers, selectedArea, saveResult, extras]);

  const prevQuestion = useCallback(() => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1);
  }, [currentQ]);

  const addArea = useCallback((name: string) => {
    if (!areas.includes(name)) {
      setAreas(prev => [...prev, name]);
      setSelectedArea(name);
    }
  }, [areas]);

  const renameArea = useCallback((oldName: string, newName: string) => {
    setAreas(prev => prev.map(a => a === oldName ? newName : a));
    if (results[oldName]) {
      setResults(prev => {
        const next = { ...prev, [newName]: prev[oldName] };
        delete next[oldName];
        return next;
      });
    }
    if (extras[oldName]) {
      setExtras(prev => {
        const next = { ...prev, [newName]: prev[oldName] };
        delete next[oldName];
        return next;
      });
    }
    if (selectedArea === oldName) setSelectedArea(newName);
  }, [results, extras, selectedArea]);

  const redoArea = useCallback(async () => {
    if (!selectedArea) return;
    setResults(prev => {
      const next = { ...prev };
      delete next[selectedArea];
      return next;
    });
    await supabase.from('assessments').delete().eq('session_id', sessionId).eq('area_name', selectedArea);
    setScreen('context');
  }, [selectedArea, sessionId]);

  const goHome = useCallback(() => setScreen('home'), []);
  const showConsolidated = useCallback(() => setScreen('consolidated'), []);

  return {
    areas, selectedArea, setSelectedArea, results, extras, screen, sessionId,
    currentQ, answers, startContext, continueFromContext, selectAnswer,
    nextQuestion, prevQuestion, addArea, renameArea,
    redoArea, goHome, showConsolidated, setScreen, saveExtras,
  };
}
