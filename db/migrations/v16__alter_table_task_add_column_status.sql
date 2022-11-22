CREATE TYPE public.task_status AS ENUM (
    'new',
    'to-review',
    'approved',
    'rejected'
);

ALTER TABLE public.task ADD COLUMN "status" public.task_status DEFAULT 'new'::public.task_status;