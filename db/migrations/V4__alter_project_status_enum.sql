ALTER TABLE public.project ALTER COLUMN status TYPE VARCHAR(255);
ALTER TABLE public.project ALTER COLUMN status DROP DEFAULT;
DROP TYPE IF EXISTS ProjectStatus;

CREATE TYPE ProjectStatus AS ENUM (
  'new',
  'draft',
  'toreview',
  'rejected',
  'deleted',
  'published',
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