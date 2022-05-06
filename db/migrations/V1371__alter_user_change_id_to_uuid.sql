-- Remove all relationships with old user ids --
ALTER TABLE public."answer_question" DROP CONSTRAINT "answer_question_userId_fkey";
ALTER TABLE public."fund_transfer" DROP CONSTRAINT "fund_transfer_senderId_fkey";
ALTER TABLE public."project" DROP CONSTRAINT "project_ownerId_fkey";
ALTER TABLE public."project_experience" DROP CONSTRAINT "project_experience_userId_fkey";
ALTER TABLE public."project_funder" DROP CONSTRAINT "project_funder_userId_fkey";
ALTER TABLE public."project_follower" DROP CONSTRAINT "project_follower_userId_fkey";
ALTER TABLE public."project_oracle" DROP CONSTRAINT "project_oracle_userId_fkey";
ALTER TABLE public."task" DROP CONSTRAINT "task_oracleId_fkey";
ALTER TABLE public."user_wallet" DROP CONSTRAINT "fk_user";


-- Create new UUID v4 column --
create extension "uuid-ossp";
ALTER TABLE public."user" ADD COLUMN uid UUID NOT NULL DEFAULT uuid_generate_v4();

-- Drop old primary key --
ALTER TABLE public."user" DROP CONSTRAINT user_pkey;

-- Rename columns --
ALTER TABLE public."user" RENAME COLUMN "id" TO "id_old";
ALTER TABLE public."user" RENAME COLUMN "uid" TO "id";
-- Add uuid as primary key --
ALTER TABLE public."user" ADD PRIMARY KEY (id);


----------------------------------------------
---------- answer_question -------------
-- Create new uuid column to reference user id ---
ALTER TABLE public."answer_question" ADD COLUMN "userId_2" UUID;

-- Get uuid by old user id --
UPDATE public."answer_question" AS tb
	   SET "userId_2" = us.id
FROM (SELECT id_old, id FROM  public."user") AS us
WHERE tb."userId" = us.id_old;

ALTER TABLE public."answer_question" ALTER COLUMN "userId_2" SET NOT NULL;

-- NOTE: validate if all rows are userId_2 value. If not then complete mannually
-- Rename columns --
ALTER TABLE public."answer_question" RENAME COLUMN "userId" TO "userId_old";
ALTER TABLE public."answer_question" RENAME COLUMN "userId_2" TO "userId";

-- Create foreign key --
ALTER TABLE public."answer_question"
    ADD CONSTRAINT "answer_question_userId_fkey"
	FOREIGN KEY ("userId")
    REFERENCES public."user" (id)
    ON DELETE CASCADE;

ALTER TABLE public."answer_question" 
    ALTER COLUMN "userId_old" drop not null;

--------------------------------------------------
----------------- fund_transfer ------------------
-- Create new uuid column to reference user id ---
ALTER TABLE public."fund_transfer" ADD COLUMN "userId_2" UUID;

-- Get uuid by old user id --
UPDATE public."fund_transfer" AS tb
	   SET "userId_2" = us.id
FROM (SELECT id_old, id FROM  public."user") AS us
WHERE tb."senderId" = us.id_old;

ALTER TABLE public."fund_transfer" ALTER COLUMN "userId_2" SET NOT NULL;

-- NOTE: validate if all rows are userId_2 value. If not then complete mannually
-- Rename columns --
ALTER TABLE public."fund_transfer" RENAME COLUMN "senderId" TO "senderId_old";
ALTER TABLE public."fund_transfer" RENAME COLUMN "userId_2" TO "senderId";

-- Create foreign key --
ALTER TABLE public."fund_transfer"
	ADD CONSTRAINT "fund_transfer_senderId_fkey" 
	FOREIGN KEY ("senderId") 
	REFERENCES public."user" (id);

ALTER TABLE public."fund_transfer" 
    ALTER COLUMN "senderId_old" drop not null;

--------------------------------------------------
-------------------- project ---------------------
-- Create new uuid column to reference user id ---
ALTER TABLE public."project" ADD COLUMN "userId_2" UUID;

-- Get uuid by old user id --
UPDATE public."project" AS tb
	   SET "userId_2" = us.id
FROM (SELECT id_old, id FROM  public."user") AS us
WHERE tb."ownerId" = us.id_old;

ALTER TABLE public."project" ALTER COLUMN "userId_2" SET NOT NULL;

-- NOTE: validate if all rows are userId_2 value. If not then complete mannually
-- Rename columns --
ALTER TABLE public."project" RENAME COLUMN "ownerId" TO "ownerId_old";
ALTER TABLE public."project" RENAME COLUMN "userId_2" TO "ownerId";

-- Create foreign key --
ALTER TABLE public."project"
	ADD CONSTRAINT "project_ownerId_fkey" 
	FOREIGN KEY ("ownerId") 
	REFERENCES public."user" (id);

ALTER TABLE public."project"
    ALTER COLUMN "ownerId_old" drop not null;

--------------------------------------------------
--------------- project_experience ---------------
-- Create new uuid column to reference user id ---
ALTER TABLE public."project_experience" ADD COLUMN "userId_2" UUID;

-- Get uuid by old user id --
UPDATE public."project_experience" AS tb
	   SET "userId_2" = us.id
FROM (SELECT id_old, id FROM  public."user") AS us
WHERE tb."userId" = us.id_old;

ALTER TABLE public."project_experience" ALTER COLUMN "userId_2" SET NOT NULL;

-- NOTE: validate if all rows are userId_2 value. If not then complete mannually
-- Rename columns --
ALTER TABLE public."project_experience" RENAME COLUMN "userId" TO "userId_old";
ALTER TABLE public."project_experience" RENAME COLUMN "userId_2" TO "userId";

-- Create foreign key --
ALTER TABLE public."project_experience"
	ADD CONSTRAINT "project_experience_userId_fkey" 
	FOREIGN KEY ("userId") 
	REFERENCES public."user" (id);

ALTER TABLE public."project_experience"
    ALTER COLUMN "userId_old" drop not null;


--------------------------------------------------
----------------project_funder" ------------------
-- Create new uuid column to reference user id ---
ALTER TABLE public."project_funder" ADD COLUMN "userId_2" UUID NOT NULL;

-- Get uuid by old user id --
UPDATE public."project_funder" AS tb
	   SET "userId_2" = us.id
FROM (SELECT id_old, id FROM  public."user") AS us
WHERE tb."userId" = us.id_old;

ALTER TABLE public."project_funder" ALTER COLUMN "userId_2" SET NOT NULL;

-- NOTE: validate if all rows are userId_2 value. If not then complete mannually
-- Rename columns --
ALTER TABLE public."project_funder" RENAME COLUMN "userId" TO "userId_old";
ALTER TABLE public."project_funder" RENAME COLUMN "userId_2" TO "userId";

-- Create foreign key --
ALTER TABLE public."project_funder"
	ADD CONSTRAINT "project_funder_userId_fkey" 
	FOREIGN KEY ("userId") 
	REFERENCES public."user" (id);

ALTER TABLE public."project_funder"
    ALTER COLUMN "userId_old" drop not null;


--------------------------------------------------
---------------project_follower ------------------
-- Create new uuid column to reference user id ---
ALTER TABLE public."project_follower" ADD COLUMN "userId_2" UUID NOT NULL;

-- Get uuid by old user id --
UPDATE public."project_follower" AS tb
	   SET "userId_2" = us.id
FROM (SELECT id_old, id FROM  public."user") AS us
WHERE tb."userId" = us.id_old;

ALTER TABLE public."project_follower" ALTER COLUMN "userId_2" SET NOT NULL;

-- NOTE: validate if all rows are userId_2 value. If not then complete mannually
-- Rename columns --
ALTER TABLE public."project_follower" RENAME COLUMN "userId" TO "userId_old";
ALTER TABLE public."project_follower" RENAME COLUMN "userId_2" TO "userId";

-- Create foreign key --
ALTER TABLE public."project_follower"
	ADD CONSTRAINT "project_follower_userId_fkey" 
	FOREIGN KEY ("userId") 
	REFERENCES public."user" (id);

ALTER TABLE public."project_follower"
    ALTER COLUMN "userId_old" drop not null;


--------------------------------------------------
------------------ project_oracle ----------------
-- Create new uuid column to reference user id ---
ALTER TABLE public."project_oracle" ADD COLUMN "userId_2" UUID NOT NULL;

-- Get uuid by old user id --
UPDATE public."project_oracle" AS tb
	   SET "userId_2" = us.id
FROM (SELECT id_old, id FROM  public."user") AS us
WHERE tb."userId" = us.id_old;

ALTER TABLE public."project_oracle" ALTER COLUMN "userId_2" SET NOT NULL;

-- NOTE: validate if all rows are userId_2 value. If not then complete mannually
-- Rename columns --
ALTER TABLE public."project_oracle" RENAME COLUMN "userId" TO "userId_old";
ALTER TABLE public."project_oracle" RENAME COLUMN "userId_2" TO "userId";

-- Create foreign key --
ALTER TABLE public."project_oracle"
	ADD CONSTRAINT "project_oracle_userId_fkey" 
	FOREIGN KEY ("userId") 
	REFERENCES public."user" (id);

ALTER TABLE public."project_oracle"
    ALTER COLUMN "userId_old" drop not null;


--------------------------------------------------
-------------------- task ------------------------
-- Create new uuid column to reference user id ---
ALTER TABLE public."task" ADD COLUMN "userId_2" UUID NOT NULL;

-- Get uuid by old user id --
UPDATE public."task" AS tb
	   SET "userId_2" = us.id
FROM (SELECT id_old, id FROM  public."user") AS us
WHERE tb."oracleId" = us.id_old;

ALTER TABLE public."task" ALTER COLUMN "userId_2" SET NOT NULL;

-- NOTE: validate if all rows are userId_2 value. If not then complete mannually
-- Rename columns --
ALTER TABLE public."task" RENAME COLUMN "oracleId" TO "oracleId_old";
ALTER TABLE public."task" RENAME COLUMN "userId_2" TO "oracleId";

-- Create foreign key --
ALTER TABLE public."task"
	ADD CONSTRAINT "task_oracleId_fkey" 
	FOREIGN KEY ("oracleId") 
	REFERENCES public."user" (id);

ALTER TABLE public."task"
    ALTER COLUMN "oracleId_old" drop not null;


--------------------------------------------------
----------------- user_wallet --------------------
-- Create new uuid column to reference user id ---
ALTER TABLE public."user_wallet" ADD COLUMN "userId_2" UUID NOT NULL;

-- Get uuid by old user id --
UPDATE public."user_wallet" AS tb
	   SET "userId_2" = us.id
FROM (SELECT id_old, id FROM  public."user") AS us
WHERE tb."userId" = us.id_old;

ALTER TABLE public."user_wallet" ALTER COLUMN "userId_2" SET NOT NULL;

-- NOTE: validate if all rows are userId_2 value. If not then complete mannually
-- Rename columns --
ALTER TABLE public."user_wallet" RENAME COLUMN "userId" TO "userId_old";
ALTER TABLE public."user_wallet" RENAME COLUMN "userId_2" TO "userId";

-- Create foreign key --
ALTER TABLE public."user_wallet"
	ADD CONSTRAINT "fk_user" 
	FOREIGN KEY ("userId") 
	REFERENCES public."user" (id);

ALTER TABLE public."user_wallet"
    ALTER COLUMN "userId_old" drop not null;


ALTER TABLE public.task
    ALTER COLUMN "oracleId" DROP NOT NULL;
-------------------------------------
---- TODO: remove old user Ids ------
-------------------------------------
