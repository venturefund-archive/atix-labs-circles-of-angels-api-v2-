CREATE TYPE public.evidence_status AS ENUM (
    'new',
    'approved',
    'rejected'
);
ALTER TABLE public.task_evidence DROP COLUMN "status";
ALTER TABLE public.task_evidence ADD COLUMN "status" public.evidence_status
DEFAULT 'new'::public.evidence_status;