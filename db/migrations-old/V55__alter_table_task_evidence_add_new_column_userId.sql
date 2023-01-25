ALTER TABLE public.task_evidence
  ADD COLUMN "userId" uuid
  CONSTRAINT task_evidence_userId_fkey REFERENCES "user"(id);