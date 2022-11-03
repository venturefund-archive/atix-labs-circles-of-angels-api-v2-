ALTER TABLE public.task ADD COLUMN "title" varchar(50) NOT NULL;
ALTER TABLE public.task ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.task ADD COLUMN "acceptanceCriteria" text NOT NULL;
ALTER TABLE public.task ALTER COLUMN budget SET NOT NULL;
ALTER TABLE public.task
  ADD COLUMN "auditorId" uuid NOT NULL
  CONSTRAINT task_auditorId_fkey REFERENCES "user"(id);