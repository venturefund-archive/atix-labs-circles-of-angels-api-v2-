CREATE TYPE tx_evidence_status AS ENUM(
  'notsent',
  'sent',
  'confirmed',
  'failed'
);
ALTER TABLE public.task_evidence ADD status tx_evidence_status DEFAULT 'notsent';

-- update existing rows
