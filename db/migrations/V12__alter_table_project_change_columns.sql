ALTER TABLE public.project ALTER COLUMN timeframe SET DATA TYPE NUMERIC(6,3) USING timeframe::NUMERIC(6,3);
ALTER TABLE public.project ALTER COLUMN "dataComplete" SET NOT NULL;
ALTER TABLE public.project ALTER COLUMN "dataComplete" SET DEFAULT 0;
ALTER TABLE public.project ALTER COLUMN "goalAmount" SET NOT NULL;
ALTER TABLE public.project ALTER COLUMN "goalAmount" SET DEFAULT '0';