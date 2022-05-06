ALTER TABLE public.task
DROP CONSTRAINT "task_milestoneId_fkey",
ADD CONSTRAINT "task_milestoneId_fkey"
   FOREIGN KEY ("milestoneId")
   REFERENCES milestone(id)
   ON DELETE CASCADE;