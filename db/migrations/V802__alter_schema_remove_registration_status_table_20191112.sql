ALTER TABLE public.user DROP CONSTRAINT "fk_user_registration_status";
ALTER TABLE public.user DROP COLUMN "registrationStatus";
ALTER TABLE public.user ADD COLUMN blocked boolean NOT NULL DEFAULT false;
DROP TABLE user_registration_status;