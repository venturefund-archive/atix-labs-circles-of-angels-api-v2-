-- Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

CREATE TYPE public.tx_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled'
);

CREATE TYPE public.claimstatus AS ENUM (
    'pending',
    'claimable',
    'claimed',
    'transferred'
);

CREATE TYPE public.projectstatus AS ENUM (
  'draft',
  'published',
  'in progress',
  'in review',
  'completed',
  'new',
  'toreview',
  'rejected',
  'deleted',
  'consensus',
  'funding',
  'executing',
  'changingscope',
  'finished',
  'aborted',
  'archived',
  'cancelled',
  'open review',
  'cancelled review'
);

CREATE TYPE public.role_old AS ENUM (
    'admin',
    'entrepreneur',
    'supporter',
    'curator',
    'bankoperator'
);

CREATE TYPE public.evidence_type AS ENUM (
    'transfer',
    'impact'
);

CREATE TYPE public.tx_evidence_status AS ENUM (
    'notsent',
    'sent',
    'confirmed',
    'failed',
    'pending_verification'
);

CREATE TYPE public.evidence_status AS ENUM (
    'new',
    'approved',
    'rejected'
);

CREATE TYPE public.tx_funder_status AS ENUM (
    'reconciliation',
    'pending',
    'sent',
    'failed',
    'cancelled',
    'verified',
    'pending_verification'
);

CREATE TYPE public.tx_proposal_status AS ENUM (
    'notsent',
    'sent',
    'confirmed',
    'failed'
);

CREATE TYPE public.task_status AS ENUM (
    'new',
    'to-review',
    'approved',
    'rejected',
    'in_progress'
);

CREATE TYPE public.milestone_status AS ENUM (
    'not started',
    'in progress',
    'approved'
);

CREATE TABLE public."role" (
    id serial PRIMARY KEY,
    description varchar(255) NOT NULL
);

CREATE TABLE public.activity (
    id serial,
    "milestoneId" integer,
    tasks text,
    impact text,
    "impactCriterion" text,
    "signsOfSuccess" text,
    "signsOfSuccessCriterion" text,
    category text,
    "keyPersonnel" text,
    budget text,
    status smallint NOT NULL,
    "transactionHash" character varying(80),
    "createdAt" date,
    "updatedAt" date,
    "blockchainStatus" integer DEFAULT 1 NOT NULL,
    "validatedTransactionHash" character varying(80)
);

CREATE TABLE public.activity_file (
    id serial,
    "activityId" integer NOT NULL,
    "fileId" integer NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    "fileHash" character varying(80)
);

CREATE TABLE public.activity_photo (
    id serial,
    "activityId" integer NOT NULL,
    "photoId" integer NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    "fileHash" character varying(80)
);

CREATE TABLE public.answer (
    id serial,
    "questionId" integer NOT NULL,
    answer text
);

CREATE TABLE public.answer_question (
    id serial,
    "questionId" integer NOT NULL,
    "answerId" integer NOT NULL,
    "customAnswer" text,
    "userId_old" integer,
    "userId" uuid NOT NULL
);

CREATE TABLE public.blockchain_block (
    id serial,
    "blockNumber" integer NOT NULL,
    "transactionHash" character varying(80) NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL
);

CREATE TABLE public.blockchain_status (
    id smallint NOT NULL,
    name character varying NOT NULL
);

CREATE TABLE public.configs (
    id serial,
    key character varying NOT NULL,
    value character varying,
    "createdAt" date,
    "updatedAt" date
);

CREATE TABLE public.country (
    id serial,
    name character varying(42) NOT NULL,
    "callingCode" integer
);

CREATE TABLE public.featured_project (
    id serial,
    "projectId" uuid NOT NULL
);

CREATE TABLE public.file (
    id serial,
    path character varying NOT NULL,
    name TEXT NOT NULL,
    size integer NOT NULL,
    hash TEXT NOT NULL,
    "createdAt" date,
    "updatedAt" date
);

CREATE TABLE public.fund_transfer (
    id serial,
    "transferId" character varying NOT NULL,
    "senderId_old" integer,
    "destinationAccount" character varying NOT NULL,
    currency character varying NOT NULL,
    "projectId" uuid NOT NULL,
    status public.tx_funder_status NOT NULL,
    "createdAt" date,
    amount integer NOT NULL,
    "rejectionReason" character varying(80) DEFAULT NULL::character varying,
    "txHash" character varying(80) DEFAULT NULL::character varying,
    "receiptPath" text NOT NULL,
    "senderId" uuid NOT NULL
);

CREATE TABLE public.milestone (
    id serial,
    "projectId" uuid NOT NULL,
    title varchar(50),
    description text,
    "createdAt" date,
    "claimStatus" public.claimstatus DEFAULT 'pending'::public.claimstatus,
    "claimReceiptPath" character varying(200),
    status public.milestone_status DEFAULT 'not started'::public.milestone_status,
    deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE public.milestone_activity_status (
    status integer NOT NULL,
    name character varying NOT NULL
);

CREATE TABLE public.milestone_budget_status (
    id integer NOT NULL,
    name character varying NOT NULL
);


CREATE TABLE public.oracle_activity (
    id serial,
    "userId" integer NOT NULL,
    "activityId" integer NOT NULL
);

CREATE TABLE public.pass_recovery (
    id serial,
    token character varying(80) NOT NULL,
    email character varying(80) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expirationDate" timestamp with time zone NOT NULL
);

CREATE TABLE public.photo (
    id serial,
    path character varying NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    "projectExperienceId" integer
);

CREATE TABLE public.project (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "projectName" character varying(50) NOT NULL,
    "ownerId_old" integer,
    mission text,
    "problemAddressed" text,
    location text,
    timeframe numeric(6,3),
    "timeframeUnit" text,
    "dataComplete" integer NOT NULL DEFAULT 0,
    status public.projectstatus DEFAULT 'draft'::public.projectstatus,
    "goalAmount" text NOT NULL DEFAULT '0',
    "currencyType" varchar(50),
    "currency" varchar(50),
    "additionalCurrencyInformation" text,
    "faqLink" character varying,
    "createdAt" date,
    "lastUpdatedStatusAt" timestamp with time zone DEFAULT now(),
    "consensusSeconds" integer DEFAULT 864000,
    "fundingSeconds" integer DEFAULT 864000,
    address character varying(42) DEFAULT NULL::character varying,
    "agreementFileHash" character varying(200),
    "proposalFileHash" character varying(200),
    "agreementFilePath" character varying(200),
    "proposalFilePath" character varying(200),
    "txHash" character varying(80) DEFAULT NULL::character varying,
    "coverPhotoPath" character varying(200),
    "cardPhotoPath" character varying(200),
    "milestonePath" character varying(200),
    proposal text,
    "agreementJson" text,
    "rejectionReason" text,
    "ownerId" uuid NOT NULL,
    "ipfsHash" TEXT,
    "proposerId" uuid,
    "parentId" uuid,
    "revision" integer NOT NULL DEFAULT 1,
    step integer NOT NULL DEFAULT 0,
    type TEXT
);

CREATE TABLE public.project_experience (
    id serial,
    "projectId" uuid NOT NULL,
    "userId_old" integer,
    comment text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone,
    "userId" uuid NOT NULL
);

CREATE TABLE public.project_experience_photo (
    id serial,
    path character varying(200) NOT NULL,
    "projectExperienceId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);

CREATE TABLE public.project_follower (
    id serial,
    "projectId" uuid NOT NULL,
    "userId_old" integer,
    "userId" uuid NOT NULL
);

CREATE TABLE public.project_funder (
    id serial,
    "projectId" uuid NOT NULL,
    "userId_old" integer,
    "userId" uuid NOT NULL
);


CREATE TABLE public.project_oracle (
    id serial,
    "projectId" uuid NOT NULL,
    "userId_old" integer,
    "userId" uuid NOT NULL
);

CREATE TABLE public.project_status (
    status integer NOT NULL,
    name character varying NOT NULL
);

CREATE TABLE public.proposal (
    id serial,
    "proposalId" integer,
    "daoId" integer NOT NULL,
    applicant character varying(42) NOT NULL,
    proposer character varying(42) NOT NULL,
    description text,
    type integer NOT NULL,
    "txHash" character varying(80) NOT NULL,
    "createdAt" date DEFAULT now(),
    status public.tx_proposal_status DEFAULT 'notsent'::public.tx_proposal_status
);

CREATE TABLE public.question (
    id serial,
    question text NOT NULL,
    role integer NOT NULL,
    "answerLimit" smallint NOT NULL
);

CREATE TABLE public.tx_activity (
    id serial,
    "transactionHash" character varying(80) NOT NULL,
    "activityId" integer,
    status public.tx_status DEFAULT 'pending'::public.tx_status,
    "createdAt" date DEFAULT NOW()
);

CREATE TYPE public.task_type AS ENUM (
    'funding',
    'spending',
    'payback'
);

CREATE TABLE public.task (
    id serial,
    "milestoneId" integer NOT NULL,
    title varchar(50) NOT NULL,
    description text NOT NULL,
    "acceptanceCriteria" text NOT NULL,
    budget text NOT NULL,
    deposited text NOT NULL DEFAULT '0',
    spent text NOT NULL DEFAULT '0',
    "auditorId" uuid  NOT NULL,
    "createdAt" date DEFAULT now(),
    "reviewCriteria" text,
    category text,
    "keyPersonnel" text,
    "taskHash" character varying(80) DEFAULT NULL::character varying,
    "oracleId_old" integer,
    "oracleId" uuid,
    "proposerId" uuid,
    status public.task_status DEFAULT 'new'::public.task_status,
    reason text,
    step integer NOT NULL DEFAULT 0,
    "toSign" json DEFAULT '{}'::json,
    deleted BOOLEAN NOT NULL DEFAULT false,
    type public.task_type
);

CREATE TABLE public.task_evidence (
    id serial,
    title character varying(50) NOT NULL,
    description character varying(500) NOT NULL,
    type public.evidence_type NOT NULL,
    income text NOT NULL DEFAULT '0',
    outcome text NOT NULL DEFAULT '0',
    "transferTxHash" text,
    proof text,
    approved boolean,
    "taskId" integer NOT NULL,
    "txHash" character varying(80) DEFAULT NULL::character varying,
    status public.evidence_status DEFAULT 'new'::public.evidence_status,
    "createdAt" timestamp with time zone NOT NULL,
    "auditorId" uuid,
    reason text,
    "userId" uuid
);

CREATE TABLE public.transaction (
    id serial,
    sender character varying(42) NOT NULL,
    "txHash" character varying(80) NOT NULL,
    nonce integer NOT NULL,
    "createdAt" date DEFAULT now()
);

CREATE TABLE public.transfer_status (
    status integer NOT NULL,
    name character varying NOT NULL
);

CREATE TABLE public."user" (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    id_old serial NOT NULL,
    "firstName" character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    address character varying,
    "createdAt" date,
    role public.role_old DEFAULT 'entrepreneur'::public.role_old NOT NULL,
    "lastName" character varying(50) DEFAULT ''::character varying NOT NULL,
    blocked boolean DEFAULT false NOT NULL,
    "phoneNumber" character varying(80) DEFAULT NULL::character varying,
    company character varying(80) DEFAULT NULL::character varying,
    answers text,
    "countryId" integer,
    "encryptedWallet" json DEFAULT '{}'::json,
    "forcePasswordChange" boolean DEFAULT false NOT NULL,
    mnemonic character varying(200),
    "emailConfirmation" boolean DEFAULT false NOT NULL,
    "isAdmin" BOOLEAN DEFAULT false,
    "first" BOOLEAN DEFAULT true,
    "pin" BOOLEAN DEFAULT false,
    "apiKey" character varying,
    "apiSecret" character varying
);

CREATE TABLE public.user_funder (
    id serial,
    "userId" integer NOT NULL,
    "phoneNumber" character varying(80)
);

CREATE TABLE public.user_project (
    id serial,
    "userId" uuid NOT NULL,
    "projectId" uuid NOT NULL,
    "roleId" integer NOT NULL
);

CREATE TABLE public.user_social_entrepreneur (
    id serial,
    "userId" integer NOT NULL,
    company character varying(80),
    "phoneNumber" character varying(80)
);

CREATE TABLE public.user_wallet (
    id serial,
    "userId_old" integer,
    address character varying(42) NOT NULL,
    "encryptedWallet" json NOT NULL,
    mnemonic character varying(200),
    active boolean NOT NULL,
    "createdAt" date,
    iv character varying(200),
    "userId" uuid NOT NULL
);

CREATE TABLE public.vote (
    id serial,
    "daoId" integer NOT NULL,
    "proposalId" integer NOT NULL,
    vote integer,
    voter character varying(42) NOT NULL,
    "txHash" character varying(80) NOT NULL,
    "createdAt" date DEFAULT now(),
    status public.tx_proposal_status DEFAULT 'notsent'::public.tx_proposal_status
);

ALTER TABLE ONLY public.activity_file
    ADD CONSTRAINT activity_file_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.activity_photo
    ADD CONSTRAINT activity_photo_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT activity_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.answer_question
    ADD CONSTRAINT answer_question_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.blockchain_block
    ADD CONSTRAINT "blockchain_block_transactionHash_key" UNIQUE ("transactionHash");

ALTER TABLE ONLY public.configs
    ADD CONSTRAINT configs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.featured_project
    ADD CONSTRAINT featured_project_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.fund_transfer
    ADD CONSTRAINT fund_transfer_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.fund_transfer
    ADD CONSTRAINT "fund_transfer_transferId_key" UNIQUE ("transferId");

ALTER TABLE ONLY public.milestone_activity_status
    ADD CONSTRAINT milestone_activity_status_pkey PRIMARY KEY (status);

ALTER TABLE ONLY public.milestone_budget_status
    ADD CONSTRAINT milestone_budget_status_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.milestone
    ADD CONSTRAINT milestone_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.oracle_activity
    ADD CONSTRAINT oracle_activity_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.oracle_activity
    ADD CONSTRAINT "oracle_activity_userId_activityId_key" UNIQUE ("userId", "activityId");

ALTER TABLE ONLY public.pass_recovery
    ADD CONSTRAINT pass_recovery_email_key UNIQUE (email);

ALTER TABLE ONLY public.pass_recovery
    ADD CONSTRAINT pass_recovery_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.photo
    ADD CONSTRAINT photo_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.project_experience_photo
    ADD CONSTRAINT project_experience_photo_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.project_experience
    ADD CONSTRAINT project_experience_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.project_follower
    ADD CONSTRAINT project_follower_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.project_follower
    ADD CONSTRAINT "project_follower_projectId_userId_key" UNIQUE ("projectId", "userId_old");

ALTER TABLE ONLY public.project_funder
    ADD CONSTRAINT project_funder_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.project_funder
    ADD CONSTRAINT "project_funder_projectId_userId_key" UNIQUE ("projectId", "userId_old");

ALTER TABLE ONLY public.project_oracle
    ADD CONSTRAINT project_oracle_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.project_oracle
    ADD CONSTRAINT "project_oracle_projectId_userId_key" UNIQUE ("projectId", "userId_old");

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.project_status
    ADD CONSTRAINT project_status_pkey PRIMARY KEY (status);

ALTER TABLE ONLY public.proposal
    ADD CONSTRAINT proposal_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.proposal
    ADD CONSTRAINT "proposal_txHash_key" UNIQUE ("txHash");

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.task_evidence
    ADD CONSTRAINT task_evidence_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.task_evidence
    ADD CONSTRAINT "task_evidence_txHash_key" UNIQUE ("txHash");

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.transfer_status
    ADD CONSTRAINT transfer_status_pkey PRIMARY KEY (status);

ALTER TABLE ONLY public.user_wallet
    ADD CONSTRAINT unique_address UNIQUE (address);

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);

ALTER TABLE ONLY public.user_funder
    ADD CONSTRAINT user_funder_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_project
    ADD CONSTRAINT user_project_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_social_entrepreneur
    ADD CONSTRAINT user_social_entrepreneur_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_wallet
    ADD CONSTRAINT user_wallet_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT vote_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT "vote_txHash_key" UNIQUE ("txHash");

CREATE UNIQUE INDEX "onlyActive" ON public.user_wallet USING btree ("userId_old") WHERE active;

ALTER TABLE ONLY public.tx_activity
    ADD CONSTRAINT "tx_activity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public.task(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.activity_file
    ADD CONSTRAINT "activity_file_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public.activity(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.activity_file
    ADD CONSTRAINT "activity_file_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES public.file(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT "activity_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES public.milestone(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.activity_photo
    ADD CONSTRAINT "activity_photo_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public.activity(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.activity_photo
    ADD CONSTRAINT "activity_photo_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES public.photo(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT "answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.question(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.answer_question
    ADD CONSTRAINT "answer_question_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES public.answer(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.answer_question
    ADD CONSTRAINT "answer_question_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.question(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.answer_question
    ADD CONSTRAINT "answer_question_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.featured_project
    ADD CONSTRAINT "featured_project_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);

ALTER TABLE ONLY public.user_wallet
    ADD CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.fund_transfer
    ADD CONSTRAINT "fund_transfer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.fund_transfer
    ADD CONSTRAINT "fund_transfer_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.milestone
    ADD CONSTRAINT "milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.oracle_activity
    ADD CONSTRAINT "oracle_activity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public.activity(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.photo
    ADD CONSTRAINT "photo_projectExperienceId_fk" FOREIGN KEY ("projectExperienceId") REFERENCES public.project_experience(id);

ALTER TABLE ONLY public.project_experience_photo
    ADD CONSTRAINT "project_experience_photo_projectExperienceId_fkey" FOREIGN KEY ("projectExperienceId") REFERENCES public.project_experience(id);

ALTER TABLE ONLY public.project_experience
    ADD CONSTRAINT "project_experience_projectId_fk" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.project_experience
    ADD CONSTRAINT "project_experience_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.project_follower
    ADD CONSTRAINT "project_follower_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);

ALTER TABLE ONLY public.project_follower
    ADD CONSTRAINT "project_follower_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.project_funder
    ADD CONSTRAINT "project_funder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);

ALTER TABLE ONLY public.project_funder
    ADD CONSTRAINT "project_funder_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.project_oracle
    ADD CONSTRAINT "project_oracle_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);

ALTER TABLE ONLY public.project_oracle
    ADD CONSTRAINT "project_oracle_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.project
    ADD CONSTRAINT "project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES public.milestone(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "task_oracleId_fkey" FOREIGN KEY ("oracleId") REFERENCES public."user"(id);

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "user_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES public.country(id);

ALTER TABLE ONLY public.user_project
    ADD CONSTRAINT "user_project_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);

ALTER TABLE ONLY public.user_project
    ADD CONSTRAINT "user_project_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.role(id);

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "task_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES public."user"(id);

CREATE TABLE public.evidence_file (
    id serial,
    "taskEvidenceId" INTEGER NOT NULL CONSTRAINT "evidence_file_taskEvidenceId_fkey" REFERENCES public.task_evidence(id),
    "fileId" INTEGER NOT NULL CONSTRAINT "evidence_file_fileId_fkey" REFERENCES public.file(id)
);

CREATE TABLE public.token (
    id serial,
    "name" CHARACTER VARYING(20) NOT NULL,
    "symbol" CHARACTER VARYING(20) NOT NULL,
    "decimals" INTEGER NOT NULL,
    "apiBaseUrl" TEXT NOT NULL,
    "contractAddress" TEXT
);

CREATE TABLE public.changelog (
    id serial,
    "projectId" uuid CONSTRAINT "changelog_projectId_fkey" REFERENCES public.project(id),
    "revisionId" INTEGER NOT NULL,
    "milestoneId" INTEGER,
    "activityId" INTEGER,
    "evidenceId" INTEGER,
    "userId" UUID,
    "transactionId" TEXT,
    description TEXT,
    "action" TEXT NOT NULL,
    "extraData" json,
    datetime timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.task_evidence
    ADD CONSTRAINT "task_evidence_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "task_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.project
    ADD CONSTRAINT "project_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES public."user"(id);

ALTER TABLE ONLY public.task_evidence
    ADD CONSTRAINT "task_evidence_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);