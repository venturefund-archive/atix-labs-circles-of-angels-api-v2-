CREATE TABLE public.task_evidence (
    -- this id is needed because the ORM can't handle composite pks
	"id" serial NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
	"description"  varchar(80) DEFAULT NULL,
	"proof" text NOT NULL,
	"approved" boolean DEFAULT NULL,
	"taskId" int4 NOT NULL,
	CONSTRAINT task_evidence_pkey PRIMARY KEY ("id"),
	CONSTRAINT "task_evidence_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES task(id)
);