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
    id SERIAL primary KEY,
    description varchar(255) NOT NULL
);

CREATE TABLE public.activity (
    id integer NOT NULL,
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
    id integer NOT NULL,
    "activityId" integer NOT NULL,
    "fileId" integer NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    "fileHash" character varying(80)
);

CREATE SEQUENCE public.activity_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.activity_file_id_seq OWNED BY public.activity_file.id;

CREATE SEQUENCE public.activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_id_seq OWNED BY public.activity.id;

CREATE TABLE public.activity_photo (
    id integer NOT NULL,
    "activityId" integer NOT NULL,
    "photoId" integer NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    "fileHash" character varying(80)
);

CREATE SEQUENCE public.activity_photo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.activity_photo_id_seq OWNED BY public.activity_photo.id;


CREATE TABLE public.answer (
    id integer NOT NULL,
    "questionId" integer NOT NULL,
    answer text
);

CREATE SEQUENCE public.answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.answer_id_seq OWNED BY public.answer.id;

CREATE TABLE public.answer_question (
    id integer NOT NULL,
    "questionId" integer NOT NULL,
    "answerId" integer NOT NULL,
    "customAnswer" text,
    "userId_old" integer,
    "userId" uuid NOT NULL
);

CREATE SEQUENCE public.answer_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.answer_question_id_seq OWNED BY public.answer_question.id;

CREATE TABLE public.blockchain_block (
    id integer NOT NULL,
    "blockNumber" integer NOT NULL,
    "transactionHash" character varying(80) NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL
);

CREATE SEQUENCE public.blockchain_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.blockchain_block_id_seq OWNED BY public.blockchain_block.id;


CREATE TABLE public.blockchain_status (
    id smallint NOT NULL,
    name character varying NOT NULL
);

CREATE TABLE public.configs (
    id integer NOT NULL,
    key character varying NOT NULL,
    value character varying,
    "createdAt" date,
    "updatedAt" date
);

CREATE SEQUENCE public.configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.configs_id_seq OWNED BY public.configs.id;

CREATE TABLE public.country (
    id integer NOT NULL,
    name character varying(42) NOT NULL,
    "callingCode" integer
);

CREATE SEQUENCE public.country_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.country_id_seq OWNED BY public.country.id;

CREATE TABLE public.featured_project (
    id integer NOT NULL,
    "projectId" integer NOT NULL
);

CREATE SEQUENCE public.featured_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.featured_project_id_seq OWNED BY public.featured_project.id;

CREATE TABLE public.file (
    id integer NOT NULL,
    path character varying NOT NULL,
    name TEXT NOT NULL,
    size integer NOT NULL,
    hash TEXT NOT NULL,
    "createdAt" date,
    "updatedAt" date
);

CREATE SEQUENCE public.file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.file_id_seq OWNED BY public.file.id;

CREATE TABLE public.fund_transfer (
    id integer NOT NULL,
    "transferId" character varying NOT NULL,
    "senderId_old" integer,
    "destinationAccount" character varying NOT NULL,
    currency character varying NOT NULL,
    "projectId" integer NOT NULL,
    status public.tx_funder_status NOT NULL,
    "createdAt" date,
    amount integer NOT NULL,
    "rejectionReason" character varying(80) DEFAULT NULL::character varying,
    "txHash" character varying(80) DEFAULT NULL::character varying,
    "receiptPath" text NOT NULL,
    "senderId" uuid NOT NULL
);

CREATE SEQUENCE public.fund_transfer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.fund_transfer_id_seq OWNED BY public.fund_transfer.id;

CREATE TABLE public.milestone (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
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

CREATE SEQUENCE public.milestone_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.milestone_id_seq OWNED BY public.milestone.id;

CREATE TABLE public.oracle_activity (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "activityId" integer NOT NULL
);

CREATE SEQUENCE public.oracle_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.oracle_activity_id_seq OWNED BY public.oracle_activity.id;

CREATE TABLE public.pass_recovery (
    id integer NOT NULL,
    token character varying(80) NOT NULL,
    email character varying(80) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expirationDate" timestamp with time zone NOT NULL
);

CREATE SEQUENCE public.pass_recovery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.pass_recovery_id_seq OWNED BY public.pass_recovery.id;

CREATE TABLE public.photo (
    id integer NOT NULL,
    path character varying NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    "projectExperienceId" integer
);

CREATE SEQUENCE public.photo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.photo_id_seq OWNED BY public.photo.id;

CREATE TABLE public.project (
    id integer NOT NULL,
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
    "parentId" integer,
    "revision" integer NOT NULL DEFAULT 1
);

CREATE TABLE public.project_experience (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "userId_old" integer,
    comment text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone,
    "userId" uuid NOT NULL
);

CREATE SEQUENCE public.project_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.project_experience_id_seq OWNED BY public.project_experience.id;

CREATE SEQUENCE public.project_experience_photo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

CREATE TABLE public.project_experience_photo (
    id integer DEFAULT nextval('public.project_experience_photo_id_seq'::regclass) NOT NULL,
    path character varying(200) NOT NULL,
    "projectExperienceId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);

CREATE TABLE public.project_follower (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "userId_old" integer,
    "userId" uuid NOT NULL
);

CREATE SEQUENCE public.project_follower_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.project_follower_id_seq OWNED BY public.project_follower.id;

CREATE TABLE public.project_funder (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "userId_old" integer,
    "userId" uuid NOT NULL
);

CREATE SEQUENCE public.project_funder_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.project_funder_id_seq OWNED BY public.project_funder.id;

CREATE SEQUENCE public.project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.project_id_seq OWNED BY public.project.id;

CREATE TABLE public.project_oracle (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "userId_old" integer,
    "userId" uuid NOT NULL
);

CREATE SEQUENCE public.project_oracle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.project_oracle_id_seq OWNED BY public.project_oracle.id;

CREATE TABLE public.project_status (
    status integer NOT NULL,
    name character varying NOT NULL
);

CREATE TABLE public.proposal (
    id integer NOT NULL,
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

CREATE SEQUENCE public.proposal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.proposal_id_seq OWNED BY public.proposal.id;

CREATE TABLE public.question (
    id integer NOT NULL,
    question text NOT NULL,
    role integer NOT NULL,
    "answerLimit" smallint NOT NULL
);

CREATE SEQUENCE public.question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.question_id_seq OWNED BY public.question.id;

CREATE SEQUENCE public.task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

CREATE TABLE public.tx_activity (
    id SERIAL PRIMARY KEY,
    "transactionHash" character varying(80) NOT NULL,
    "activityId" integer,
    status public.tx_status DEFAULT 'pending'::public.tx_status,
    "createdAt" date DEFAULT NOW()
);

CREATE TABLE public.task (
    id integer DEFAULT nextval('public.task_id_seq'::regclass) NOT NULL,
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
    status public.task_status DEFAULT 'new'::public.task_status,
    reason text,
    deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE SEQUENCE public.task_evidence_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

CREATE TABLE public.task_evidence (
    id integer DEFAULT nextval('public.task_evidence_id_seq'::regclass) NOT NULL,
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
    reason text
);

CREATE TABLE public.transaction (
    id integer NOT NULL,
    sender character varying(42) NOT NULL,
    "txHash" character varying(80) NOT NULL,
    nonce integer NOT NULL,
    "createdAt" date DEFAULT now()
);

CREATE SEQUENCE public.transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.transaction_id_seq OWNED BY public.transaction.id;

CREATE TABLE public.transfer_status (
    status integer NOT NULL,
    name character varying NOT NULL
);

CREATE TABLE public."user" (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    id_old integer NOT NULL,
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
    "pin" BOOLEAN DEFAULT false
);

CREATE TABLE public.user_funder (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "phoneNumber" character varying(80)
);

CREATE SEQUENCE public.user_funder_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.user_funder_id_seq OWNED BY public.user_funder.id;

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id_old;

CREATE TABLE public.user_project (
    id integer NOT NULL,
    "userId" uuid NOT NULL,
    "projectId" integer NOT NULL,
    "roleId" integer NOT NULL
);

CREATE SEQUENCE public.user_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.user_project_id_seq OWNED BY public.user_project.id;

CREATE TABLE public.user_social_entrepreneur (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    company character varying(80),
    "phoneNumber" character varying(80)
);

CREATE SEQUENCE public.user_social_entrepreneur_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.user_social_entrepreneur_id_seq OWNED BY public.user_social_entrepreneur.id;

CREATE TABLE public.user_wallet (
    id integer NOT NULL,
    "userId_old" integer,
    address character varying(42) NOT NULL,
    "encryptedWallet" json NOT NULL,
    mnemonic character varying(200),
    active boolean NOT NULL,
    "createdAt" date,
    iv character varying(200),
    "userId" uuid NOT NULL
);

CREATE SEQUENCE public.user_wallet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.user_wallet_id_seq OWNED BY public.user_wallet.id;

CREATE TABLE public.vote (
    id integer NOT NULL,
    "daoId" integer NOT NULL,
    "proposalId" integer NOT NULL,
    vote integer,
    voter character varying(42) NOT NULL,
    "txHash" character varying(80) NOT NULL,
    "createdAt" date DEFAULT now(),
    status public.tx_proposal_status DEFAULT 'notsent'::public.tx_proposal_status
);

CREATE SEQUENCE public.vote_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE "role" (
    id SERIAL primary KEY,
    description varchar(255) NOT NULL
);

ALTER SEQUENCE public.vote_id_seq OWNED BY public.vote.id;

ALTER TABLE ONLY public.activity ALTER COLUMN id SET DEFAULT nextval('public.activity_id_seq'::regclass);

ALTER TABLE ONLY public.activity_file ALTER COLUMN id SET DEFAULT nextval('public.activity_file_id_seq'::regclass);

ALTER TABLE ONLY public.activity_photo ALTER COLUMN id SET DEFAULT nextval('public.activity_photo_id_seq'::regclass);

ALTER TABLE ONLY public.answer ALTER COLUMN id SET DEFAULT nextval('public.answer_id_seq'::regclass);

ALTER TABLE ONLY public.answer_question ALTER COLUMN id SET DEFAULT nextval('public.answer_question_id_seq'::regclass);

ALTER TABLE ONLY public.blockchain_block ALTER COLUMN id SET DEFAULT nextval('public.blockchain_block_id_seq'::regclass);

ALTER TABLE ONLY public.configs ALTER COLUMN id SET DEFAULT nextval('public.configs_id_seq'::regclass);

ALTER TABLE ONLY public.country ALTER COLUMN id SET DEFAULT nextval('public.country_id_seq'::regclass);

ALTER TABLE ONLY public.featured_project ALTER COLUMN id SET DEFAULT nextval('public.featured_project_id_seq'::regclass);

ALTER TABLE ONLY public.file ALTER COLUMN id SET DEFAULT nextval('public.file_id_seq'::regclass);

ALTER TABLE ONLY public.fund_transfer ALTER COLUMN id SET DEFAULT nextval('public.fund_transfer_id_seq'::regclass);

ALTER TABLE ONLY public.milestone ALTER COLUMN id SET DEFAULT nextval('public.milestone_id_seq'::regclass);

ALTER TABLE ONLY public.oracle_activity ALTER COLUMN id SET DEFAULT nextval('public.oracle_activity_id_seq'::regclass);

ALTER TABLE ONLY public.pass_recovery ALTER COLUMN id SET DEFAULT nextval('public.pass_recovery_id_seq'::regclass);

ALTER TABLE ONLY public.photo ALTER COLUMN id SET DEFAULT nextval('public.photo_id_seq'::regclass);

ALTER TABLE ONLY public.project ALTER COLUMN id SET DEFAULT nextval('public.project_id_seq'::regclass);

ALTER TABLE ONLY public.project_experience ALTER COLUMN id SET DEFAULT nextval('public.project_experience_id_seq'::regclass);

ALTER TABLE ONLY public.project_follower ALTER COLUMN id SET DEFAULT nextval('public.project_follower_id_seq'::regclass);

ALTER TABLE ONLY public.project_funder ALTER COLUMN id SET DEFAULT nextval('public.project_funder_id_seq'::regclass);

ALTER TABLE ONLY public.project_oracle ALTER COLUMN id SET DEFAULT nextval('public.project_oracle_id_seq'::regclass);

ALTER TABLE ONLY public.proposal ALTER COLUMN id SET DEFAULT nextval('public.proposal_id_seq'::regclass);

ALTER TABLE ONLY public.question ALTER COLUMN id SET DEFAULT nextval('public.question_id_seq'::regclass);

ALTER TABLE ONLY public.transaction ALTER COLUMN id SET DEFAULT nextval('public.transaction_id_seq'::regclass);

ALTER TABLE ONLY public."user" ALTER COLUMN id_old SET DEFAULT nextval('public.user_id_seq'::regclass);

ALTER TABLE ONLY public.user_funder ALTER COLUMN id SET DEFAULT nextval('public.user_funder_id_seq'::regclass);

ALTER TABLE ONLY public.user_project ALTER COLUMN id SET DEFAULT nextval('public.user_project_id_seq'::regclass);

ALTER TABLE ONLY public.user_social_entrepreneur ALTER COLUMN id SET DEFAULT nextval('public.user_social_entrepreneur_id_seq'::regclass);

ALTER TABLE ONLY public.user_wallet ALTER COLUMN id SET DEFAULT nextval('public.user_wallet_id_seq'::regclass);

ALTER TABLE ONLY public.vote ALTER COLUMN id SET DEFAULT nextval('public.vote_id_seq'::regclass);

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
    id SERIAL PRIMARY KEY,
    "taskEvidenceId" INTEGER NOT NULL CONSTRAINT "evidence_file_taskEvidenceId_fkey" REFERENCES public.task_evidence(id),
    "fileId" INTEGER NOT NULL CONSTRAINT "evidence_file_fileId_fkey" REFERENCES public.file(id)
);

CREATE TABLE public.token (
    id SERIAL PRIMARY KEY,
    "name" CHARACTER VARYING(20) NOT NULL,
    "symbol" CHARACTER VARYING(20) NOT NULL,
    "decimals" INTEGER NOT NULL,
    "apiBaseUrl" TEXT NOT NULL,
    "contractAddress" TEXT
);

CREATE TABLE public.changelog (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER CONSTRAINT "changelog_projectId_fkey" REFERENCES public.project(id),
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