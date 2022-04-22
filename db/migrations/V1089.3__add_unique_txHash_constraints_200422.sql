ALTER TABLE public.task_evidence ADD CONSTRAINT "task_evidence_txHash_key" UNIQUE ("txHash");
ALTER TABLE public.fund_transfer ADD CONSTRAINT "fund_transfer_txHash_key" UNIQUE ("txHash");
ALTER TABLE public.project ADD CONSTRAINT "project_txHash_key" UNIQUE ("txHash");
ALTER TABLE public.transaction ADD CONSTRAINT "transaction_txHash_key" UNIQUE ("txHash");
