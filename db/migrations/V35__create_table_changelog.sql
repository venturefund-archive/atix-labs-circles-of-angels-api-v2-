CREATE TABLE public.changelog (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER CONSTRAINT "changelog_projectId_fkey" REFERENCES public.project(id),
    "revisionId" INTEGER NOT NULL,
    "milestoneId" INTEGER,
    "activityId" INTEGER,
    "userId" UUID,
    "transactionId" TEXT,
    description TEXT,
    "extraData" TEXT,
    datetime timestamp with time zone DEFAULT now()
);