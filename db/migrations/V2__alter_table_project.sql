ALTER TYPE public.projectstatus ADD VALUE 'draft' AFTER 'new';
ALTER TABLE public.project ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE public.project ADD COLUMN "timeframeUnit" character varying;
ALTER TABLE public.project ADD COLUMN "dataComplete" int4;