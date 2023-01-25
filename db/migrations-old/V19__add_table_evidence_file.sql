ALTER TABLE ONLY public.task_evidence ADD CONSTRAINT task_evidence_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.file ADD CONSTRAINT file_pkey PRIMARY KEY (id);

CREATE TABLE "evidence_file" (
    id SERIAL primary KEY,
    "taskEvidenceId" integer NOT NULL CONSTRAINT "evidence_file_taskEvidenceId_fkey" REFERENCES task_evidence(id),
    "fileId" integer NOT NULL CONSTRAINT "evidence_file_fileId_fkey" REFERENCES file(id)
);