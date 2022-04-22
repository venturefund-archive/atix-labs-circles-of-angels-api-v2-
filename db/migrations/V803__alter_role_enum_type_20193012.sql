ALTER TABLE public.user ALTER COLUMN role TYPE VARCHAR(255);
DROP TYPE IF EXISTS ROLE;

CREATE TYPE ROLE AS ENUM(
  'admin',
  'entrepreneur',
  'supporter',
  'curator',
  'bankoperator'
);

UPDATE public.user SET role = 'supporter' WHERE role = 'oracle' OR role = 'funder';
ALTER TABLE public.user ALTER COLUMN role TYPE ROLE USING role::text::ROLE;