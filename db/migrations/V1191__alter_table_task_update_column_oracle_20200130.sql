ALTER TABLE public."task" DROP CONSTRAINT "task_oracleAddress_fkey"; 
ALTER TABLE public."task" DROP COLUMN "oracleAddress";
ALTER TABLE public."task" ADD COLUMN "oracleId" int4 DEFAULT NULL;
ALTER TABLE public."task" ADD CONSTRAINT "task_oracleId_fkey"
   FOREIGN KEY ("oracleId")
   REFERENCES public."user"(id);