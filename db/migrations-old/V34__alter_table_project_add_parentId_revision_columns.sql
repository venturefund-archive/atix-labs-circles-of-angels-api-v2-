ALTER TABLE public.project ADD COLUMN "parentId" INTEGER;
ALTER TABLE public.project ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1;