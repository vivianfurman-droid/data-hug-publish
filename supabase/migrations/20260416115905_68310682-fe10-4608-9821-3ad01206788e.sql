
-- KPIs table with tree structure (parent_id for hierarchy)
CREATE TABLE public.area_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  area_name TEXT NOT NULL,
  parent_id UUID REFERENCES public.area_kpis(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_value TEXT,
  current_value TEXT,
  unit TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.area_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view area_kpis" ON public.area_kpis FOR SELECT USING (true);
CREATE POLICY "Anyone can insert area_kpis" ON public.area_kpis FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update area_kpis" ON public.area_kpis FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete area_kpis" ON public.area_kpis FOR DELETE USING (true);

CREATE INDEX idx_area_kpis_session_area ON public.area_kpis(session_id, area_name);
CREATE INDEX idx_area_kpis_parent ON public.area_kpis(parent_id);

CREATE TRIGGER update_area_kpis_updated_at
  BEFORE UPDATE ON public.area_kpis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Checklist items table
CREATE TABLE public.area_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  area_name TEXT NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  priority TEXT DEFAULT 'medium',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.area_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view area_checklist_items" ON public.area_checklist_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert area_checklist_items" ON public.area_checklist_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update area_checklist_items" ON public.area_checklist_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete area_checklist_items" ON public.area_checklist_items FOR DELETE USING (true);

CREATE INDEX idx_area_checklist_session_area ON public.area_checklist_items(session_id, area_name);

CREATE TRIGGER update_area_checklist_items_updated_at
  BEFORE UPDATE ON public.area_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
