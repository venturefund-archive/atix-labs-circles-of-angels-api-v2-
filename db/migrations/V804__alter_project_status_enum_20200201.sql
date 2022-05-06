ALTER TABLE public.project ALTER COLUMN status TYPE VARCHAR(255);
ALTER TABLE public.project ALTER COLUMN status DROP DEFAULT;
DROP TYPE IF EXISTS ProjectStatus;

CREATE TYPE ProjectStatus AS ENUM (
  'new',
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
​
-- UPDATE public.project SET status = 'new' WHERE status = 'draft';
-- UPDATE public.project SET status = 'executing' WHERE status = 'ongoing';
ALTER TABLE public.project ALTER COLUMN status TYPE ProjectStatus USING status::text::ProjectStatus;
ALTER TABLE public.project ALTER COLUMN status SET DEFAULT 'new';