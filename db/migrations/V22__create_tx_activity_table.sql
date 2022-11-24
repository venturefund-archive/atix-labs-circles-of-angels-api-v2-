CREATE TABLE tx_activity (
    id SERIAL PRIMARY KEY,
    "transactionHash" character varying(80) NOT NULL,
    "activityId" integer,
    status public.tx_status DEFAULT 'pending'::public.tx_status,
    "createdAt" date DEFAULT NOW()
);

ALTER TABLE ONLY public.tx_activity
    ADD CONSTRAINT "tx_activity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public.task(id) ON DELETE CASCADE;