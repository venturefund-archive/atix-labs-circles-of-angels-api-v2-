ALTER TABLE public.task_evidence ALTER COLUMN "proof" DROP NOT NULL;

ALTER TABLE public.task_evidence ALTER COLUMN "description" SET DATA TYPE CHARACTER VARYING(500);
ALTER TABLE public.task_evidence ALTER COLUMN "description" SET NOT NULL;

ALTER TABLE public.task_evidence ADD COLUMN "title" CHARACTER VARYING(50) NOT NULL;
ALTER TABLE public.task_evidence ADD COLUMN "type" public.evidence_type NOT NULL;
ALTER TABLE public.task_evidence ADD COLUMN "amount" TEXT;
ALTER TABLE public.task_evidence ADD COLUMN "transferTxHash" TEXT;