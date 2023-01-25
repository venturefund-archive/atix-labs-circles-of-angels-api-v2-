ALTER TABLE public.project DROP COLUMN type;
DROP TYPE public.project_type;

ALTER TABLE public.project ADD COLUMN type TEXT;