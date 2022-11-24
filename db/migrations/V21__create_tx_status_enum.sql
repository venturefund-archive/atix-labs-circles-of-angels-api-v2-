CREATE TYPE public.tx_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled'
);