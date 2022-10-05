CREATE TYPE ROLE AS ENUM(
  'admin',
  'entrepreneur',
  'supporter',
  'curator',
  'bankoperator'
);

CREATE TYPE tx_funder_status AS ENUM(
  'reconciliation',
  'pending',
  'sent',
  'failed',
  'cancelled',
  'verified'
);

CREATE TABLE public.country (
    id SERIAL NOT NULL,
    "name" varchar(42) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE public.user (
    id SERIAL NOT NULL,
    "firstName" varchar(80) NOT NULL,
    "lastName" varchar(80),
    "phoneNumber" varchar(80) DEFAULT NULL,
    "company" varchar(80) DEFAULT NULL,
    "countryId" int4 DEFAULT NULL,
    email varchar(40) NOT NULL,
    password varchar(80) NOT NULL,
    "role" ROLE NOT NULL,
    "answers" text DEFAULT NULL,
    "createdAt" date DEFAULT now(),
    address varchar(42) NOT NULL,
    "encryptedWallet" json NOT NULL,
    "mnemonic" varchar(200),
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    "forcePasswordChange" BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    UNIQUE (email),
    UNIQUE (address),
    CONSTRAINT "user_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES public."country"(id)
);

CREATE TYPE ProjectStatus AS ENUM (
  'new',
  'toreview',
  'rejected',
  'deleted',
  'published',
  'consensus',
  'funding',
  'executing',
  'changingscope',
  'finished',
  'aborted',
  'archived',
  'cancelled'
);

CREATE TYPE ClaimStatus AS ENUM (
  'pending',
  'claimable',
  'claimed',
  'transferred'
);

CREATE TYPE tx_evidence_status AS ENUM(
  'notsent',
  'sent',
  'confirmed',
  'failed'
);

CREATE TYPE tx_proposal_status AS ENUM(
  'notsent',
  'sent',
  'confirmed',
  'failed'
);

CREATE TABLE public.project (
    id SERIAL NOT NULL,
    "projectName" varchar(50) NOT NULL,
    "ownerId" integer NOT NULL,
    "createdAt" date DEFAULT NOW(),
    "address" varchar(42) DEFAULT NULL,
    mission text,
    location text,
    "problemAddressed" text,
    timeframe text,
    status ProjectStatus DEFAULT 'new',
    "goalAmount" numeric NOT NULL,
    "faqLink" text,
    "coverPhotoPath" varchar(200),
    "cardPhotoPath" varchar(200),
    "milestonePath" varchar(200),
    proposal text, -- html
	"proposalFilePath" varchar(200) NULL, -- file
    "agreementJson" text, -- coa generated
    "agreementFilePath" varchar(200) NULL, -- user uploaded
    "consensusSeconds" int4 DEFAULT 864000, -- 10 days. TODO: change this default
    "fundingSeconds" int4 DEFAULT 864000, -- 10 days. TODO: change this default
    "lastUpdatedStatusAt" timestamp with time zone DEFAULT NOW(),
    "txHash" varchar(80) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("ownerId") REFERENCES public.user (id),
    UNIQUE ("txHash")
);

CREATE TABLE public."featured_project" (
    id SERIAL NOT NULL, --needed because ORM
    "projectId" int4 NOT NULL,
    PRIMARY KEY (id),
	CONSTRAINT "featured_project_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES project(id)
);

CREATE TABLE public.project_funder (
    -- this id is needed because the ORM can't handle composite pks
	"id" serial NOT NULL,
	"projectId" int4 NOT NULL,
	"userId" int4 NOT NULL,
	CONSTRAINT project_funder_pkey PRIMARY KEY ("id"),
	CONSTRAINT "project_funder_projectId_userId_key" UNIQUE ("projectId", "userId"),
	CONSTRAINT "project_funder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES project(id),
	CONSTRAINT "project_funder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"(id)
);

CREATE TABLE public.project_oracle (
    -- this id is needed because the ORM can't handle composite pks
	"id" serial NOT NULL,
	"projectId" int4 NOT NULL,
	"userId" int4 NOT NULL,
	CONSTRAINT project_oracle_pkey PRIMARY KEY ("id"),
	CONSTRAINT "project_oracle_projectId_userId_key" UNIQUE ("projectId", "userId"),
	CONSTRAINT "project_oracle_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES project(id),
	CONSTRAINT "project_oracle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"(id)
);

CREATE TABLE public.project_follower (
    -- this id is needed because the ORM can't handle composite pks
	"id" serial NOT NULL,
	"projectId" int4 NOT NULL,
	"userId" int4 NOT NULL,
	CONSTRAINT project_follower_pkey PRIMARY KEY ("id"),
	CONSTRAINT "project_follower_projectId_userId_key" UNIQUE ("projectId", "userId"),
	CONSTRAINT "project_follower_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES project(id),
	CONSTRAINT "project_follower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"(id)
);

CREATE TABLE public.milestone (
    id SERIAL NOT NULL,
    "projectId" int,
    "createdAt" date DEFAULT NOW(),
    description text,
    category text,
    "claimStatus" ClaimStatus DEFAULT 'pending',
    "claimReceiptPath" varchar(200) NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("projectId") REFERENCES public.project (id) ON DELETE CASCADE
);

-- CREATE TABLE public.activity (
CREATE TABLE public.task (
    id SERIAL NOT NULL,
    "milestoneId" int,
    "createdAt" date DEFAULT NOW(),
    "taskHash" varchar(80) DEFAULT NULL,
    "oracleId" int4 DEFAULT NULL,
    description text, -- TODO : should be NOT NULL
    "reviewCriteria" text,
    category text,
    "keyPersonnel" text,
    budget text,
    PRIMARY KEY (id),
    FOREIGN KEY ("milestoneId") REFERENCES public.milestone (id) ON DELETE CASCADE,
    CONSTRAINT "task_oracleId_fkey" FOREIGN KEY ("oracleId") REFERENCES public."user"(id)
);

CREATE TABLE public.task_evidence (
    -- this id is needed because the ORM can't handle composite pks
	"id" serial NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
	"description"  varchar(80) DEFAULT NULL,
	"proof" text NOT NULL,
	"approved" boolean DEFAULT NULL,
	"taskId" int4 NOT NULL,
    "txHash" varchar(80) DEFAULT NULL,
    status tx_evidence_status DEFAULT 'notsent',
	CONSTRAINT task_evidence_pkey PRIMARY KEY ("id"),
	CONSTRAINT "task_evidence_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES task(id),
    UNIQUE ("txHash")
);

CREATE TABLE public.proposal (
    -- this id is needed because the ORM can't handle composite pks
	"id" serial NOT NULL,
	"proposalId" int4 DEFAULT NULL,
    "daoId" int4 NOT NULL,
    "applicant" varchar(42) NOT NULL,
    "proposer" varchar(42) NOT NULL,
    "description" text,
    "type" int4 NOT NULL,
    "txHash" varchar(80) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    status tx_proposal_status DEFAULT 'notsent',
	CONSTRAINT proposal_pkey PRIMARY KEY ("id"),
    FOREIGN KEY ("applicant") REFERENCES public.user (address),
    FOREIGN KEY ("proposer") REFERENCES public.user (address),
    UNIQUE ("txHash")
);

CREATE TABLE public.vote (
    -- this id is needed because the ORM can't handle composite pks
	"id" serial NOT NULL,
    "daoId" int4 NOT NULL,
	"proposalId" int4 NOT NULL,
    "vote" int4 NOT NULL,
    "voter" varchar(42) NOT NULL,
    "txHash" varchar(80) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    status tx_proposal_status DEFAULT 'notsent',
	CONSTRAINT vote_pkey PRIMARY KEY ("id"),
    FOREIGN KEY ("voter") REFERENCES public.user (address),
    UNIQUE ("txHash")
);

CREATE TABLE public.transaction (
	id SERIAL NOT NULL,
	sender varchar(42) NOT NULL,
    "txHash" varchar(80) NOT NULL,
    "createdAt" date DEFAULT now(),
    nonce int4 NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("sender") REFERENCES public.user (address),
    UNIQUE ("txHash")
);

CREATE TABLE public.project_experience (
    id SERIAL NOT NULL,
    "projectId" int,
    "userId" int,
    comment text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("projectId") REFERENCES public.project (id),
    FOREIGN KEY ("userId") REFERENCES public.user (id)
);

CREATE TABLE public.project_experience_photo (
    id SERIAL NOT NULL,
    path varchar(200) NOT NULL,
    "projectExperienceId" int NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("projectExperienceId") REFERENCES public.project_experience (id)
);

CREATE TABLE public.fund_transfer (
    id SERIAL NOT NULL,
    "transferId" varchar(80) NOT NULL,
    "destinationAccount" varchar(80) NOT NULL,
    "receiptPath" text NOT NULL,
    amount real NOT NULL,
    currency varchar(10) NOT NULL,
    "senderId" int NOT NULL,
    "projectId" int NOT NULL,
    status TX_FUNDER_STATUS NOT NULL,
    "createdAt" DATE,
    "rejectionReason" varchar(80) DEFAULT NULL,
    "txHash" varchar(80) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("projectId") REFERENCES public.project (id),
    FOREIGN KEY ("senderId") REFERENCES public.user (id),
    UNIQUE ("txHash")
);

CREATE TABLE public.pass_recovery (
    id SERIAL NOT NULL,
    token varchar(80) NOT NULL,
    email varchar(80) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);

CREATE TABLE public.question (
    id SERIAL NOT NULL,
    question text NOT NULL,
    --type enum('text', 'single option', 'multiple options') --
    PRIMARY KEY (id)
);

CREATE TABLE public.answer (
    id SERIAL NOT NULL,
    "questionId" integer NOT NULL,
    answer text
);

CREATE TABLE public.answer_question (
    id SERIAL NOT NULL,
    "questionId" integer NOT NULL,
    "answerId" integer NOT NULL,
    "customAnswer" text,
    "userId" integer NOT NULL, 
    PRIMARY KEY (id)
);

CREATE TABLE public.file (
    id SERIAL NOT NULL,
    path character varying NOT NULL,
    "createdAt" date,
    PRIMARY KEY (id)
);

CREATE TABLE public.user_wallet
(
    id SERIAL NOT NULL,
    "userId" integer NOT NULL,
    address character varying(42) NOT NULL,
    "encryptedWallet" json NOT NULL,
    mnemonic character varying(200),
    active boolean NOT NULL,
    "createdAt" date,
    PRIMARY KEY (id),
    CONSTRAINT fk_user
      FOREIGN KEY("userId") 
	  REFERENCES public.user(id)
);

CREATE UNIQUE INDEX "onlyActive" ON public.user_wallet("userId") where (active);
