ALTER TABLE public.fund_transfer ALTER COLUMN status TYPE VARCHAR(255);
DROP TYPE IF EXISTS tx_funder_status;
CREATE TYPE tx_funder_status AS ENUM(
  'reconciliation',
  'pending',
  'sent',
  'failed',
  'cancelled',
  'verified'
);
ALTER TABLE public.fund_transfer ALTER COLUMN status TYPE tx_funder_status USING status::text::tx_funder_status;
