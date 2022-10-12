--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3
-- Dumped by pg_dump version 12.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: claimstatus; Type: TYPE; Schema: public; Owner: atixlabs
--

CREATE TYPE public.claimstatus AS ENUM (
    'pending',
    'claimable',
    'claimed',
    'transferred'
);


ALTER TYPE public.claimstatus OWNER TO atixlabs;

--
-- Name: projectstatus; Type: TYPE; Schema: public; Owner: atixlabs
--

CREATE TYPE public.projectstatus AS ENUM (
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


ALTER TYPE public.projectstatus OWNER TO atixlabs;

--
-- Name: role; Type: TYPE; Schema: public; Owner: atixlabs
--

CREATE TYPE public.role AS ENUM (
    'admin',
    'entrepreneur',
    'supporter',
    'curator',
    'bankoperator'
);


ALTER TYPE public.role OWNER TO atixlabs;

--
-- Name: tx_evidence_status; Type: TYPE; Schema: public; Owner: atixlabs
--

CREATE TYPE public.tx_evidence_status AS ENUM (
    'notsent',
    'sent',
    'confirmed',
    'failed',
    'pending_verification'
);


ALTER TYPE public.tx_evidence_status OWNER TO atixlabs;

--
-- Name: tx_funder_status; Type: TYPE; Schema: public; Owner: atixlabs
--

CREATE TYPE public.tx_funder_status AS ENUM (
    'reconciliation',
    'pending',
    'sent',
    'failed',
    'cancelled',
    'verified',
    'pending_verification'
);


ALTER TYPE public.tx_funder_status OWNER TO atixlabs;

--
-- Name: tx_proposal_status; Type: TYPE; Schema: public; Owner: atixlabs
--

CREATE TYPE public.tx_proposal_status AS ENUM (
    'notsent',
    'sent',
    'confirmed',
    'failed'
);


ALTER TYPE public.tx_proposal_status OWNER TO atixlabs;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: answer; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.answer (
    id integer NOT NULL,
    questionid integer NOT NULL,
    answer text
);


ALTER TABLE public.answer OWNER TO atixlabs;

--
-- Name: answer_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.answer_id_seq OWNER TO atixlabs;

--
-- Name: answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.answer_id_seq OWNED BY public.answer.id;


--
-- Name: country; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.country (
    id integer NOT NULL,
    name character varying(42) NOT NULL,
    "callingCode" integer
);


ALTER TABLE public.country OWNER TO atixlabs;

--
-- Name: country_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.country_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.country_id_seq OWNER TO atixlabs;

--
-- Name: country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.country_id_seq OWNED BY public.country.id;


--
-- Name: featured_project; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.featured_project (
    id integer NOT NULL,
    "projectId" integer NOT NULL
);


ALTER TABLE public.featured_project OWNER TO atixlabs;

--
-- Name: featured_project_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.featured_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.featured_project_id_seq OWNER TO atixlabs;

--
-- Name: featured_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.featured_project_id_seq OWNED BY public.featured_project.id;


--
-- Name: file; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.file (
    id integer NOT NULL,
    path character varying NOT NULL,
    createdat date
);


ALTER TABLE public.file OWNER TO atixlabs;

--
-- Name: file_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.file_id_seq OWNER TO atixlabs;

--
-- Name: file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.file_id_seq OWNED BY public.file.id;


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO atixlabs;

--
-- Name: fund_transfer; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.fund_transfer (
    id integer NOT NULL,
    "transferId" character varying(80) NOT NULL,
    "destinationAccount" character varying(80) NOT NULL,
    "receiptPath" text NOT NULL,
    amount real NOT NULL,
    currency character varying(10) NOT NULL,
    "senderId_old" integer,
    "projectId" integer NOT NULL,
    status public.tx_funder_status NOT NULL,
    "createdAt" date,
    "rejectionReason" character varying(80) DEFAULT NULL::character varying,
    "txHash" character varying(80) DEFAULT NULL::character varying,
    "senderId" uuid NOT NULL
);


ALTER TABLE public.fund_transfer OWNER TO atixlabs;

--
-- Name: fund_transfer_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.fund_transfer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fund_transfer_id_seq OWNER TO atixlabs;

--
-- Name: fund_transfer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.fund_transfer_id_seq OWNED BY public.fund_transfer.id;


--
-- Name: milestone; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.milestone (
    id integer NOT NULL,
    "projectId" integer,
    "createdAt" date DEFAULT now(),
    description text,
    category text,
    "claimStatus" public.claimstatus DEFAULT 'pending'::public.claimstatus,
    "claimReceiptPath" character varying(200)
);


ALTER TABLE public.milestone OWNER TO atixlabs;

--
-- Name: milestone_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.milestone_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.milestone_id_seq OWNER TO atixlabs;

--
-- Name: milestone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.milestone_id_seq OWNED BY public.milestone.id;


--
-- Name: pass_recovery; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.pass_recovery (
    id integer NOT NULL,
    token character varying(80) NOT NULL,
    email character varying(80) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.pass_recovery OWNER TO atixlabs;

--
-- Name: pass_recovery_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.pass_recovery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pass_recovery_id_seq OWNER TO atixlabs;

--
-- Name: pass_recovery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.pass_recovery_id_seq OWNED BY public.pass_recovery.id;


--
-- Name: project; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project (
    id integer NOT NULL,
    "projectName" character varying(50) NOT NULL,
    "ownerId_old" integer,
    "createdAt" date DEFAULT now(),
    mission text,
    location text,
    "problemAddressed" text,
    timeframe text,
    status public.projectstatus DEFAULT 'new'::public.projectstatus,
    "goalAmount" numeric NOT NULL,
    "faqLink" text,
    "coverPhotoPath" character varying(200),
    "cardPhotoPath" character varying(200),
    "milestonePath" character varying(200),
    proposal text,
    "agreementJson" text,
    "lastUpdatedStatusAt" timestamp with time zone DEFAULT now(),
    "consensusSeconds" integer DEFAULT 300,
    "fundingSeconds" integer DEFAULT 864000,
    address character varying(42) DEFAULT NULL::character varying,
    "agreementFileHash" character varying(200),
    "proposalFilePath" character varying(200),
    "txHash" character varying(80) DEFAULT NULL::character varying,
    "rejectionReason" text,
    "ownerId" uuid NOT NULL
);


ALTER TABLE public.project OWNER TO atixlabs;

--
-- Name: project_experience; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project_experience (
    id integer NOT NULL,
    "projectId" integer,
    "userId_old" integer,
    comment text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "userId" uuid NOT NULL
);


ALTER TABLE public.project_experience OWNER TO atixlabs;

--
-- Name: project_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.project_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_experience_id_seq OWNER TO atixlabs;

--
-- Name: project_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.project_experience_id_seq OWNED BY public.project_experience.id;


--
-- Name: project_experience_photo; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project_experience_photo (
    id integer NOT NULL,
    path character varying(200) NOT NULL,
    "projectExperienceId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.project_experience_photo OWNER TO atixlabs;

--
-- Name: project_experience_photo_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.project_experience_photo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_experience_photo_id_seq OWNER TO atixlabs;

--
-- Name: project_experience_photo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.project_experience_photo_id_seq OWNED BY public.project_experience_photo.id;


--
-- Name: project_follower; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project_follower (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "userId_old" integer,
    "userId" uuid NOT NULL
);


ALTER TABLE public.project_follower OWNER TO atixlabs;

--
-- Name: project_follower_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.project_follower_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_follower_id_seq OWNER TO atixlabs;

--
-- Name: project_follower_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.project_follower_id_seq OWNED BY public.project_follower.id;


--
-- Name: project_funder; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project_funder (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "userId_old" integer,
    "userId" uuid NOT NULL
);


ALTER TABLE public.project_funder OWNER TO atixlabs;

--
-- Name: project_funder_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.project_funder_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_funder_id_seq OWNER TO atixlabs;

--
-- Name: project_funder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.project_funder_id_seq OWNED BY public.project_funder.id;


--
-- Name: project_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_id_seq OWNER TO atixlabs;

--
-- Name: project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.project_id_seq OWNED BY public.project.id;


--
-- Name: project_oracle; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project_oracle (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "userId_old" integer,
    "userId" uuid NOT NULL
);


ALTER TABLE public.project_oracle OWNER TO atixlabs;

--
-- Name: project_oracle_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.project_oracle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_oracle_id_seq OWNER TO atixlabs;

--
-- Name: project_oracle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.project_oracle_id_seq OWNED BY public.project_oracle.id;


--
-- Name: proposal; Type: TABLE; Schema: public; Owner: atixlabs
--

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


ALTER TABLE public.proposal OWNER TO atixlabs;

--
-- Name: proposal_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.proposal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_id_seq OWNER TO atixlabs;

--
-- Name: proposal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.proposal_id_seq OWNED BY public.proposal.id;


--
-- Name: question; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.question (
    id integer NOT NULL,
    question text NOT NULL
);


ALTER TABLE public.question OWNER TO atixlabs;

--
-- Name: question_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.question_id_seq OWNER TO atixlabs;

--
-- Name: question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.question_id_seq OWNED BY public.question.id;


--
-- Name: task; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.task (
    id integer NOT NULL,
    "milestoneId" integer,
    "createdAt" date DEFAULT now(),
    "taskHash" character varying(80) DEFAULT NULL::character varying,
    description text,
    "reviewCriteria" text,
    category text,
    "keyPersonnel" text,
    budget text,
    "oracleId_old" integer,
    "oracleId" uuid
);


ALTER TABLE public.task OWNER TO atixlabs;

--
-- Name: task_evidence; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.task_evidence (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    description character varying(80) DEFAULT NULL::character varying,
    proof text NOT NULL,
    approved boolean,
    "taskId" integer NOT NULL,
    "txHash" character varying(80) DEFAULT NULL::character varying,
    status public.tx_evidence_status DEFAULT 'notsent'::public.tx_evidence_status
);


ALTER TABLE public.task_evidence OWNER TO atixlabs;

--
-- Name: task_evidence_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.task_evidence_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_evidence_id_seq OWNER TO atixlabs;

--
-- Name: task_evidence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.task_evidence_id_seq OWNED BY public.task_evidence.id;


--
-- Name: task_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_id_seq OWNER TO atixlabs;

--
-- Name: task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.task_id_seq OWNED BY public.task.id;


--
-- Name: transaction; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.transaction (
    id integer NOT NULL,
    sender character varying(42) NOT NULL,
    "txHash" character varying(80) NOT NULL,
    nonce integer NOT NULL,
    "createdAt" date DEFAULT now()
);


ALTER TABLE public.transaction OWNER TO atixlabs;

--
-- Name: transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transaction_id_seq OWNER TO atixlabs;

--
-- Name: transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.transaction_id_seq OWNED BY public.transaction.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public."user" (
    id_old integer NOT NULL,
    "firstName" character varying(80) NOT NULL,
    "lastName" character varying(80),
    email character varying(40) NOT NULL,
    password character varying(80) NOT NULL,
    role public.role NOT NULL,
    "createdAt" date DEFAULT now(),
    address character varying(42),
    blocked boolean DEFAULT false NOT NULL,
    "phoneNumber" character varying(80) DEFAULT NULL::character varying,
    company character varying(80) DEFAULT NULL::character varying,
    answers text,
    "countryId" integer,
    "encryptedWallet" json DEFAULT '{}'::json,
    "forcePasswordChange" boolean DEFAULT false NOT NULL,
    mnemonic character varying(200),
    "emailConfirmation" boolean DEFAULT false NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL
);


ALTER TABLE public."user" OWNER TO atixlabs;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO atixlabs;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id_old;


--
-- Name: user_wallet; Type: TABLE; Schema: public; Owner: atixlabs
--

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


ALTER TABLE public.user_wallet OWNER TO atixlabs;

--
-- Name: user_wallet_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.user_wallet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_wallet_id_seq OWNER TO atixlabs;

--
-- Name: user_wallet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.user_wallet_id_seq OWNED BY public.user_wallet.id;


--
-- Name: vote; Type: TABLE; Schema: public; Owner: atixlabs
--

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


ALTER TABLE public.vote OWNER TO atixlabs;

--
-- Name: vote_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.vote_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vote_id_seq OWNER TO atixlabs;

--
-- Name: vote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.vote_id_seq OWNED BY public.vote.id;


--
-- Name: answer id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.answer ALTER COLUMN id SET DEFAULT nextval('public.answer_id_seq'::regclass);


--
-- Name: country id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.country ALTER COLUMN id SET DEFAULT nextval('public.country_id_seq'::regclass);


--
-- Name: featured_project id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.featured_project ALTER COLUMN id SET DEFAULT nextval('public.featured_project_id_seq'::regclass);


--
-- Name: file id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.file ALTER COLUMN id SET DEFAULT nextval('public.file_id_seq'::regclass);


--
-- Name: fund_transfer id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.fund_transfer ALTER COLUMN id SET DEFAULT nextval('public.fund_transfer_id_seq'::regclass);


--
-- Name: milestone id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.milestone ALTER COLUMN id SET DEFAULT nextval('public.milestone_id_seq'::regclass);


--
-- Name: pass_recovery id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.pass_recovery ALTER COLUMN id SET DEFAULT nextval('public.pass_recovery_id_seq'::regclass);


--
-- Name: project id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project ALTER COLUMN id SET DEFAULT nextval('public.project_id_seq'::regclass);


--
-- Name: project_experience id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience ALTER COLUMN id SET DEFAULT nextval('public.project_experience_id_seq'::regclass);


--
-- Name: project_experience_photo id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience_photo ALTER COLUMN id SET DEFAULT nextval('public.project_experience_photo_id_seq'::regclass);


--
-- Name: project_follower id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_follower ALTER COLUMN id SET DEFAULT nextval('public.project_follower_id_seq'::regclass);


--
-- Name: project_funder id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_funder ALTER COLUMN id SET DEFAULT nextval('public.project_funder_id_seq'::regclass);


--
-- Name: project_oracle id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_oracle ALTER COLUMN id SET DEFAULT nextval('public.project_oracle_id_seq'::regclass);


--
-- Name: proposal id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.proposal ALTER COLUMN id SET DEFAULT nextval('public.proposal_id_seq'::regclass);


--
-- Name: question id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.question ALTER COLUMN id SET DEFAULT nextval('public.question_id_seq'::regclass);


--
-- Name: task id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.task ALTER COLUMN id SET DEFAULT nextval('public.task_id_seq'::regclass);


--
-- Name: task_evidence id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.task_evidence ALTER COLUMN id SET DEFAULT nextval('public.task_evidence_id_seq'::regclass);


--
-- Name: transaction id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.transaction ALTER COLUMN id SET DEFAULT nextval('public.transaction_id_seq'::regclass);


--
-- Name: user id_old; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public."user" ALTER COLUMN id_old SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_wallet id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_wallet ALTER COLUMN id SET DEFAULT nextval('public.user_wallet_id_seq'::regclass);


--
-- Name: vote id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.vote ALTER COLUMN id SET DEFAULT nextval('public.vote_id_seq'::regclass);


--
-- Name: country country_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_pkey PRIMARY KEY (id);


--
-- Name: featured_project featured_project_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.featured_project
    ADD CONSTRAINT featured_project_pkey PRIMARY KEY (id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: fund_transfer fund_transfer_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.fund_transfer
    ADD CONSTRAINT fund_transfer_pkey PRIMARY KEY (id);


--
-- Name: milestone milestone_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.milestone
    ADD CONSTRAINT milestone_pkey PRIMARY KEY (id);


--
-- Name: project_experience_photo project_experience_photo_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience_photo
    ADD CONSTRAINT project_experience_photo_pkey PRIMARY KEY (id);


--
-- Name: project_experience project_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience
    ADD CONSTRAINT project_experience_pkey PRIMARY KEY (id);


--
-- Name: project_follower project_follower_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_follower
    ADD CONSTRAINT project_follower_pkey PRIMARY KEY (id);


--
-- Name: project_follower project_follower_projectId_userId_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_follower
    ADD CONSTRAINT "project_follower_projectId_userId_key" UNIQUE ("projectId", "userId_old");


--
-- Name: project_funder project_funder_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_funder
    ADD CONSTRAINT project_funder_pkey PRIMARY KEY (id);


--
-- Name: project_funder project_funder_projectId_userId_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_funder
    ADD CONSTRAINT "project_funder_projectId_userId_key" UNIQUE ("projectId", "userId_old");


--
-- Name: project_oracle project_oracle_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_oracle
    ADD CONSTRAINT project_oracle_pkey PRIMARY KEY (id);


--
-- Name: project_oracle project_oracle_projectId_userId_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_oracle
    ADD CONSTRAINT "project_oracle_projectId_userId_key" UNIQUE ("projectId", "userId_old");


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: proposal proposal_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.proposal
    ADD CONSTRAINT proposal_pkey PRIMARY KEY (id);


--
-- Name: proposal proposal_txHash_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.proposal
    ADD CONSTRAINT "proposal_txHash_key" UNIQUE ("txHash");


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);


--
-- Name: task_evidence task_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.task_evidence
    ADD CONSTRAINT task_evidence_pkey PRIMARY KEY (id);


--
-- Name: task task_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);


--
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_wallet user_wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_wallet
    ADD CONSTRAINT user_wallet_pkey PRIMARY KEY (id);


--
-- Name: vote vote_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT vote_pkey PRIMARY KEY (id);


--
-- Name: vote vote_txHash_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.vote
    ADD CONSTRAINT "vote_txHash_key" UNIQUE ("txHash");


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: atixlabs
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: onlyActive; Type: INDEX; Schema: public; Owner: atixlabs
--

CREATE UNIQUE INDEX "onlyActive" ON public.user_wallet USING btree ("userId_old") WHERE active;


--
-- Name: featured_project featured_project_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.featured_project
    ADD CONSTRAINT "featured_project_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);


--
-- Name: user_wallet fk_user; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_wallet
    ADD CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: fund_transfer fund_transfer_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.fund_transfer
    ADD CONSTRAINT "fund_transfer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);


--
-- Name: fund_transfer fund_transfer_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.fund_transfer
    ADD CONSTRAINT "fund_transfer_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."user"(id);


--
-- Name: milestone milestone_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.milestone
    ADD CONSTRAINT "milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: project_experience_photo project_experience_photo_projectExperienceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience_photo
    ADD CONSTRAINT "project_experience_photo_projectExperienceId_fkey" FOREIGN KEY ("projectExperienceId") REFERENCES public.project_experience(id);


--
-- Name: project_experience project_experience_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience
    ADD CONSTRAINT "project_experience_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);


--
-- Name: project_experience project_experience_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience
    ADD CONSTRAINT "project_experience_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: project_follower project_follower_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_follower
    ADD CONSTRAINT "project_follower_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);


--
-- Name: project_follower project_follower_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_follower
    ADD CONSTRAINT "project_follower_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: project_funder project_funder_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_funder
    ADD CONSTRAINT "project_funder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);


--
-- Name: project_funder project_funder_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_funder
    ADD CONSTRAINT "project_funder_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: project_oracle project_oracle_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_oracle
    ADD CONSTRAINT "project_oracle_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);


--
-- Name: project_oracle project_oracle_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_oracle
    ADD CONSTRAINT "project_oracle_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: project project_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT "project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."user"(id);


--
-- Name: task_evidence task_evidence_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.task_evidence
    ADD CONSTRAINT "task_evidence_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.task(id);


--
-- Name: task task_milestoneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES public.milestone(id) ON DELETE CASCADE;


--
-- Name: task task_oracleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "task_oracleId_fkey" FOREIGN KEY ("oracleId") REFERENCES public."user"(id);


--
-- Name: user user_countryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "user_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES public.country(id);


--
-- PostgreSQL database dump complete
--
