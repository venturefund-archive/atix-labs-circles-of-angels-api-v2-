ALTER TABLE public.file ADD COLUMN "name" CHARACTER VARYING(50) NOT NULL;
ALTER TABLE public.file ADD COLUMN "size" integer NOT NULL;
ALTER TABLE public.file ADD COLUMN "hash" TEXT NOT NULL;