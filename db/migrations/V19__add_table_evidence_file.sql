CREATE TABLE "evidence_file" (
    id SERIAL primary KEY,
    "taskEvidenceId" integer NOT NULL CONSTRAINT "evidence_file_taskEvidenceId_fkey" REFERENCES task_evidence(id),
    "fileId" integer NOT NULL CONSTRAINT "evidence_file_fileId_fkey" REFERENCES file(id)
);