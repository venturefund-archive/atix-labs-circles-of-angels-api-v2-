DROP TABLE public.vote;
CREATE TABLE public.vote (
  "id" serial NOT NULL,
  "daoId" int4 NOT NULL,
  "proposalId" int4 NOT NULL,
  "vote" int4 DEFAULT NULL,
  "voter" varchar(42) NOT NULL,
  "txHash" varchar(80) NOT NULL,
  "createdAt" date DEFAULT now(),
  status tx_proposal_status DEFAULT 'notsent',
  PRIMARY KEY (id),
  FOREIGN KEY ("voter") REFERENCES public.user (address),
  UNIQUE ("txHash")
);
