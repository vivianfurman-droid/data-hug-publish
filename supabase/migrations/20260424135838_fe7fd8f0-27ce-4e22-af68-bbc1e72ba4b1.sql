CREATE TABLE public.session_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  area_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, area_name)
);

ALTER TABLE public.session_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view session_areas" ON public.session_areas FOR SELECT USING (true);
CREATE POLICY "Anyone can insert session_areas" ON public.session_areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update session_areas" ON public.session_areas FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete session_areas" ON public.session_areas FOR DELETE USING (true);

CREATE TRIGGER update_session_areas_updated_at
BEFORE UPDATE ON public.session_areas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_session_areas_session ON public.session_areas(session_id);