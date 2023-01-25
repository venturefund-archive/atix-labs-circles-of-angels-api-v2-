ALTER TABLE public.task_evidence
  ADD COLUMN "auditorId" uuid
  CONSTRAINT task_evidence_auditorId_fkey REFERENCES "user"(id);