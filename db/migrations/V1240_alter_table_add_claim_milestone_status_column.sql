CREATE TYPE ClaimStatus AS ENUM (
  'pending',
  'claimable',
  'claimed',
  'transferred'
);

ALTER TABLE public.milestone ADD COLUMN "claimStatus" ClaimStatus DEFAULT 'pending';
UPDATE public.milestone SET "claimStatus" = 'pending';
