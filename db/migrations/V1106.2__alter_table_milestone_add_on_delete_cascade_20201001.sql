ALTER TABLE public.milestone
DROP CONSTRAINT "milestone_projectId_fkey",
ADD CONSTRAINT "milestone_projectId_fkey"
   FOREIGN KEY ("projectId")
   REFERENCES project(id)
   ON DELETE CASCADE;