ALTER TABLE public.project DROP COLUMN "status";

DROP TYPE IF EXISTS ProjectStatus;
CREATE TYPE ProjectStatus AS ENUM (
  'draft',
  'published',
  'in progress',
  'in review',
  'completed',
  'canceled',
  'new',
  'toreview',
  'rejected',
  'deleted',
  'consensus',
  'funding',
  'executing',
  'changingscope',
  'finished',
  'aborted',
  'archived',
  'cancelled'
);

ALTER TABLE public.project ALTER COLUMN status TYPE ProjectStatus USING status::text::ProjectStatus;
ALTER TABLE public.project ALTER COLUMN status SET DEFAULT 'draft';