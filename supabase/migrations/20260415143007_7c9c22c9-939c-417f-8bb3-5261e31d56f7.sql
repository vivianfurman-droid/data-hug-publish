ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS area_context text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kpis jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS checklist jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS action_plan_content text DEFAULT '';