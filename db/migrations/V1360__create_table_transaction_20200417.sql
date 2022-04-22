DROP TABLE public.transaction;
CREATE TABLE public.transaction (
	id SERIAL NOT NULL,
	sender varchar(42) NOT NULL,
  "txHash" varchar(80) NOT NULL,
  nonce int4 NOT NULL,
  "createdAt" date DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY ("sender") REFERENCES public.user (address)
);
