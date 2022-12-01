CREATE TABLE public.token (
    id SERIAL PRIMARY KEY,
    "name" CHARACTER VARYING(20) NOT NULL,
    "symbol" CHARACTER VARYING(20) NOT NULL,
    "decimals" INTEGER NOT NULL,
    "apiBaseUrl" TEXT NOT NULL,
    "contractAddress" TEXT
);