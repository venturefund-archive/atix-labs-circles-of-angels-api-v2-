CREATE TYPE public.currency_type AS ENUM (
    'fiat',
    'crypto'
);
ALTER TABLE public.project ADD COLUMN "currencyType" public.currency_type;
ALTER TABLE public.project ADD COLUMN "currency" character varying(50);
