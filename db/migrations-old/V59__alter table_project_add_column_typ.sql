CREATE TYPE public.project_type AS ENUM (
    'grant',
    'loan'
);

ALTER TABLE public.project ADD COLUMN type public.project_type;