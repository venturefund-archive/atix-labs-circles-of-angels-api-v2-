ALTER TABLE public.changelog RENAME COLUMN "extraData" TO "action";
ALTER TABLE public.changelog ALTER COLUMN "action" SET NOT NULL;