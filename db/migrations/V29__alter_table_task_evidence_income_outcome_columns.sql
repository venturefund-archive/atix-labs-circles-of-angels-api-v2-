ALTER TABLE public.task_evidence DROP COLUMN "amount";
ALTER TABLE public.task_evidence ADD COLUMN "income" TEXT NOT NULL DEFAULT '0';
ALTER TABLE public.task_evidence ADD COLUMN "outcome" TEXT NOT NULL DEFAULT '0';