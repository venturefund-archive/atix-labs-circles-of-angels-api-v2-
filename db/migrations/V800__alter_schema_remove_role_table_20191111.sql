ALTER TABLE public.user DROP CONSTRAINT "user_roleId_fkey";
ALTER TABLE public.user DROP COLUMN "roleId";
ALTER TABLE public.user ADD COLUMN role character varying NOT NULL DEFAULT '';
DROP TABLE role;