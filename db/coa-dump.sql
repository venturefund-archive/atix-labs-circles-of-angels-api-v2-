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
-- Name: activity; Type: TABLE; Schema: public; Owner: atixlabs
--

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


ALTER TABLE public.activity OWNER TO atixlabs;

--
-- Name: activity_file; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.activity_file (
    id integer NOT NULL,
    "activityId" integer NOT NULL,
    "fileId" integer NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    "fileHash" character varying(80)
);


ALTER TABLE public.activity_file OWNER TO atixlabs;

--
-- Name: activity_file_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.activity_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_file_id_seq OWNER TO atixlabs;

--
-- Name: activity_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.activity_file_id_seq OWNED BY public.activity_file.id;


--
-- Name: activity_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_id_seq OWNER TO atixlabs;

--
-- Name: activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.activity_id_seq OWNED BY public.activity.id;


--
-- Name: activity_photo; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.activity_photo (
    id integer NOT NULL,
    "activityId" integer NOT NULL,
    "photoId" integer NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    "fileHash" character varying(80)
);


ALTER TABLE public.activity_photo OWNER TO atixlabs;

--
-- Name: activity_photo_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.activity_photo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_photo_id_seq OWNER TO atixlabs;

--
-- Name: activity_photo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.activity_photo_id_seq OWNED BY public.activity_photo.id;


--
-- Name: answer; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.answer (
    id integer NOT NULL,
    "questionId" integer NOT NULL,
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
-- Name: answer_question; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.answer_question (
    id integer NOT NULL,
    "questionId" integer NOT NULL,
    "answerId" integer NOT NULL,
    "customAnswer" text,
    "userId_old" integer,
    "userId" uuid NOT NULL
);


ALTER TABLE public.answer_question OWNER TO atixlabs;

--
-- Name: answer_question_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.answer_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.answer_question_id_seq OWNER TO atixlabs;

--
-- Name: answer_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.answer_question_id_seq OWNED BY public.answer_question.id;


--
-- Name: blockchain_block; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.blockchain_block (
    id integer NOT NULL,
    "blockNumber" integer NOT NULL,
    "transactionHash" character varying(80) NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL
);


ALTER TABLE public.blockchain_block OWNER TO atixlabs;

--
-- Name: blockchain_block_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.blockchain_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blockchain_block_id_seq OWNER TO atixlabs;

--
-- Name: blockchain_block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.blockchain_block_id_seq OWNED BY public.blockchain_block.id;


--
-- Name: blockchain_status; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.blockchain_status (
    id smallint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.blockchain_status OWNER TO atixlabs;

--
-- Name: configs; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.configs (
    id integer NOT NULL,
    key character varying NOT NULL,
    value character varying,
    "createdAt" date,
    "updatedAt" date
);


ALTER TABLE public.configs OWNER TO atixlabs;

--
-- Name: configs_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.configs_id_seq OWNER TO atixlabs;

--
-- Name: configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.configs_id_seq OWNED BY public.configs.id;


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
    "createdAt" date,
    "updatedAt" date
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
    description text,
    category text,
    "createdAt" date,
    "claimStatus" public.claimstatus DEFAULT 'pending'::public.claimstatus,
    "claimReceiptPath" character varying(200)
);


ALTER TABLE public.milestone OWNER TO atixlabs;

--
-- Name: milestone_activity_status; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.milestone_activity_status (
    status integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.milestone_activity_status OWNER TO atixlabs;

--
-- Name: milestone_budget_status; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.milestone_budget_status (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.milestone_budget_status OWNER TO atixlabs;

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
-- Name: oracle_activity; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.oracle_activity (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "activityId" integer NOT NULL
);


ALTER TABLE public.oracle_activity OWNER TO atixlabs;

--
-- Name: oracle_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.oracle_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.oracle_activity_id_seq OWNER TO atixlabs;

--
-- Name: oracle_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.oracle_activity_id_seq OWNED BY public.oracle_activity.id;


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
-- Name: photo; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.photo (
    id integer NOT NULL,
    path character varying NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    "projectExperienceId" integer
);


ALTER TABLE public.photo OWNER TO atixlabs;

--
-- Name: photo_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.photo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.photo_id_seq OWNER TO atixlabs;

--
-- Name: photo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.photo_id_seq OWNED BY public.photo.id;


--
-- Name: project; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project (
    id integer NOT NULL,
    "projectName" character varying(50) NOT NULL,
    "ownerId_old" integer,
    mission text,
    "problemAddressed" text,
    location text,
    timeframe text,
    status public.projectstatus DEFAULT 'new'::public.projectstatus,
    "goalAmount" numeric NOT NULL,
    "faqLink" character varying,
    "createdAt" date,
    "lastUpdatedStatusAt" timestamp with time zone DEFAULT now(),
    "consensusSeconds" integer DEFAULT 864000,
    "fundingSeconds" integer DEFAULT 864000,
    address character varying(42) DEFAULT NULL::character varying,
    "agreementFileHash" character varying(200),
    "proposalFilePath" character varying(200),
    "txHash" character varying(80) DEFAULT NULL::character varying,
    "coverPhotoPath" character varying(200),
    "cardPhotoPath" character varying(200),
    "milestonePath" character varying(200),
    proposal text,
    "agreementJson" text,
    "rejectionReason" text,
    "ownerId" uuid NOT NULL
);


ALTER TABLE public.project OWNER TO atixlabs;

--
-- Name: project_experience; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project_experience (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "userId_old" integer,
    comment text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone,
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
-- Name: project_experience_photo_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.project_experience_photo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.project_experience_photo_id_seq OWNER TO atixlabs;

--
-- Name: project_experience_photo; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project_experience_photo (
    id integer DEFAULT nextval('public.project_experience_photo_id_seq'::regclass) NOT NULL,
    path character varying(200) NOT NULL,
    "projectExperienceId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.project_experience_photo OWNER TO atixlabs;

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
-- Name: project_status; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project_status (
    status integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.project_status OWNER TO atixlabs;

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
    question text NOT NULL,
    role integer NOT NULL,
    "answerLimit" smallint NOT NULL
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
-- Name: task_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.task_id_seq OWNER TO atixlabs;

--
-- Name: task; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.task (
    id integer DEFAULT nextval('public.task_id_seq'::regclass) NOT NULL,
    "milestoneId" integer,
    "createdAt" date DEFAULT now(),
    "taskHash" character varying(80) DEFAULT NULL::character varying,
    "oracleId_old" integer,
    description text,
    "reviewCriteria" text,
    category text,
    "keyPersonnel" text,
    budget text,
    "oracleId" uuid
);


ALTER TABLE public.task OWNER TO atixlabs;

--
-- Name: task_evidence_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.task_evidence_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.task_evidence_id_seq OWNER TO atixlabs;

--
-- Name: task_evidence; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.task_evidence (
    id integer DEFAULT nextval('public.task_evidence_id_seq'::regclass) NOT NULL,
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
-- Name: transfer_status; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.transfer_status (
    status integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.transfer_status OWNER TO atixlabs;

--
-- Name: user; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public."user" (
    id_old integer NOT NULL,
    "firstName" character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    address character varying,
    "createdAt" date,
    role public.role DEFAULT 'entrepreneur'::public.role NOT NULL,
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
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL
);


ALTER TABLE public."user" OWNER TO atixlabs;

--
-- Name: user_funder; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.user_funder (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "phoneNumber" character varying(80)
);


ALTER TABLE public.user_funder OWNER TO atixlabs;

--
-- Name: user_funder_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.user_funder_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_funder_id_seq OWNER TO atixlabs;

--
-- Name: user_funder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.user_funder_id_seq OWNED BY public.user_funder.id;


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
-- Name: user_project; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.user_project (
    id integer NOT NULL,
    status smallint NOT NULL,
    "userId" integer NOT NULL,
    "projectId" integer NOT NULL
);


ALTER TABLE public.user_project OWNER TO atixlabs;

--
-- Name: user_project_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.user_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_project_id_seq OWNER TO atixlabs;

--
-- Name: user_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.user_project_id_seq OWNED BY public.user_project.id;


--
-- Name: user_social_entrepreneur; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.user_social_entrepreneur (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    company character varying(80),
    "phoneNumber" character varying(80)
);


ALTER TABLE public.user_social_entrepreneur OWNER TO atixlabs;

--
-- Name: user_social_entrepreneur_id_seq; Type: SEQUENCE; Schema: public; Owner: atixlabs
--

CREATE SEQUENCE public.user_social_entrepreneur_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_social_entrepreneur_id_seq OWNER TO atixlabs;

--
-- Name: user_social_entrepreneur_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atixlabs
--

ALTER SEQUENCE public.user_social_entrepreneur_id_seq OWNED BY public.user_social_entrepreneur.id;


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
-- Name: activity id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity ALTER COLUMN id SET DEFAULT nextval('public.activity_id_seq'::regclass);


--
-- Name: activity_file id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity_file ALTER COLUMN id SET DEFAULT nextval('public.activity_file_id_seq'::regclass);


--
-- Name: activity_photo id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity_photo ALTER COLUMN id SET DEFAULT nextval('public.activity_photo_id_seq'::regclass);


--
-- Name: answer id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.answer ALTER COLUMN id SET DEFAULT nextval('public.answer_id_seq'::regclass);


--
-- Name: answer_question id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.answer_question ALTER COLUMN id SET DEFAULT nextval('public.answer_question_id_seq'::regclass);


--
-- Name: blockchain_block id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.blockchain_block ALTER COLUMN id SET DEFAULT nextval('public.blockchain_block_id_seq'::regclass);


--
-- Name: configs id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.configs ALTER COLUMN id SET DEFAULT nextval('public.configs_id_seq'::regclass);


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
-- Name: oracle_activity id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.oracle_activity ALTER COLUMN id SET DEFAULT nextval('public.oracle_activity_id_seq'::regclass);


--
-- Name: pass_recovery id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.pass_recovery ALTER COLUMN id SET DEFAULT nextval('public.pass_recovery_id_seq'::regclass);


--
-- Name: photo id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.photo ALTER COLUMN id SET DEFAULT nextval('public.photo_id_seq'::regclass);


--
-- Name: project id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project ALTER COLUMN id SET DEFAULT nextval('public.project_id_seq'::regclass);


--
-- Name: project_experience id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience ALTER COLUMN id SET DEFAULT nextval('public.project_experience_id_seq'::regclass);


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
-- Name: transaction id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.transaction ALTER COLUMN id SET DEFAULT nextval('public.transaction_id_seq'::regclass);


--
-- Name: user id_old; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public."user" ALTER COLUMN id_old SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_funder id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_funder ALTER COLUMN id SET DEFAULT nextval('public.user_funder_id_seq'::regclass);


--
-- Name: user_project id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_project ALTER COLUMN id SET DEFAULT nextval('public.user_project_id_seq'::regclass);


--
-- Name: user_social_entrepreneur id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_social_entrepreneur ALTER COLUMN id SET DEFAULT nextval('public.user_social_entrepreneur_id_seq'::regclass);


--
-- Name: user_wallet id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_wallet ALTER COLUMN id SET DEFAULT nextval('public.user_wallet_id_seq'::regclass);


--
-- Name: vote id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.vote ALTER COLUMN id SET DEFAULT nextval('public.vote_id_seq'::regclass);


--
-- Data for Name: activity; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.activity (id, "milestoneId", tasks, impact, "impactCriterion", "signsOfSuccess", "signsOfSuccessCriterion", category, "keyPersonnel", budget, status, "transactionHash", "createdAt", "updatedAt", "blockchainStatus", "validatedTransactionHash") FROM stdin;
\.


--
-- Data for Name: activity_file; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.activity_file (id, "activityId", "fileId", "createdAt", "updatedAt", "fileHash") FROM stdin;
\.


--
-- Data for Name: activity_photo; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.activity_photo (id, "activityId", "photoId", "createdAt", "updatedAt", "fileHash") FROM stdin;
\.


--
-- Data for Name: answer; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.answer (id, "questionId", answer) FROM stdin;
1	1	Not yet
2	1	Less than 1 investment in the last 12 months
3	1	1 to 3 investments in the last 12 months
4	1	4-5 investments in the last 12 months
5	1	More than 5 investments in the last 12 months
6	1	I currently only do philanthropy eg: donate to charitable causes online & offline
7	1	Other
8	2	No poverty
9	2	Zero Hunger
10	2	Good Health and Well-Being
11	2	Quality Education
12	2	Gender Equality
13	2	Clean Water and Sanitation
14	2	Affordable and Clean Energy
15	2	Decent Work and Economic Growth
16	2	Industry, Innovation and Infrastructure
17	2	Reduced Inequality
18	2	Sustainable Cities and Communities
19	2	Responsible Consumption and Production
20	2	Climate Action
21	2	Life Below Water
22	2	Life on Land
23	2	Peace and Justice Strong Institutions
24	2	Partnerships to Achieve the Goal
25	3	Grant Funding
26	3	Debt Financing
27	3	Equity Financing
28	3	Combination of blended finance
29	3	Not Yet
30	3	Other
31	4	No poverty
32	4	Zero Hunger
33	4	Good Health and Well-Being
34	4	Quality Education
35	4	Gender Equality
36	4	Clean Water and Sanitation
37	4	Affordable and Clean Energy
38	4	Decent Work and Economic Growth
39	4	Industry, Innovation and Infrastructure
40	4	Reduced Inequality
41	4	Sustainable Cities and Communities
42	4	Responsible Consumption and Production
43	4	Climate Action
44	4	Life Below Water
45	4	Life on Land
46	4	Peace and Justice Strong Institutions
47	4	Partnerships to Achieve the Goal
\.


--
-- Data for Name: answer_question; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.answer_question (id, "questionId", "answerId", "customAnswer", "userId_old", "userId") FROM stdin;
\.


--
-- Data for Name: blockchain_block; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.blockchain_block (id, "blockNumber", "transactionHash", "createdAt", "updatedAt") FROM stdin;
1	314999	0x2eae68c3dcf92e3f079aae324f9362ea7f28ce046707f68ffee718cf1375ceab	2019-07-12 18:13:21.509	2019-10-25 05:04:08.035
\.


--
-- Data for Name: blockchain_status; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.blockchain_status (id, name) FROM stdin;
1	Pending
2	Sent
3	Confirmed
\.


--
-- Data for Name: configs; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.configs (id, key, value, "createdAt", "updatedAt") FROM stdin;
1	coa_bank_account_address	124512asd1234	\N	\N
2	coa_bank_account_bank_name	Singapore Bank	\N	\N
3	coa_bank_account_owner_name	Circles Of Angels	\N	\N
\.


--
-- Data for Name: country; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.country (id, name, "callingCode") FROM stdin;
3	Algeria	\N
30	Brazil	\N
31	British Indian Ocean Territory	\N
61	East Timor	\N
74	France, Metropolitan	\N
77	French Southern Territories	\N
84	Guernsey	\N
95	Heard and Mc Donald Islands	\N
101	Isle of Man	\N
108	Ivory Coast	\N
109	Jersey	\N
118	Kosovo	\N
121	Lao Peoples Democratic Republic	\N
126	Libyan Arab Jamahiriya	\N
131	North Macedonia	\N
181	Reunion	\N
190	Sao Tome and Principe	\N
202	South Georgia South Sandwich Islands	\N
206	St. Helena	\N
207	St. Pierre and Miquelon	\N
208	Sudan	\N
233	United States minor outlying islands	\N
237	Vatican City State	\N
243	Western Sahara	\N
1	Afghanistan	93
2	Albania	355
4	American Samoa	1
5	Andorra	376
6	Angola	244
7	Anguilla	1
8	Antarctica	672
9	Antigua and Barbuda	1
10	Argentina	54
11	Armenia	374
12	Aruba	297
13	Australia	61
14	Austria	43
15	Azerbaijan	994
16	Bahamas	1
17	Bahrain	973
18	Bangladesh	880
19	Barbados	1
20	Belarus	375
21	Belgium	32
22	Belize	501
23	Benin	229
24	Bermuda	1
25	Bhutan	975
26	Bolivia	591
27	Bosnia and Herzegovina	387
28	Botswana	267
29	Bouvet Island	55
32	Brunei Darussalam	673
33	Bulgaria	359
34	Burkina Faso	226
35	Burundi	257
36	Cambodia	855
37	Cameroon	237
38	Canada	1
39	Cape Verde	238
40	Cayman Islands	1
41	Central African Republic	236
42	Chad	235
43	Chile	56
44	China	86
45	Christmas Island	61
46	Cocos (Keeling) Islands	61
47	Colombia	57
48	Comoros	269
50	Republic of Congo	242
49	Democratic Republic of the Congo	243
51	Cook Islands	682
52	Costa Rica	506
53	Croatia (Hrvatska)	385
54	Cuba	53
55	Cyprus	357
56	Czech Republic	420
57	Denmark	45
58	Djibouti	253
59	Dominica	1
60	Dominican Republic	1
62	Ecuador	593
63	Egypt	20
64	El Salvador	503
65	Equatorial Guinea	240
66	Eritrea	291
67	Estonia	372
68	Ethiopia	251
69	Falkland Islands (Malvinas)	500
70	Faroe Islands	298
71	Fiji	679
72	Finland	358
73	France	33
75	French Guiana	594
76	French Polynesia	689
78	Gabon	241
79	Gambia	220
80	Georgia	995
81	Germany	49
82	Ghana	233
83	Gibraltar	350
85	Greece	30
86	Greenland	299
87	Grenada	1
88	Guadeloupe	590
89	Guam	1
90	Guatemala	502
91	Guinea	224
92	Guinea-Bissau	245
93	Guyana	592
94	Haiti	509
96	Honduras	504
97	Hong Kong	852
98	Hungary	36
99	Iceland	354
100	India	91
102	Indonesia	62
103	Iran (Islamic Republic of)	98
104	Iraq	964
105	Ireland	353
106	Israel	972
107	Italy	39
110	Jamaica	1
111	Japan	81
112	Jordan	962
113	Kazakhstan	7
114	Kenya	254
115	Kiribati	686
117	Korea, Republic of	82
116	Korea, Democratic Peoples Republic of	850
119	Kuwait	965
120	Kyrgyzstan	996
122	Latvia	371
123	Lebanon	961
124	Lesotho	266
125	Liberia	231
127	Liechtenstein	423
128	Lithuania	370
129	Luxembourg	352
130	Macau	853
132	Madagascar	261
133	Malawi	265
134	Malaysia	60
135	Maldives	960
136	Mali	223
137	Malta	356
138	Marshall Islands	692
139	Martinique	596
140	Mauritania	222
141	Mauritius	230
142	Mayotte	262
143	Mexico	52
144	Micronesia, Federated States of	691
145	Moldova, Republic of	373
146	Monaco	377
147	Mongolia	976
148	Montenegro	382
149	Montserrat	1
150	Morocco	212
151	Mozambique	258
152	Myanmar	95
153	Namibia	264
154	Nauru	674
155	Nepal	977
156	Netherlands	31
157	Netherlands Antilles	599
158	New Caledonia	687
159	New Zealand	64
160	Nicaragua	505
161	Niger	227
162	Nigeria	234
163	Niue	683
164	Norfolk Island	672
165	Northern Mariana Islands	1
166	Norway	47
167	Oman	968
168	Pakistan	92
169	Palau	680
170	Palestine	970
171	Panama	507
172	Papua New Guinea	675
173	Paraguay	595
174	Peru	51
175	Philippines	63
176	Pitcairn	870
177	Poland	48
178	Portugal	351
179	Puerto Rico	1
180	Qatar	974
182	Romania	40
183	Russian Federation	7
184	Rwanda	250
185	Saint Kitts and Nevis	1
186	Saint Lucia	1
187	Saint Vincent and the Grenadines	1
188	Samoa	685
189	San Marino	378
191	Saudi Arabia	966
192	Senegal	221
193	Serbia	381
194	Seychelles	248
195	Sierra Leone	232
196	Singapore	65
197	Slovakia	421
198	Slovenia	386
199	Solomon Islands	677
200	Somalia	252
201	South Africa	27
204	Spain	34
205	Sri Lanka	94
203	South Sudan	249
209	Suriname	597
210	Svalbard and Jan Mayen Islands	47
211	Swaziland	268
212	Sweden	46
213	Switzerland	41
214	Syrian Arab Republic	963
215	Taiwan	886
216	Tajikistan	992
217	Tanzania, United Republic of	255
218	Thailand	66
219	Togo	228
220	Tokelau	690
221	Tonga	676
222	Trinidad and Tobago	1
223	Tunisia	216
224	Turkey	90
225	Turkmenistan	993
226	Turks and Caicos Islands	1
227	Tuvalu	688
228	Uganda	256
229	Ukraine	380
230	United Arab Emirates	971
231	United Kingdom	44
232	United States	1
234	Uruguay	598
235	Uzbekistan	998
236	Vanuatu	678
238	Venezuela	58
239	Vietnam	84
240	Virgin Islands (British)	1
241	Virgin Islands (U.S.)	1
242	Wallis and Futuna Islands	681
244	Yemen	967
245	Zambia	260
246	Zimbabwe	263
\.


--
-- Data for Name: featured_project; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.featured_project (id, "projectId") FROM stdin;
4	31
5	32
6	33
\.


--
-- Data for Name: file; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.file (id, path, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	2	13 03 2019 create project status table	SQL	V2__13_03_2019_create_project_status_table.sql	-666642714	atixlabs	2019-07-12 18:07:31.911833	7	t
2	3	24 04 2019 create milestone budget status table	SQL	V3__24_04_2019_create_milestone_budget_status_table.sql	1385090560	atixlabs	2019-07-12 18:07:31.956112	17	t
3	4	27 02 2019 create transfer status table	SQL	V4__27_02_2019_create_transfer_status_table.sql	1348075062	atixlabs	2019-07-12 18:07:31.988739	5	t
4	5	11 04 2019 create milestone activity status table	SQL	V5__11_04_2019_create_milestone_activity_status_table.sql	1518344838	atixlabs	2019-07-12 18:07:32.008405	5	t
5	6	08 04 2019 create file table	SQL	V6__08_04_2019_create_file_table.sql	-1451223577	atixlabs	2019-07-12 18:07:32.025701	7	t
6	7	05 04 2019 create photo table	SQL	V7__05_04_2019_create_photo_table.sql	899839721	atixlabs	2019-07-12 18:07:32.046448	13	t
7	8	27 02 2019 create project table	SQL	V8__27_02_2019_create_project_table.sql	-1673124948	atixlabs	2019-07-12 18:07:32.065782	9	t
8	9	03 04 2019 create role table	SQL	V9__03_04_2019_create_role_table.sql	1315326266	atixlabs	2019-07-12 18:07:32.092575	12	t
9	10	27 02 2019 create user table	SQL	V10__27_02_2019_create_user_table.sql	-1345099507	atixlabs	2019-07-12 18:07:32.11565	11	t
10	11	13 03 2019 create milestone table	SQL	V11__13_03_2019_create_milestone_table.sql	-933726725	atixlabs	2019-07-12 18:07:32.132166	8	t
11	12	13 03 2019 create activity table	SQL	V12__13_03_2019_create_activity_table.sql	-1595447584	atixlabs	2019-07-12 18:07:32.147165	14	t
12	13	27 02 2019 create fund transfer table	SQL	V13__27_02_2019_create_fund_transfer_table.sql	-764271505	atixlabs	2019-07-12 18:07:32.168345	11	t
13	14	27 02 2019 create configs table	SQL	V14__27_02_2019_create_configs_table.sql	1261045174	atixlabs	2019-07-12 18:07:32.186484	4	t
14	15	19 03 2019 create user project table	SQL	V15__19_03_2019_create_user_project_table.sql	587102864	atixlabs	2019-07-12 18:07:32.203131	5	t
15	16	08 04 2019 create activity photo table	SQL	V16__08_04_2019_create_activity_photo_table.sql	-821844075	atixlabs	2019-07-12 18:07:32.215361	4	t
16	17	08 04 2019 create activity file table	SQL	V17__08_04_2019_create_activity_file_table.sql	1277351208	atixlabs	2019-07-12 18:07:32.226218	4	t
17	18	05 04 2019 create oracle activity table	SQL	V18__05_04_2019_create_oracle_activity_table.sql	-2020955035	atixlabs	2019-07-12 18:07:32.23714	5	t
18	19	03 04 2019 insert into role	SQL	V19__03_04_2019_insert_into_role.sql	-867376885	atixlabs	2019-07-12 18:07:32.249017	3	t
19	20	14 03 2019 insert into project status	SQL	V20__14_03_2019_insert_into_project_status.sql	-2048499335	atixlabs	2019-07-12 18:07:32.257118	2	t
20	21	15 04 2019 insert into transfer status	SQL	V21__15_04_2019_insert_into_transfer_status.sql	-62758043	atixlabs	2019-07-12 18:07:32.265814	2	t
21	22	24 04 2019 insert into milestone budget status	SQL	V22__24_04_2019_insert_into_milestone_budget_status.sql	-419272468	atixlabs	2019-07-12 18:07:32.273523	2	t
22	23	26 04 2019 insert into milestone activity status	SQL	V23__26_04_2019_insert_into_milestone_activity_status.sql	-1939937604	atixlabs	2019-07-12 18:07:32.280678	3	t
23	24	26 04 2019 add pk project status table	SQL	V24__26_04_2019_add_pk_project_status_table.sql	1463858887	atixlabs	2019-07-12 18:07:32.288707	5	t
24	25	26 04 2019 add pk transfer status table	SQL	V25__26_04_2019_add_pk_transfer_status_table.sql	-355491554	atixlabs	2019-07-12 18:07:32.299345	5	t
25	26	26 04 2019 add pk milestone activity status table	SQL	V26__26_04_2019_add_pk_milestone_activity_status_table.sql	-1839395841	atixlabs	2019-07-12 18:07:32.312856	6	t
26	27	26 04 2019 add creationeTransactionHash column	SQL	V27__26_04_2019_add_creationeTransactionHash_column.sql	-1839306166	atixlabs	2019-07-12 18:07:32.327767	1	t
27	28	26 04 2019 alter project table set link null	SQL	V28__26_04_2019_alter_project_table_set_link_null.sql	686292908	atixlabs	2019-07-12 18:07:32.334237	1	t
28	561.1	30 04 2019 create table user registration status	SQL	V561.1__30_04_2019_create_table_user_registration_status.sql	-1385131858	atixlabs	2019-07-12 18:07:32.340724	4	t
29	561.2	30 04 2019 insert into user registration status	SQL	V561.2__30_04_2019_insert_into_user_registration_status.sql	-1884940114	atixlabs	2019-07-12 18:07:32.350164	2	t
30	561.3	30 04 2019 add column user registration status to user table	SQL	V561.3__30_04_2019_add_column_user_registration_status_to_user_table.sql	1946606964	atixlabs	2019-07-12 18:07:32.357552	6	t
31	562.1	30 04 2019 alter user table remove privKey	SQL	V562.1__30_04_2019_alter_user_table_remove_privKey.sql	-1156372308	atixlabs	2019-07-12 18:07:32.368635	1	t
32	564.1	30 04 2019 create user funder table	SQL	V564.1__30_04_2019_create_user_funder_table.sql	-790107122	atixlabs	2019-07-12 18:07:32.37569	3	t
33	564.2	30 04 2019 create user social entrepreneur table	SQL	V564.2__30_04_2019_create_user_social_entrepreneur_table.sql	493047715	atixlabs	2019-07-12 18:07:32.384432	3	t
34	579.1	2 05 2019 create question table	SQL	V579.1__2_05_2019_create_question_table.sql	-455068215	atixlabs	2019-07-12 18:07:32.393376	4	t
35	579.2	2 05 2019 create answer table	SQL	V579.2__2_05_2019_create_answer_table.sql	903978698	atixlabs	2019-07-12 18:07:32.402256	5	t
36	579.3	2 05 2019 create answer question table	SQL	V579.3__2_05_2019_create_answer_question_table.sql	1007475414	atixlabs	2019-07-12 18:07:32.412865	10	t
37	579.4	2 05 2019 insert on question table	SQL	V579.4__2_05_2019_insert_on_question_table.sql	-2074298942	atixlabs	2019-07-12 18:07:32.428153	1	t
38	579.5	2 05 2019 insert on answer table	SQL	V579.5__2_05_2019_insert_on_answer_table.sql	-1496902618	atixlabs	2019-07-12 18:07:32.434613	11	t
39	579.6	06 05 2019 insert into question table se	SQL	V579.6__06_05_2019_insert_into_question_table_se.sql	512224707	atixlabs	2019-07-12 18:07:32.450357	1	t
40	579.7	06 05 2019 insert into answer table se	SQL	V579.7__06_05_2019_insert_into_answer_table_se.sql	1616159999	atixlabs	2019-07-12 18:07:32.460157	14	t
41	592.1	07 06 2019 alter user social entrepreneur drop company not null	SQL	V592.1__07_06_2019_alter_user_social_entrepreneur_drop_company_not_null.sql	297272055	atixlabs	2019-07-12 18:07:32.478697	1	t
42	598.1	10 05 2019 create project experience table	SQL	V598.1__10_05_2019_create_project_experience_table.sql	-1614910425	atixlabs	2019-07-12 18:07:32.485083	6	t
43	598.2	14 05 2019 add experienceId column to photo table	SQL	V598.2__14_05_2019_add_experienceId_column_to_photo_table.sql	242056699	atixlabs	2019-07-12 18:07:32.495984	2	t
44	627.1	9 05 2019 create pass recovery table	SQL	V627.1__9_05_2019_create_pass_recovery_table.sql	1703805290	atixlabs	2019-07-12 18:07:32.502518	4	t
45	651	23 05 2019 insert status on milestone budget status	SQL	V651__23_05_2019_insert_status_on_milestone_budget_status.sql	-2081046804	atixlabs	2019-07-12 18:07:32.511986	2	t
46	655	24 05 2019 create blockchain status table	SQL	V655__24_05_2019_create_blockchain_status_table.sql	1299217276	atixlabs	2019-07-12 18:07:32.517935	3	t
47	655.1	24 05 2019 insert on blockchain status table	SQL	V655.1__24_05_2019_insert_on_blockchain_status_table.sql	-552562707	atixlabs	2019-07-12 18:07:32.52567	1	t
48	655.2	24 05 2019 alter project milestone activity table	SQL	V655.2__24_05_2019_alter_project_milestone_activity_table.sql	-694190660	atixlabs	2019-07-12 18:07:32.531515	15	t
49	671	29 05 2019 create blockchain block table	SQL	V671__29_05_2019_create_blockchain_block_table.sql	337358993	atixlabs	2019-07-12 18:07:32.553914	3	t
50	678	24 06 2019 alter fund transfer add unique transferId	SQL	V678__24_06_2019_alter_fund_transfer_add_unique_transferId.sql	1797650819	atixlabs	2019-07-12 18:07:32.563294	2	t
51	678.1	25 06 2019 alter activity add column validatedTransactionHash	SQL	V678.1__25_06_2019_alter_activity_add_column_validatedTransactionHash.sql	-1095129861	atixlabs	2019-07-12 18:07:32.569338	1	t
52	679	13 06 2019 insert bank account config	SQL	V679__13_06_2019_insert_bank_account_config.sql	-1650378400	atixlabs	2019-07-12 18:07:32.574902	2	t
53	702	6 06 2019 alter project table	SQL	V702__6_06_2019_alter_project_table.sql	-277973677	atixlabs	2019-07-12 18:07:32.581143	9	t
54	702.1	25 06 2019 alter user table	SQL	V702.1__25_06_2019_alter_user_table.sql	-1982132771	atixlabs	2019-07-12 18:07:32.595092	10	t
55	729	19 06 2019 create transaction table	SQL	V729__19_06_2019_create_transaction_table.sql	1992043060	atixlabs	2019-07-12 18:07:32.610025	4	t
56	742	26 06 2019 alter transaction table	SQL	V742__26_06_2019_alter_transaction_table.sql	1241837103	atixlabs	2019-07-12 18:07:32.61866	1	t
57	742.1	2 07 2019 alter transaction table	SQL	V742.1__2_07_2019_alter_transaction_table.sql	2109111940	atixlabs	2019-07-12 18:07:32.623971	2	t
58	742.2	2 07 2019 alter transaction table	SQL	V742.2__2_07_2019_alter_transaction_table.sql	577377586	atixlabs	2019-07-12 18:07:32.630343	1	t
\.


--
-- Data for Name: fund_transfer; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.fund_transfer (id, "transferId", "senderId_old", "destinationAccount", currency, "projectId", status, "createdAt", amount, "rejectionReason", "txHash", "receiptPath", "senderId") FROM stdin;
22	89796562188	42	CHASUS84621	USD	23	verified	2021-02-03	180000	\N	0x890e6c2e2798053e4e7e6e8a1786657d7d68b21425b35dee794b4378fb473ee4	/files/projects/transfers/9/9ca6bbee02dd195d21a8eea84e821cce.png	3d07c69e-2245-4371-a3a9-6cc8577dd911
23	42312178	42	NSBSNO318567	USD	30	verified	2021-02-03	20000	\N	0xcbc4a3ed2927e9197fc6d78a2b9674341834cd7a1a6ff711ea31703bc52d94ba	/files/projects/transfers/3/3a98c0bf39d872a1aaca23faa36863b7.jpeg	3d07c69e-2245-4371-a3a9-6cc8577dd911
24	0876876908987987	42	CHASTH33654	USD	32	verified	2021-02-03	2000	\N	0x2792887eda6891aa7be7954a396625529843117c350abb56db9dbfd15d84c9b1	/files/projects/transfers/b/bd00fbe06c2a7e989bd460fc4914a08a.png	3d07c69e-2245-4371-a3a9-6cc8577dd911
18	7521415853388	47	CHASUS77961	USD	25	verified	2021-02-03	75000	\N	0xebec9f7546de0b3a09402654f0f2962b853329185db11b565b952dad1f21d793	/files/projects/transfers/9/9ca6bbee02dd195d21a8eea84e821cce.png	b61fd1df-41f6-470a-a076-bd8728d215e4
25	08768769089879873	42	CHASTH33654	USD	33	verified	2021-02-03	20000	\N	0x7eaf37a5aa18c0aed15787907770eebac3611df7e18bebd9e264a2ef47261f71	/files/projects/transfers/b/bd00fbe06c2a7e989bd460fc4914a08a.png	3d07c69e-2245-4371-a3a9-6cc8577dd911
19	13467982554	42	CHASUS77961	USD	25	verified	2021-02-03	55000	\N	0xcdf6457e49d83a293addef2f1bafbab1f770afd066221cc18ec6d988f8acf075	/files/projects/transfers/9/9ca6bbee02dd195d21a8eea84e821cce.png	3d07c69e-2245-4371-a3a9-6cc8577dd911
20	794613528679	42	VINBVI53753	USD	29	verified	2021-02-03	754000	\N	0x0b76816449e04da1d3fd61a922864b9b0f29b274c1ccd731bba60de5604d696d	/files/projects/transfers/3/3a98c0bf39d872a1aaca23faa36863b7.jpeg	3d07c69e-2245-4371-a3a9-6cc8577dd911
17	782168131869	47	VINBVI53753	USD	29	verified	2021-02-03	1000000	\N	0x36e34b7c57122d6c82efab876ee2b739c29df27fb19d4c7303b6f89d4c411005	/files/projects/transfers/5/5c6d560f8f0223ced8968e2da9413dc1.png	b61fd1df-41f6-470a-a076-bd8728d215e4
21	34219879525	42	DJBNDJ55275	USD	28	verified	2021-02-03	900000	\N	0xb5a2f69e4462607b01936ffd40058572d5f7b88abea27feb235cb07b7814e25b	/files/projects/transfers/1/1f8126cc0a67e5434b26e487f1b8a4b2.jpeg	3d07c69e-2245-4371-a3a9-6cc8577dd911
27	1251831581	42	5s1f5af1d515	USD	24	verified	2021-02-09	12350000	\N	0xd35003a5a7b30714d92d1938c94a9cce5ef358a0028a4d6287422244d5d7b4ae	/files/projects/transfers/9/9ca6bbee02dd195d21a8eea84e821cce.png	3d07c69e-2245-4371-a3a9-6cc8577dd911
28	5sdv5g5e1sv	45	ajsfaf51b5af1	usd	31	verified	2021-02-09	190000	\N	0xf0ca1f3dfe07f2ced12b29196e87a1492238850cabe8bc2c07c1190d313e408a	/files/projects/transfers/7/7970ae4facc2505cbe2aa5bb992b6945.jpeg	bba1cc12-910f-47e3-9b48-b37b38c356e7
26	08768769089879833	42	CHASTH33654	USD	32	verified	2021-02-04	46000	\N	0xc2d79dc5a4ae04dae1f6f4e6ab4da6d8e279fdda292b0e2563bc44d4e33612fa	/files/projects/transfers/b/bd00fbe06c2a7e989bd460fc4914a08a.png	3d07c69e-2245-4371-a3a9-6cc8577dd911
\.


--
-- Data for Name: milestone; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.milestone (id, "projectId", description, category, "createdAt", "claimStatus", "claimReceiptPath") FROM stdin;
73	31	Clinical Expansion - Expected Changes/ Social Impact 	Expansion	2021-02-03	transferred	/files/projects/milestones/claim/d/d46b4923757330dbef548a7a8ef66adc.jpeg
50	22	NBCC’s Team Leader Training	Training	2021-02-01	pending	\N
51	22	NBCC’s Center for Advocacy Training Online	Training	2021-02-01	pending	\N
56	24	Provide drinking water	Development	2021-02-02	pending	\N
57	24	Build Parks	Urbanization	2021-02-02	pending	\N
59	25	Find Partners	Partnerships	2021-02-02	pending	\N
60	25	Campaigns	Operations	2021-02-02	pending	\N
62	26	Hire Teachers	Employment	2021-02-02	pending	\N
63	27	Build sports fields	Building	2021-02-02	pending	\N
74	31	Mobile App Upgradation & Expansion	Expansion	2021-02-03	transferred	/files/projects/milestones/claim/9/9e394d5767b6aeeb5622bed8546d7e97.jpeg
79	35	Disbursed at least 20k USD of FISA to students	FISA Disbursed	2021-02-25	pending	\N
70	30	Find Building to provide education	Location	2021-02-03	pending	\N
71	30	Start Opeations	Operations	2021-02-03	pending	\N
80	36	Milestone 1	Cat 1	2021-04-06	pending	\N
69	30	Create a program	Operations	2021-02-03	claimed	\N
81	38	Rent the factory	Setup Expenditures	2021-04-07	pending	\N
58	25	Start Opeations	Operations	2021-02-02	transferred	/files/projects/milestones/claim/9/9ca6bbee02dd195d21a8eea84e821cce.png
61	26	sdfsadfsadfsadfsdf	asdfasdfasdfsdafsadf	2021-02-02	pending	\N
82	40	Milestone 1	Category	2021-09-15	pending	\N
83	41	Project Set Up	General	2021-09-27	pending	\N
52	23	Begin operations in North America	Foundation	2021-02-02	transferred	/files/projects/milestones/claim/9/9ca6bbee02dd195d21a8eea84e821cce.png
84	42	Setup	General	2021-09-28	pending	\N
53	23	Expansion to other continents	Expansion	2021-02-02	transferred	/files/projects/milestones/claim/5/5c6d560f8f0223ced8968e2da9413dc1.png
76	32	Secure full time work for weavers - Expected Changes/ Social Impact T	 -	2021-02-03	pending	\N
66	29	Buy land	Building	2021-02-03	transferred	/files/projects/milestones/claim/9/9ca6bbee02dd195d21a8eea84e821cce.png
55	24	Build sewer system	Development	2021-02-02	transferred	/files/projects/milestones/claim/5/544779ad82e9abc717521a717cab5186.jpeg
77	33	Disbursed at least 20k USD of FISA to students	FISA Disbursed	2021-02-03	transferred	/files/projects/milestones/claim/8/8e6a495b399cdb056f194ff05ef22ad4.jpeg
64	28	Vaccinate 50.000 people	Health	2021-02-03	transferred	/files/projects/milestones/claim/8/8e6a495b399cdb056f194ff05ef22ad4.jpeg
65	28	Promotion of barrier methods	Health	2021-02-03	transferred	/files/projects/milestones/claim/8/8e6a495b399cdb056f194ff05ef22ad4.jpeg
78	34	test	test	2021-02-09	pending	\N
67	29	Build Hospital	Building	2021-02-03	transferred	/files/projects/milestones/claim/8/8e6a495b399cdb056f194ff05ef22ad4.jpeg
68	29	Hire Employees	Employment	2021-02-03	transferred	/files/projects/milestones/claim/9/9e394d5767b6aeeb5622bed8546d7e97.jpeg
72	31	HR Expansion - Expected Changes/ Social Impact Targets: Create more jobs	Employment	2021-02-03	transferred	/files/projects/milestones/claim/9/9e394d5767b6aeeb5622bed8546d7e97.jpeg
75	32	Secure raw materials for Robb Vices hammock production	Raw materials expenditure	2021-02-03	claimable	\N
\.


--
-- Data for Name: milestone_activity_status; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.milestone_activity_status (status, name) FROM stdin;
1	Pending
2	Started
3	Verified
4	Completed
\.


--
-- Data for Name: milestone_budget_status; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.milestone_budget_status (id, name) FROM stdin;
1	Claimable
2	Claimed
3	Funded
4	Blocked
\.


--
-- Data for Name: oracle_activity; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.oracle_activity (id, "userId", "activityId") FROM stdin;
\.


--
-- Data for Name: pass_recovery; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.pass_recovery (id, token, email, "createdAt") FROM stdin;
8	c8f0000cc534c6a1dd80bbfbfdb9b56b79d58207ae5da543df	milagi+se1@atixlabs.com	2021-09-14 20:29:51.483+00
\.


--
-- Data for Name: photo; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.photo (id, path, "createdAt", "updatedAt", "projectExperienceId") FROM stdin;
\.


--
-- Data for Name: project; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.project (id, "projectName", "ownerId_old", mission, "problemAddressed", location, timeframe, status, "goalAmount", "faqLink", "createdAt", "lastUpdatedStatusAt", "consensusSeconds", "fundingSeconds", address, "agreementFileHash", "proposalFilePath", "txHash", "coverPhotoPath", "cardPhotoPath", "milestonePath", proposal, "agreementJson", "rejectionReason", "ownerId") FROM stdin;
28	Health for Djibouti	41	This activity will help to provide medical screenings and treatment for stranded migrants along the migratory route. The mobile patrol programme is part of the Better Migration Management programme (BMM), which is funded by the European Union and the German Federal Ministry for Economic Cooperation and Development (BMZ), and the Addressing Mixed Migration flows in Eastern Africa (AMMi) project funded by the European Union and Expertise France.	There're many vulnerable migrants who come from Yemen or travel to Yemen via Djibouti in various regions in Djibouti. In Obock, migrants seeking assistance come to the Migration Response Centre (MRC) and are provided with food, water and medical treatment.	Djibouti	1 year	executing	900000	\N	2021-02-03	2021-02-03 18:30:00.462+00	300	300	0xb95fCe0b405C5e81f1c34d8cfa77E0D4f2811866	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	0x0b07284a4d799fe076cde9ad3ffe34adbf77f8e8b8595e2d395eb413f11895ee	/files/projects/coverPhotos/0/0a0a22b79104f5cfc37ab14250ae0567.jpeg	/files/projects/cardPhotos/0/0a0a22b79104f5cfc37ab14250ae0567.jpeg	\N	<p>The Ministry of Health of Djibouti in collaboration with IOM, the UN Migration Agency’s office in Djibouti have launched a mobile patrol programme on 12 December 2017 to assist migrants in all five regions of the country.</p><p>This activity will help to provide medical screenings and treatment for stranded migrants along the migratory route. The mobile patrol programme is part of the Better Migration Management programme (BMM), which is funded by the European Union and the German Federal Ministry for Economic Cooperation and Development (BMZ), and the Addressing Mixed Migration flows in Eastern Africa (AMMi) project funded by the European Union and Expertise France.</p><p>Djibouti’s Minister of the Interior, Hassan Omar Mohamed gave the opening address, Djibouti is a land of asylum and destination for many vulnerable migrants but also a country of bi-directional movements for thousands of migrants from neighbouring countries to other countries, including the Arabian Peninsula.</p><p>Referring to the UN World Human Rights Day, he stressed that Djibouti is destined to preserve the dignity of everyone and to guarantee the same value to all, as human rights are inalienable and universal.</p><p>More than 300 migrants transit Djibouti every day. Mainly from the Horn of Africa, these migrants continue to cross Djibouti to Yemen and other countries in the Gulf due to limited economic opportunities, instability and environmental degradation in their homeland.</p><p>The Minister of Health, Dr. Djama Elmi Okieh highlighted that the programme aims to provide primary and emergency health care to vulnerable populations to reduce mortality on migratory routes and to prevent the associated health risks that may affect host populations.</p><p>The mobile patrol will operate twice a week from December 2017. Doctors and nurses from the Ministry of Health and IOM medical team will provide medical treatment and water to migrants on the road who are mostly suffering from dehydration. Those who present serious conditions or have critical medical conditions will be referred to a local hospital in the region where they will receive medical care.</p><p>IOM Djibouti provides assistance to vulnerable migrants who come from Yemen or travel to Yemen via Djibouti in various regions in Djibouti. In Obock, migrants seeking assistance come to the Migration Response Centre (MRC) and are provided with food, water and medical treatment.</p>	{"name":"Health for Djibouti","mission":"This activity will help to provide medical screenings and treatment for stranded migrants along the migratory route. The mobile patrol programme is part of the Better Migration Management programme (BMM), which is funded by the European Union and the German Federal Ministry for Economic Cooperation and Development (BMZ), and the Addressing Mixed Migration flows in Eastern Africa (AMMi) project funded by the European Union and Expertise France.","problem":"There're many vulnerable migrants who come from Yemen or travel to Yemen via Djibouti in various regions in Djibouti. In Obock, migrants seeking assistance come to the Migration Response Centre (MRC) and are provided with food, water and medical treatment.","owner":{"firstName":"SE","lastName":"1","email":"milagi+se1@atixlabs.com","address":"0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543"},"milestones":[{"description":"Vaccinate 50.000 people","goal":750000,"tasks":[{"id":"0x1480d0bc762e580cdd7e0b4e920dcaedbb3cff17856580d3f887efb2ade5d452","oracle":45,"description":"Vaccinate 10000 people against measles","reviewCriteria":"Vaccinated people","category":"Health","keyPersonnel":"Carla Morales"},{"id":"0x66ccb75be847692b1cbd560dd95328b3976b965afad5240b81108777c4e3e574","oracle":45,"description":"Vaccinate 10000 people against poliomyelitis","reviewCriteria":"Vaccinated people","category":"Health","keyPersonnel":"Carla Morales"},{"id":"0x3d29a171a06754a3d983cb94f4077bf1b233feabbe454b9de84ef1ca8c822921","oracle":45,"description":"Vaccinate 20000 people against smallpox","reviewCriteria":"Vaccinated people","category":"Health","keyPersonnel":"Carla Morales"},{"id":"0xbd239c231db8343827175e5dc71d362343d802d03addb857be98e84348d4c313","oracle":45,"description":"Vaccinate 10000 people against tetanus","reviewCriteria":"Vaccinated people","category":"Health","keyPersonnel":"Carolina Ramirez"}]},{"description":"Promotion of barrier methods","goal":150000,"tasks":[{"id":"0x18ab93b2100c1c1a32dae39257c03d4e3a29502aa9db4f5af0b01c07b543d7ec","oracle":45,"description":"Distribution of barrier methods","reviewCriteria":"Amount of barrier methods distributed","category":"Health","keyPersonnel":"Carla Morales"}]}],"funders":[{"firstName":"Supporter","lastName":"1","email":"milagi+supporter1@atixlabs.com","address":"0xcA0902f12C63D9619a62131642CA5F07aF1AE93d"}]}	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
25	Feed the Children	41	Feed the Children dares to envision a world where no child goes to bed hungry. In the U.S. and internationally, we are dedicated to helping families and communities achieve stable lives and to reducing the need for help tomorrow while providing food and resources to help them today. 	As of 2018, 10.7% of families in the U.S. relied on SNAP (Supplemental Nutrition Assistance Program) to make ends meet. Nearly half of those households (46.8%) already live below the poverty line. And food stamps don’t go very far. According to data from the Food and Nutrition Service, average monthly household SNAP benefit in fiscal year 2018 was $251.That works out to just over $8 per day.\n\nSNAP benefits can be used to buy groceries, seeds, and plants to grow food, but they cannot be used for vitamins, medicine, prepared or heated food, diapers, cleaning supplies, hygiene items, or toilet paper.	Global	1 year	aborted	130000	\N	2021-02-02	2021-02-03 19:26:49.249+00	86000	86000	0xbEa72272BeBFdECAAEb124659dC12d897230bA6e	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	0x4fba6308ec18f07acc7698912de4940b35665745ffa723808d95a81eae9fb92a	/files/projects/coverPhotos/a/a7da974ddbd3e46994097fc86eb4c6ca.jpeg	/files/projects/cardPhotos/a/a7da974ddbd3e46994097fc86eb4c6ca.jpeg	\N	<p>N/A</p>	{"name":"Feed the Children","mission":"Feed the Children dares to envision a world where no child goes to bed hungry. In the U.S. and internationally, we are dedicated to helping families and communities achieve stable lives and to reducing the need for help tomorrow while providing food and resources to help them today. ","problem":"As of 2018, 10.7% of families in the U.S. relied on SNAP (Supplemental Nutrition Assistance Program) to make ends meet. Nearly half of those households (46.8%) already live below the poverty line. And food stamps don’t go very far. According to data from the Food and Nutrition Service, average monthly household SNAP benefit in fiscal year 2018 was $251.That works out to just over $8 per day.\\n\\nSNAP benefits can be used to buy groceries, seeds, and plants to grow food, but they cannot be used for vitamins, medicine, prepared or heated food, diapers, cleaning supplies, hygiene items, or toilet paper.","owner":{"firstName":"SE","lastName":"1","email":"milagi+se1@atixlabs.com","address":"0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543"},"milestones":[{"description":"Start Opeations","goal":75000,"tasks":[{"id":"0x10b85d5f883f81da22c4796503e829d39fcedc01df362398d0789711bcd04b88","oracle":45,"description":"Hire full time employees","reviewCriteria":"Employees","category":"Employment","keyPersonnel":"Jessica Perez"}]},{"description":"Find Partners","goal":5000,"tasks":[{"id":"0xc45f6a5561028162106386aee8abef04baab75f305baf74d93626af3bb936f99","oracle":45,"description":"Find 5 partners","reviewCriteria":"Partners found","category":"Partnerships","keyPersonnel":"Jessica Perez"}]},{"description":"Campaigns","goal":50000,"tasks":[{"id":"0x64257e80da4c8ae4824833c0a8616ad81016e9007709da221ae5025c7a73ce36","oracle":45,"description":"Feed 10000 children","reviewCriteria":"Children fed","category":"Operations","keyPersonnel":"Jessica Perez"}]}],"funders":[{"firstName":"Supporter","lastName":"3","email":"milagi+supporter3@atixlabs.com","address":null},{"firstName":"Supporter","lastName":"1","email":"milagi+supporter1@atixlabs.com","address":"0xcA0902f12C63D9619a62131642CA5F07aF1AE93d"}]}	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
23	Make-A-Wish	41	A wish experience can be a game-changer for a child with a critical illness. \nThis one belief guides us in everything we do at Make-A-Wish. It inspires us to grant life-changing wishes for children going through so much. It compels us to be creative in exceeding the expectations of every wish kid. It drives us to make our donated resources go as far as possible. Most of all, it's the founding principle of our vision to grant the wish of every eligible child.\n\nThis is our mission:\nTogether, we create life-changing wishes for children with critical illnesses.\n\nWishes are more than just a nice thing. And they are far more than gifts, or singular events in time. Wishes impact everyone involved—wish kids, volunteers, donors, sponsors, medical professionals and communities. For wish kids, just the act of making their wish come true can give them the courage to comply with their medical treatments. Parents might finally feel like they can be optimistic. And still others might realize all they have to offer the world through volunteer work or philanthropy.	Make-A-Wish® grants life-changing wishes for children with critical illnesses. By joining a caring community of people who improve the lives of children battling critical illnesses, you have the unique ability to transform a child and family’s life during some of their most difficult trials. That is because a wish creates an opportunity for hope and the chance to experience life beyond illness. \n\nA 2015 study* revealed that a wish can give a child the resilience he or she needs to fight a critical illness. In fact, a wish can often improve a child’s emotional well-being and give them a better chance of recovering. Researchers have found that wishing enables a child to see the impossible as possible. 	Worldwide	1 Year	finished	180000	\N	2021-02-02	2021-02-09 18:12:48.334+00	86000	86000	0xC5813968D8051c0E4Ff96E6a739028DC546Dd30e	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	0x0a4050f2dd766b8ae2be779bbd265fd7e6a6775eaf9a2e305f61e5d0ee8b6a59	/files/projects/coverPhotos/1/17ad16b7642c03116c5a791a70816a04.jpeg	/files/projects/cardPhotos/1/17ad16b7642c03116c5a791a70816a04.jpeg	\N	<p>N/A</p>	{"name":"Make-A-Wish","mission":"A wish experience can be a game-changer for a child with a critical illness. \\nThis one belief guides us in everything we do at Make-A-Wish. It inspires us to grant life-changing wishes for children going through so much. It compels us to be creative in exceeding the expectations of every wish kid. It drives us to make our donated resources go as far as possible. Most of all, it's the founding principle of our vision to grant the wish of every eligible child.\\n\\nThis is our mission:\\nTogether, we create life-changing wishes for children with critical illnesses.\\n\\nWishes are more than just a nice thing. And they are far more than gifts, or singular events in time. Wishes impact everyone involved—wish kids, volunteers, donors, sponsors, medical professionals and communities. For wish kids, just the act of making their wish come true can give them the courage to comply with their medical treatments. Parents might finally feel like they can be optimistic. And still others might realize all they have to offer the world through volunteer work or philanthropy.","problem":"Make-A-Wish® grants life-changing wishes for children with critical illnesses. By joining a caring community of people who improve the lives of children battling critical illnesses, you have the unique ability to transform a child and family’s life during some of their most difficult trials. That is because a wish creates an opportunity for hope and the chance to experience life beyond illness. \\n\\nA 2015 study* revealed that a wish can give a child the resilience he or she needs to fight a critical illness. In fact, a wish can often improve a child’s emotional well-being and give them a better chance of recovering. Researchers have found that wishing enables a child to see the impossible as possible. ","owner":{"firstName":"SE","lastName":"1","email":"milagi+se1@atixlabs.com","address":"0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543"},"milestones":[{"description":"Begin operations in North America","goal":125000,"tasks":[{"id":"0x32366d63c1c8db899355f9876e80f0ecd0601ccec3886e1a86670feb996560fd","oracle":45,"description":"Create headquarters","reviewCriteria":"Headquarters office","category":"Location","keyPersonnel":"Sophia Valdez"},{"id":"0x62e67c8afdfb97e2e870a72fe2eed3f0bcfc24ee7f545e70113c2e6728e5ad66","oracle":45,"description":"Build office in West Coast","reviewCriteria":"Built office","category":"Building","keyPersonnel":"Sophia Valdez"}]},{"description":"Expansion to other continents","goal":55000,"tasks":[{"id":"0x6c3f4cbcbdd8783a35eb96afba8f2562c83ed392b8a6fce45088cefddbc1a10f","oracle":45,"description":"Settle in South America","reviewCriteria":"Have an office in South America","category":"Operations","keyPersonnel":"Tom Richards"},{"id":"0xe529c1d2a2256667435f79ae586532efa8948e61a9eb80f1ecbb29464252b880","oracle":45,"description":"Settle in Africa","reviewCriteria":"Have an office in Africa","category":"Operations","keyPersonnel":"Laura Simpson"}]}],"funders":[{"firstName":"Supporter","lastName":"1","email":"milagi+supporter1@atixlabs.com","address":"0xcA0902f12C63D9619a62131642CA5F07aF1AE93d"}]}	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
27	Amazing Kids	41	Build a sports field in Nairobi, Kenia, so kids living in high poverty can use it to practice different sports and take them out of the streets.	26% of kids living in high poverty in Nairobi end up consuming drungs when they become adolescents. 	Kenya	6 months	toreview	19000	\N	2021-02-02	2021-02-03 20:39:39.711+00	300	300	\N	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	\N	/files/projects/coverPhotos/3/3c902124fa8b5069bd741aa92647c16d.jpeg	/files/projects/cardPhotos/2/2bcf5e00ce16d2e42dfc4d92c5897e50.jpeg	\N	<p>The project consists on:</p><p>-Building a soccer field</p><p>-Building a volleyball court</p><p>-Building a running track</p><p>-Building a tennis court</p><p>-Building a locker room</p>	\N	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
30	Training for Refugees	41	Provide education in various trades for refugees such as carpentry, plumbing and electricity so that they can enter the job market as soon as possible and have a better future.	70% of refugees that come to Norway have difficulties to find a job.	Norway	6 months	executing	20000	\N	2021-02-03	2021-02-03 19:45:00.22+00	86000	86000	0xa50cca5B43B937Ed157035fb16Bb655C78E6EF51	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	0x98db7ad8d05238db0ac065700376d3bf4c6b92929153656a4bdb422fb29169d9	/files/projects/coverPhotos/0/019395a3e558d9f46cad05660f32fbdc.jpeg	/files/projects/cardPhotos/0/019395a3e558d9f46cad05660f32fbdc.jpeg	\N	<p>N/A</p>	{"name":"Training for Refugees","mission":"Provide education in various trades for refugees such as carpentry, plumbing and electricity so that they can enter the job market as soon as possible and have a better future.","problem":"70% of refugees that come to Norway have difficulties to find a job.","owner":{"firstName":"SE","lastName":"1","email":"milagi+se1@atixlabs.com","address":"0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543"},"milestones":[{"description":"Create a program","goal":3000,"tasks":[{"id":"0x8b92930cc4e903a968ca5075c0d61b9061e1e56da0d190488564b50043b5b1e2","oracle":45,"description":"Electrician program","reviewCriteria":"Program","category":"Education","keyPersonnel":"Anniken Leite"},{"id":"0x98f66ac7add161179a439c831fbfc96dfaa9edd619b3445766723d0e2fed1363","oracle":45,"description":"Plumbin program","reviewCriteria":"Program","category":"Education","keyPersonnel":"Anniken Leite"},{"id":"0xe584b0b80c8d2974ae1cc20ff9b549fd7ff459959efb5cb4095d7abd135025f9","oracle":45,"description":"Carpentry program","reviewCriteria":"Program","category":"Education","keyPersonnel":"Anniken Leite"}]},{"description":"Find Building to provide education","goal":5000,"tasks":[{"id":"0x1c700ffd736668cfdc57fc50938d8c88afe91d85eb3d06298f37a19d5b5004f2","oracle":45,"description":"Find location with at least 3 rooms","reviewCriteria":"Location","category":"Location","keyPersonnel":"Anniken Leite"}]},{"description":"Start Opeations","goal":12000,"tasks":[{"id":"0x113b4c7072f1e7abe3e829701d7711215d33cfe8f18386f8fd042951cfd99328","oracle":45,"description":"Hire 3 administrative employees","reviewCriteria":"Employees","category":"Employment","keyPersonnel":"Anniken Leite"},{"id":"0xdb6bca2f6c36fb2bcf5d5790c48f822c07be190c73187953681ed25a26a2ee67","oracle":45,"description":"Hire 5 teachers","reviewCriteria":"Hired employees","category":"Employment","keyPersonnel":"Anniken Leite"}]}],"funders":[{"firstName":"Supporter","lastName":"1","email":"milagi+supporter1@atixlabs.com","address":"0xcA0902f12C63D9619a62131642CA5F07aF1AE93d"}]}	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
22	Breast Cancer Coalition	41	NBCC’s mission is to end breast cancer through the power of education, action and advocacy. We have been revolutionizing the breast cancer community since our inception in 1991. As an organization, we have separated ourselves from the pack through our relentless work to support breast cancer research, to set the right scientific priorities and to bring the necessary people together to achieve significant progress in ending breast cancer. We are a dynamic, diverse coalition of hundreds of organizations and tens of thousands of individuals dedicated to giving breast cancer issues a meaningful voice in Washington, D.C., and state capitals, in laboratories and health care institutions and local communities everywhere.	Breast cancer remains a big business, and many in that world have lost sight of the goal of saving lives.\nMany scientists are willing to be bold, when given the opportunity, and work collaboratively with advocates and one another.\nNBCC’s process for setting a public policy agenda is unique and necessary.\nEducated and trained advocates must lead at every level of our mission.	USA	6 months	rejected	66000	\N	2021-02-01	2021-02-03 18:35:00.233+00	300	300	\N	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	\N	/files/projects/coverPhotos/8/8a9ecfb4537cbbf1ea1afd4103ea4fe8.jpeg	/files/projects/cardPhotos/8/8a9ecfb4537cbbf1ea1afd4103ea4fe8.jpeg	\N	<p>Ensuring the Participation of Educated Patient Advocates in Science Research and All Levels of Health Care Decision Making: NBCC continues to work to ensure that educated patient advocates who represent a constituency have a meaningful seat at the table in all levels of health care decision making, which affects their lives, and we include this as one of our public policy priorities.</p><p>Breast cancer advocates who are trained, educated and represent a patient constituency must be meaningfully involved in all aspects of decision making that affect breast cancer research. This is the only way to ensure that funds are effectively spent and adequately address the causes and prevention of breast cancer, develop optimal treatments and cures for breast cancer, and focus on the best possible means to end the disease.&nbsp;Read our full position on advocate involvement.</p><p>NBCC works with a wide range of stakeholders, including corporations, industry, government, nongovernment organizations, researchers, scientists, breast cancer patients, caregivers and the public, to help raise awareness about and to end breast cancer.&nbsp;NBCC employs a specific approach to advocacy to ensure that our efforts will have a real impact and serve the best interests of women and men affected by breast cancer<strong>.&nbsp;</strong></p>	\N	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
38	Against Poverty Everywhere	\N	The painting “Chariot” (right) shows a warrior in Roman times with a spear, armor, chariot and horse. As a symbol of how people fight each other in the world. Guns are still a billion dollar business today. For conflict and disputes instead of investing more in solving poverty and homelessness. The UN aims to defeat homelessness by 2030. The artist Manfred Dahmen is now donating his painting “Chariot” to the “1,500 social lighthouse projects” initiative run by the Art helps give e.V. The key thought: to make our world a bit more social and better through art. The starting bid for thought and artwork: 20,000 EURO.	The painting “Chariot” (right) shows a warrior in Roman times with a spear, armor, chariot and horse. As a symbol of how people fight each other in the world. Guns are still a billion dollar business today. For conflict and disputes instead of investing more in solving poverty and homelessness. The UN aims to defeat homelessness by 2030. The artist Manfred Dahmen is now donating his painting “Chariot” to the “1,500 social lighthouse projects” initiative run by the Art helps give e.V. The key thought: to make our world a bit more social and better through art. The starting bid for thought and artwork: 20,000 EURO.	10	11	toreview	45000	\N	2021-04-07	2021-04-07 02:35:58.73+00	300	300	\N	\N	/files/projects/proposal/d/d2523ab0a659019dd1a9703c4d23ba35.pdf	\N	/files/projects/coverPhotos/c/cfc465fc7f8e42be9bb2bd5aae802502.jpeg	/files/projects/cardPhotos/6/6789e9f677593f5ed59ffc3f0ecc19d4.jpeg	\N	<p>What do we need 1.3 billion euros for?</p><p><br></p><p>Richter Gerhard “Kerze”,</p><p>2012</p><p>Compared to the huge sums that are spent on war and legal disputes worldwide, 1.3 billion euros is a low social return investment: The start for 1,500 lighthouse projects that have a positive impact on the world. A start. Make amends! </p><p><strong>How do our thoughts and our vision become reality? </strong></p><p>Through donations. Once a mega donation of 1.3 billion euros or 17 times a “doubling” of the donation / endowments or</p><p>By buying the artwork “chariot” (on which we have to pay taxes):</p><p> a-typical, because the buyer / owner undertakes to look for the next “doubler” of the value himself &amp; “pass on” the painting against a donation or temporary possession got to).</p><p><strong>Our mission? </strong></p><p>We as the “Art Helps Giving” association promise and guarantee :</p><p>All funds are used in trust, sparingly and for a specific purpose </p><p>Every city that would like to contribute with its own lighthouse idea and applies in writing in English is examined fairly and, after acceptance, fraternally involved </p><p>Donors receive a donation receipt and documentation about the use of funds </p><p>Our promise: We will get this life and heart task “1,500 lighthouse projects” off the ground with 1,500 partners (homeless support organizations) as a foundation “CULTOPIA – art helps give”.</p><p><br></p>	\N	\N	6c100c7a-5f5b-496b-aac4-64d6e5efc1b2
31	Sehat Kahani	41	We are an all female health provider network that provides quality healthcare to those in need, using telemedicine, thereby ensuring affordable and Convenient Healthcare Access for All. We now have a growing network of 1500 female doctors that comprises of general physicians and specialists. 75 + female doctors out of the network have been employed till date. Via its vertical of E- clinics:Sehat Kahani has established 26 E-Health clinics in three provinces in Pakistan and directly impacted 120,000 patients till date.70% of our patients are women and children.Our nurse intermediaries and community mobilisers have conducted 15 mass preventive campaigns in our communities educating more than 1 million beneficiaries on important primary health care issues. Via its vertical of E- health services via our mobile application:we have ventured into new (middle and high income markets) providing our telemedicine services to leading corporations(to their corporate employees, workers and consumers).We have partnered with leading FMCG’s such as Unilever, Adamjee Life, GDA and are also integrating our services with the leading Pakistani Banks including Bank Alfalah and HBL, Meezan Bank etc. We are also exploring opportunities with Careem.	Globally 3.5 billion People in the world are not able to access basic primary health careIn South Asia alone, 3.5 million children die due to infectious diseases that can be cured at primary care level.In Pakistan with a population of 220 million people, the current doctor to patient ratio for 1000 patients is only 0.978; depicting a major dearth in the population of doctors available to serve patients. 75% of people in the country are not able to access a doctor in their lifetime.This disproportionately affects women and children. 37% of women in Pakistan still deliver at home and one out of five children do not make it to their fifth birthday. While on the other hand; 77% of the female doctors discontinue medical practise due to social and cultural barriers despite making 70% of the total medical workforce in the country. Sehat Kahani uses a virtual telemedicine and video consultation platform that allows female doctors not being utilised to their optimum level to resume work through a digital medium and provide health consultations, treatment and counselling to patients in need of affordable, accessible, quality health care. These female health experts can be approached via two platforms. Establishment of affordable E-Health Clinics in low income areas where frontline female intermediaries such as local nurses and health workers facilitate the online consultation and support mass health education drives within these communities. These e- clinics also give access to lab, ultrasound, medicines and tertiary care referral. E-Health Mobile Application catered to middle and high income groups who can access female health experts 24/7 using their mobile phones. This application is 1) focused on formal economy workers and consumers who often neglect their health care due to lack of time or income.2) retail consumers from the more urbanised market that require health care on the go from a qualified medical doctor.	Pakistan	1 year	finished	190000	\N	2021-02-03	2021-02-09 20:23:31.084+00	860000	860000	0x5979be8dD1d8A55d89774109867efD520d7DBaf4	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	0x047a3c0b379ca33117b1b0a15632a40a858c1fd75038a14344320f3d38f0f157	/files/projects/coverPhotos/7/703f950cee99e3caec9758e517c2c9ef.jpeg	/files/projects/cardPhotos/b/bcfa2c029a433178dff46c1cab566141.jpeg	\N	<p>N/A</p>	{"name":"Sehat Kahani","mission":"We are an all female health provider network that provides quality healthcare to those in need, using telemedicine, thereby ensuring affordable and Convenient Healthcare Access for All. We now have a growing network of 1500 female doctors that comprises of general physicians and specialists. 75 + female doctors out of the network have been employed till date. Via its vertical of E- clinics:Sehat Kahani has established 26 E-Health clinics in three provinces in Pakistan and directly impacted 120,000 patients till date.70% of our patients are women and children.Our nurse intermediaries and community mobilisers have conducted 15 mass preventive campaigns in our communities educating more than 1 million beneficiaries on important primary health care issues. Via its vertical of E- health services via our mobile application:we have ventured into new (middle and high income markets) providing our telemedicine services to leading corporations(to their corporate employees, workers and consumers).We have partnered with leading FMCG’s such as Unilever, Adamjee Life, GDA and are also integrating our services with the leading Pakistani Banks including Bank Alfalah and HBL, Meezan Bank etc. We are also exploring opportunities with Careem.","problem":"Globally 3.5 billion People in the world are not able to access basic primary health careIn South Asia alone, 3.5 million children die due to infectious diseases that can be cured at primary care level.In Pakistan with a population of 220 million people, the current doctor to patient ratio for 1000 patients is only 0.978; depicting a major dearth in the population of doctors available to serve patients. 75% of people in the country are not able to access a doctor in their lifetime.This disproportionately affects women and children. 37% of women in Pakistan still deliver at home and one out of five children do not make it to their fifth birthday. While on the other hand; 77% of the female doctors discontinue medical practise due to social and cultural barriers despite making 70% of the total medical workforce in the country. Sehat Kahani uses a virtual telemedicine and video consultation platform that allows female doctors not being utilised to their optimum level to resume work through a digital medium and provide health consultations, treatment and counselling to patients in need of affordable, accessible, quality health care. These female health experts can be approached via two platforms. Establishment of affordable E-Health Clinics in low income areas where frontline female intermediaries such as local nurses and health workers facilitate the online consultation and support mass health education drives within these communities. These e- clinics also give access to lab, ultrasound, medicines and tertiary care referral. E-Health Mobile Application catered to middle and high income groups who can access female health experts 24/7 using their mobile phones. This application is 1) focused on formal economy workers and consumers who often neglect their health care due to lack of time or income.2) retail consumers from the more urbanised market that require health care on the go from a qualified medical doctor.","owner":{"firstName":"Marcos","lastName":"Ilagi","email":"milagi+se1@atixlabs.com","address":"0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543"},"milestones":[{"description":"HR Expansion - Expected Changes/ Social Impact Targets: Create more jobs","goal":90000,"tasks":[{"id":"0x087d1ed2e6ee7ae44cff8dc83c4bafe87831a7148bbc4837cd4e56056fca8810","oracle":45,"description":"Hire full time CFO and CTO, Project Manager along with a team of 2 full time dev","reviewCriteria":"Staff Contracts - Contracts and pay roll slips of hired staff","category":"Employment","keyPersonnel":"Sandra"}]},{"description":"Clinical Expansion - Expected Changes/ Social Impact ","goal":20000,"tasks":[{"id":"0xe066a7d1ee1543c92aeb6dfd56e56adffc2ee81865bdd7022c71355285892610","oracle":45,"description":"Launch 3 clinics in low income communities across 3 provinces","reviewCriteria":"Clinical Launch Feasibility Reports","category":"deployment capital","keyPersonnel":"Sandra"}]},{"description":"Mobile App Upgradation & Expansion","goal":80000,"tasks":[{"id":"0x665572248e20251447c6cf601fa961a162edf7031eb871c8d6b5275460839548","oracle":45,"description":"Initiate maintenance and upgradation","reviewCriteria":"Scope of Work Document for Technology Upgradation and changes . Invoice, Contrac","category":"expenditure","keyPersonnel":"Nguyen Phan "},{"id":"0xa1a10830a56e6aea957d00b7a92e5b246b7efcb07d734b23acb0af79fe5144b8","oracle":45,"description":"Lock Corporate and B2B2C Partners - Expected Changes/ Social Impact Targets","reviewCriteria":"email correspondance, MOU. Invoice, Contracts, Email Correspondences","category":"expenditure","keyPersonnel":" Sales & Business Development Team"}]}],"funders":[{"firstName":"Dmitri","lastName":"Kravchuk","email":"milagi+supporter2@atixlabs.com","address":null}]}	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
32	Yellow Leaf Hammock	41	Yellow Leaf Hammocks is a home & outdoor lifestyle brand centered around relaxation, driven by positive impact. They are aiming to break the cycle of extreme poverty through sustainable job creation by supporting artisan weavers and their families were previously trapped in extreme poverty and debt slavery. We work with inspiring companies such as Yellow Hammock to ensure that they obtain the strategic capital they need as well as to track the impact that has been made in local communities. The Impact 360 jobs have been created 4000 units is the annual consistent amount of hammocks produced per quarter 300 weavers have been contracted 16,800,000 Baht has gone to the community 1500 Children have been put into school And these statistics are only expected to increase.	“There are still more than a billion people around the world living in extreme poverty on less than $1.25 a day. In Thailand alone, more than a million members of hill tribes exist on the margins of society - denied citizenship, shut out of the formal job market and vulnerable to exploitation and trafficking. At Yellow Leaf Hammocks we believe that ethical job creation is an empowering long-term solution to extreme poverty. Instead of organizing a patchwork of charitable donations to provide water, nutrition, clothing, etc., we are working directly with families to build a comprehensive, dignified, long-term strategy toward a brighter future. The causes behind systemic poverty are complicated, but long-term financial stability is within reach. To put it simply: By focusing on livelihoods, we can cut out the middle man, get money directly into the hands of smart + resourceful mothers and empower families to tackle their own problems (without being subject to anyone else's agenda). Across three weaving communities, we are working to create jobs for mothers and build a foundation for positive community transformation. Through flexible, safe “prosperity wage” weaving work, our artisans are able to lift their families from poverty and debt slavery to the middle class. Creating jobs for women is especially important to community transformation - research shows that women will spend up to 90% of their earnings on the health, nutrition and education of their families. Turning women into breadwinners improves their status in the community, builds self-esteem and enables them to pool resources to improve infrastructure.”	Thailand	1 year	executing	48000	\N	2021-02-03	2021-02-09 20:00:00.147+00	860000	860000	0xE44b9eFCb0d2fE6758e5653570Bcc00A93E75992	/files/projects/agreement/d/d5ae37c01d5b6ed9b3146cd4f42132d0.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	0x08be5e6e72f6dedcf39849e52144d347cade9a41dc892a1c5bc2511352cf40fa	/files/projects/coverPhotos/9/9e394d5767b6aeeb5622bed8546d7e97.jpeg	/files/projects/cardPhotos/7/7970ae4facc2505cbe2aa5bb992b6945.jpeg	\N	<p>N/A</p>	{"name":"Yellow Leaf Hammock","mission":"Yellow Leaf Hammocks is a home & outdoor lifestyle brand centered around relaxation, driven by positive impact. They are aiming to break the cycle of extreme poverty through sustainable job creation by supporting artisan weavers and their families were previously trapped in extreme poverty and debt slavery. We work with inspiring companies such as Yellow Hammock to ensure that they obtain the strategic capital they need as well as to track the impact that has been made in local communities. The Impact 360 jobs have been created 4000 units is the annual consistent amount of hammocks produced per quarter 300 weavers have been contracted 16,800,000 Baht has gone to the community 1500 Children have been put into school And these statistics are only expected to increase.","problem":"“There are still more than a billion people around the world living in extreme poverty on less than $1.25 a day. In Thailand alone, more than a million members of hill tribes exist on the margins of society - denied citizenship, shut out of the formal job market and vulnerable to exploitation and trafficking. At Yellow Leaf Hammocks we believe that ethical job creation is an empowering long-term solution to extreme poverty. Instead of organizing a patchwork of charitable donations to provide water, nutrition, clothing, etc., we are working directly with families to build a comprehensive, dignified, long-term strategy toward a brighter future. The causes behind systemic poverty are complicated, but long-term financial stability is within reach. To put it simply: By focusing on livelihoods, we can cut out the middle man, get money directly into the hands of smart + resourceful mothers and empower families to tackle their own problems (without being subject to anyone else's agenda). Across three weaving communities, we are working to create jobs for mothers and build a foundation for positive community transformation. Through flexible, safe “prosperity wage” weaving work, our artisans are able to lift their families from poverty and debt slavery to the middle class. Creating jobs for women is especially important to community transformation - research shows that women will spend up to 90% of their earnings on the health, nutrition and education of their families. Turning women into breadwinners improves their status in the community, builds self-esteem and enables them to pool resources to improve infrastructure.”","owner":{"firstName":"Marcos","lastName":"Ilagi","email":"milagi+se1@atixlabs.com","address":"0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543"},"milestones":[{"description":"Secure raw materials for Robb Vices hammock production","goal":10000,"tasks":[{"id":"0x3eaa8f9f0c503d2843706ad2f03b7148d695272c8b8f3212e7dc9a459795fd89","oracle":45,"description":"Pay 50% deposit to yarn company for cotton yarn - Expected Changes/ Social Impac","reviewCriteria":"Robb Vices purchase order. Bank Transfers","category":" Raw materials expenditure","keyPersonnel":"Joe and Allen"},{"id":"0xf808c3a3d4a1c3a0994ceeffea8046ec28a2b13ac7de7f91a28f60822faa94ce","oracle":45,"description":"Pay remaining amount to yarn company cotton yarn","reviewCriteria":"Robb Vices purchase order. Bank Transfers","category":"Raw materials expenditure","keyPersonnel":"Joe and Allen"}]},{"description":"Secure full time work for weavers - Expected Changes/ Social Impact T","goal":38000,"tasks":[{"id":"0xd40d6939bfbf7d98747f4be392ce36c4fdc99547bcc2b80ac268f073ca5b717f","oracle":45,"description":"Pay deposit to get yarn into production - Expected Changes/ Social Impact T","reviewCriteria":"Virgin purchase order. Bank Transfers","category":"Production, payments to weavers begining in April/May","keyPersonnel":" Joe and Allen"},{"id":"0x420c857df791eeee0f802b53596419c5050a178dc4f9f12c6cdcbba6eb2f67c6","oracle":45,"description":" Pay remaining balance to receive yarn. Weavers","reviewCriteria":"Virgin purchase order. Bank Transfers","category":"Production, payments to weavers begining in April/M","keyPersonnel":" Joe and Allen"}]}],"funders":[{"firstName":"Marcio","lastName":"Degiovannini","email":"milagi+supporter1@atixlabs.com","address":"0xcA0902f12C63D9619a62131642CA5F07aF1AE93d"}]}	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
33	Wedu Global Fisa	41	We envision a world where half of leaders in every sector are women. Our mission is to nurture the leadership potential of women across Asia by providing mentorship, learning tools and access to innovative financing options to complete higher education. To date we have served 1,313 women from 25 countries in Asia, managed over 30,000 hours of mentorship and we are pioneering the use of Future Income Sharing Agreements (FISA) to fund education in Asia.	With CoA, we will be able to expand our FISA offering and fund the education of many more talented women across Asia. Most importantly, we want to prove together that FISA can be a financially sustainable tool to fund education and thereby attract urgently needed new funders (investors and donors) in this vital space, mobilise much larger resources and eventually create a market for financing education that will support the dire need of human capital development across developing and emerging countries in Asia. We are just starting to see the impact of our unique approach combining leadership development and investment in education. We are actively looking for partners to help us expand our operating capacity so we can make needed investments in technology, talent and expand distribution networks for both leadership development and financing for education. Only with those investments we will be able to reach thousands more women and meaningfully contribute to create a world where each woman has a fair chance at becoming the leader she deserve to be	Cambodia, Thailand, Nepal	1 year	finished	20000	\N	2021-02-03	2021-02-09 18:10:36.798+00	860000	860000	0x61f031d440D95B680609A3063416A3ba2e649fE1	/files/projects/agreement/5/56cf873c0879d33c205105cf6e29e71f.docx	/files/projects/proposal/7/76e0d1c94323d1c236fe3277b08f036a.pdf	0x03088ca3744de7d50f321720de0bd680e925ac9e40611a94f2134143c2aff729	/files/projects/coverPhotos/3/3becd6e0155c9bef780740aabd9cae30.jpeg	/files/projects/cardPhotos/d/d46b4923757330dbef548a7a8ef66adc.jpeg	\N	<p>N/A</p>	{"name":"Wedu Global Fisa","mission":"We envision a world where half of leaders in every sector are women. Our mission is to nurture the leadership potential of women across Asia by providing mentorship, learning tools and access to innovative financing options to complete higher education. To date we have served 1,313 women from 25 countries in Asia, managed over 30,000 hours of mentorship and we are pioneering the use of Future Income Sharing Agreements (FISA) to fund education in Asia.","problem":"With CoA, we will be able to expand our FISA offering and fund the education of many more talented women across Asia. Most importantly, we want to prove together that FISA can be a financially sustainable tool to fund education and thereby attract urgently needed new funders (investors and donors) in this vital space, mobilise much larger resources and eventually create a market for financing education that will support the dire need of human capital development across developing and emerging countries in Asia. We are just starting to see the impact of our unique approach combining leadership development and investment in education. We are actively looking for partners to help us expand our operating capacity so we can make needed investments in technology, talent and expand distribution networks for both leadership development and financing for education. Only with those investments we will be able to reach thousands more women and meaningfully contribute to create a world where each woman has a fair chance at becoming the leader she deserve to be","owner":{"firstName":"Marcos","lastName":"Ilagi","email":"milagi+se1@atixlabs.com","address":"0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543"},"milestones":[{"description":"Disbursed at least 20k USD of FISA to students","goal":20000,"tasks":[{"id":"0xc7b1c857e60a2e7b87c1e62c8ffe178c151790e19b52499454763c1e1c126e4a","oracle":45,"description":"isburse at least 20k USD of FISA to students - ","reviewCriteria":"FISA contracts signed. Applications for FISA in the system","category":"FISA Disbursed","keyPersonnel":"Newly hired IE team membe"}]}],"funders":[{"firstName":"Marcio","lastName":"Degiovannini","email":"milagi+supporter1@atixlabs.com","address":"0xcA0902f12C63D9619a62131642CA5F07aF1AE93d"}]}	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
34	Test123	41	Test	Test	10,30	6	toreview	20000	\N	2021-02-09	2021-02-09 18:54:16.097+00	300	300	\N	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	\N	/files/projects/coverPhotos/7/7970ae4facc2505cbe2aa5bb992b6945.jpeg	/files/projects/cardPhotos/c/c52924bb13594fd7a5fda94f4d519cdd.jpeg	\N	<p>test</p>	\N	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
26	El Salvador Opportunity	41	The mission of the prpoject is to build a school in the rural area of Alondra, in El Salvador	Kids in Alondra walk 1 an a half hours to the nearest school in El Potrero city.	El Salvador	6 months	rejected	260000	\N	2021-02-02	2021-02-04 15:25:00.069+00	86000	86000	\N	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	\N	/files/projects/coverPhotos/1/1235a7294dfe7b25cab2a8c9735f9c37.jpeg	/files/projects/cardPhotos/1/1235a7294dfe7b25cab2a8c9735f9c37.jpeg	\N	<p>N/A</p>	\N	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
24	Gitega Urban Development	41	The project mission is to urbanize the poorest area of Gitega city.	About 26% of Gitega's population live in really bad conditions, with no access to drinking water and no sewer system.	Burundi	2 years	executing	12350000	\N	2021-02-02	2021-02-09 17:55:00.192+00	86000	86000	0x08631cD7998129D1944C18386Bfd1E9B23eFE867	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	0x49c5b659e66ebe55830969cc693de683e821ee9e1040b254778a6f71dff25b9c	/files/projects/coverPhotos/1/18dd18076367bc581b45739326ac917a.jpeg	/files/projects/cardPhotos/1/18dd18076367bc581b45739326ac917a.jpeg	\N	<p>N/A</p>	{"name":"Gitega Urban Development","mission":"The project mission is to urbanize the poorest area of Gitega city.","problem":"About 26% of Gitega's population live in really bad conditions, with no access to drinking water and no sewer system.","owner":{"firstName":"Marcos","lastName":"Ilagi","email":"milagi+se1@atixlabs.com","address":"0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543"},"milestones":[{"description":"Build sewer system","goal":6500000,"tasks":[{"id":"0x7b94353260b9affe37c73e5f9774923a8552e314cd80754667c2a15fed9aa4fb","oracle":45,"description":"Build sewer system in neighbourhood 1","reviewCriteria":"Sewer system done","category":"Development","keyPersonnel":"Alika Abioye"},{"id":"0x5e74d2b83b9182aecb54bd67cc52f48df968d0236920ecffae3d97ac64d28fe5","oracle":45,"description":"Build sewer system in neighbourhood 2","reviewCriteria":"Sewer system done","category":"Development","keyPersonnel":"Alika Abioye"},{"id":"0xcc02b1062b5c73a75baef2b6962361fb9ba0f70160fc7ea587f339177212e898","oracle":45,"description":"Build sewer system in neighbourhood 3","reviewCriteria":"Sewer system done","category":"Development","keyPersonnel":"Alika Abioye"}]},{"description":"Provide drinking water","goal":4500000,"tasks":[{"id":"0x0690db579e87709c74779f46434de67cf55512b3a802080db78525d8c5fc1b32","oracle":45,"description":"Build water well","reviewCriteria":"Water Well built","category":"Development","keyPersonnel":"Alika Abioye"},{"id":"0x309fad3229eb5fad4c8500917c83e6b8df03cfdc9af4d324eab1a9012929d2e3","oracle":45,"description":"Build water tower","reviewCriteria":"Water tower built","category":"Development","keyPersonnel":"Alika Abioye"}]},{"description":"Build Parks","goal":1350000,"tasks":[{"id":"0x78b262a51bfe1447a668db0a8c3a591d7dad29269a5ee917b40566301cd21014","oracle":45,"description":"Build park in neighbourhood 1","reviewCriteria":"Park built","category":"Urbanization","keyPersonnel":"Alika Abioye"},{"id":"0x48f429019ae410d55416aba918ee80a65e3b22da876c6fa5917d10f247e271d5","oracle":45,"description":"Build park in neighbourhood 2","reviewCriteria":"Park built","category":"Urbanization","keyPersonnel":"Alika Abioye"},{"id":"0xe6421b05b6c5b1a67b3a3d3eb0f3ef2639ae87d6bb8a4bdd7fe401bd6a697074","oracle":45,"description":"Build park in neighbourhood 3","reviewCriteria":"Park built","category":"Urbanization","keyPersonnel":"Alika Abioye"}]}],"funders":[{"firstName":"Marcio","lastName":"Degiovannini","email":"milagi+supporter1@atixlabs.com","address":"0xcA0902f12C63D9619a62131642CA5F07aF1AE93d"}]}	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
36	Test project 1	\N	A social mission is a cause that benefits society, the economy and/or the environment in various ways. ... When a company has a social mission, it communicates to customers, employees and stakeholders the values that drive it. Customers feel like they make a difference when they purchase from the company.18 dic. 2019	A social mission is a cause that benefits society, the economy and/or the environment in various ways. ... When a company has a social mission, it communicates to customers, employees and stakeholders the values that drive it. Customers feel like they make a difference when they purchase from the company.18 dic. 2019	10	10	toreview	10000	\N	2021-04-06	2021-04-06 21:18:17.314+00	300	300	\N	\N	/files/projects/proposal/d/d2523ab0a659019dd1a9703c4d23ba35.pdf	\N	/files/projects/coverPhotos/c/cfc465fc7f8e42be9bb2bd5aae802502.jpeg	/files/projects/cardPhotos/6/6789e9f677593f5ed59ffc3f0ecc19d4.jpeg	\N	<p><strong>Developmental Evaluation of USAID/Jalin Project in Indonesia</strong></p><p>SI was tasked with conducting a 2-year Developmental Evaluation (DE) for the USAID Jalin project which is USAID/Indonesia’s Maternal and Newborn Health (MNH) program. While conducting an assessment under the DE, the SI team found evidence that regional governments – unknown to USAID and the Ministry of Health (MOH) – are replicating past USAID maternal and newborn health (MNH) activities. Leveraging the flexible design of the DE, the team rapidly pivoted to studying where and why provinces and districts had sustained these activities. Their findings contributed to the MOH’s decision to create a national mentoring program modeled on the sustained activities, and USAID modified its Jalin project to support this effort. This new program intends to employ 664 mentors to assist health workers in 101 facilities across 120 districts in 2020. This region alone expects 2.4 million live births to occur this year.</p><p>Congratulations to Chris Thompson, Ria Wardani, Bambang Heryanto, Dodi Mantra, Renny Kembaren, Mike Pressl, and Mark Jornlin.</p><p>Click here to read more about this project.</p><p>&nbsp;</p><p><strong>GIS Services for USAID/Ethiopia</strong></p><p>SI’s Ethiopia Performance Monitoring and Evaluation Service (EPMES) supports USAID/Ethiopia to integrate Geographic Information into the design, implementation and monitoring of Projects and Activities. The team designed over 750 Geographic Information Systems maps to aid the Mission in various aspects of its work such as eliminating duplication of services by partners and identifying geographic areas with the highest need for support.&nbsp;One of EPMES’s GIS maps revealed that USAID/Ethiopia’s malaria prevention and treatment Activities could be better aligned with the geographic areas of high malaria prevalence, prompting the Mission to re-design its Malaria Operational plan. The implementation adaptations based on GIS products will support USAID/Ethiopia to improve the targeting of their activities and to increase the effectiveness of their development interventions to achieve expected results.</p><p>Congratulations to Henok Metaferia, Zemenu Mintesnot, and Kibrewosen Worku.</p>	\N	\N	29a51ca1-5d8e-4449-99fe-bb7826f1bcf7
29	Plei Tang Lon Hospital	41	The mission of the project is to build a hospital in the region of Plei Tang Lon in Vietnam.	People in this are have the nearest hospital at 150 km from there, making almost impossible for emergencies to be successfully treated.	Vietnam	1 year	finished	1754000	\N	2021-02-03	2021-02-09 19:50:18.444+00	86000	86000	0xaca09e2E7B9056e5AD084d18873E12Aa9EB3666B	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	0x73226f522b5aeef6414bf8f39fd24e02ddc4b23f0e88d4e4b7927f307bec6c37	/files/projects/coverPhotos/9/970dc20945361a5da75ce303965e620a.jpeg	/files/projects/cardPhotos/9/970dc20945361a5da75ce303965e620a.jpeg	\N	<p>N/A</p>	{"name":"Plei Tang Lon Hospital","mission":"The mission of the project is to build a hospital in the region of Plei Tang Lon in Vietnam.","problem":"People in this are have the nearest hospital at 150 km from there, making almost impossible for emergencies to be successfully treated.","owner":{"firstName":"SE","lastName":"1","email":"milagi+se1@atixlabs.com","address":"0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543"},"milestones":[{"description":"Buy land","goal":203000,"tasks":[{"id":"0xa822a7edfb49fb468193f58f7b962729fe93bcda09c69737edeeb1000f7c548b","oracle":45,"description":"Search for a land to build the hospital","reviewCriteria":"Possible options","category":"Building","keyPersonnel":"Nguyen Phan "},{"id":"0xe08de61dc625413dd68221c06c9998a2c9d09dcdb95a558ff00db7276e64eb69","oracle":45,"description":"Buy land","reviewCriteria":"Property deeds","category":"Building","keyPersonnel":"Nguyen Phan "}]},{"description":"Build Hospital","goal":1500000,"tasks":[{"id":"0xdd18e3e2e81c08c15ad081edbb93e9c0f969b577ab128b71df8cd17de7731bc1","oracle":45,"description":"Build Hospital","reviewCriteria":"Hospital Built","category":"Construction","keyPersonnel":"Nguyen Phan "}]},{"description":"Hire Employees","goal":51000,"tasks":[{"id":"0xc34efa68c09a856256d7f0b8e97ecb9fbed110db3fbc394ca261eed3c79e5522","oracle":45,"description":"Hire 20 doctors","reviewCriteria":"Hired employees","category":"Employment","keyPersonnel":"Nguyen Phan "},{"id":"0xc202bd0f35586f017e22be24bf8dc7d0caf221d9b8ecda8fe17a7957419c8ac3","oracle":45,"description":"Hire 10 administrative employees","reviewCriteria":"Hired employees","category":"Employment","keyPersonnel":"Nguyen Phan "},{"id":"0xc794974095e8385d2961e81db40819dc7420c7971879f0af3c0896bfe41d0ece","oracle":45,"description":"Hire 10 nurses","reviewCriteria":"Hired employees","category":"Employment","keyPersonnel":"Nguyen Phan "}]}],"funders":[{"firstName":"Supporter","lastName":"1","email":"milagi+supporter1@atixlabs.com","address":"0xcA0902f12C63D9619a62131642CA5F07aF1AE93d"},{"firstName":"Supporter","lastName":"3","email":"milagi+supporter3@atixlabs.com","address":null}]}	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
35	Wedu Global Fisa	41	We envision a world where half of leaders in every sector are women. Our mission is to nurture the leadership potential of women across Asia by providing mentorship, learning tools and access to innovative financing options to complete higher education. To date we have served 1,313 women from 25 countries in Asia, managed over 30,000 hours of mentorship and we are pioneering the use of Future Income Sharing Agreements (FISA) to fund education in Asia.	With CoA, we will be able to expand our FISA offering and fund the education of many more talented women across Asia. Most importantly, we want to prove together that FISA can be a financially sustainable tool to fund education and thereby attract urgently needed new funders (investors and donors) in this vital space, mobilise much larger resources and eventually create a market for financing education that will support the dire need of human capital development across developing and emerging countries in Asia. We are just starting to see the impact of our unique approach combining leadership development and investment in education. We are actively looking for partners to help us expand our operating capacity so we can make needed investments in technology, talent and expand distribution networks for both leadership development and financing for education. Only with those investments we will be able to reach thousands more women and meaningfully contribute to create a world where each woman has a fair chance at becoming the leader she deserve to be	36,190,131	6	toreview	20000	\N	2021-02-25	2021-02-25 14:17:46.145+00	300	300	\N	/files/projects/agreement/6/61823f32c11eeb57ddb913d29feff673.docx	/files/projects/proposal/7/7acd96f0c2effd67591d91a5e377314c.docx	\N	/files/projects/coverPhotos/d/d46b4923757330dbef548a7a8ef66adc.jpeg	/files/projects/cardPhotos/d/d46b4923757330dbef548a7a8ef66adc.jpeg	\N	<p>This is the project proposal</p>	\N	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
37	Test project 2	\N	\N	\N	30	11	new	0	\N	2021-04-07	2021-04-07 01:48:45.22+00	300	300	\N	\N	\N	\N	\N	/files/projects/cardPhotos/a/a8249633969ce3ba3d4027157aa6a507.jpeg	\N	\N	\N	\N	29a51ca1-5d8e-4449-99fe-bb7826f1bcf7
39	Flasfasga	\N	\N	\N	74	8	new	0	\N	2021-04-27	2021-04-27 17:57:31.15+00	300	300	\N	\N	\N	\N	\N	/files/projects/cardPhotos/0/03aba1356354976b3de83457243b4699.png	\N	\N	\N	\N	1dfa53a0-6698-4dcf-b53e-0e861427b0bb
42	Test project 	\N	\N	\N	3	12	new	10000	\N	2021-09-28	2021-09-28 03:31:07.291+00	300	300	\N	\N	\N	\N	\N	/files/projects/cardPhotos/f/fa88992ee4718fe66a00e3e604ceea4a.jpeg	\N	\N	\N	\N	d6313be6-651d-4d2b-8b82-2631d3070502
43	ProyecyoPruebaATIX	\N	\N	\N	31	180	new	0	\N	2022-04-07	2022-04-07 13:45:43.385+00	300	300	\N	\N	\N	\N	\N	/files/projects/cardPhotos/5/579e048ed2f724f64eb1dc98e6cb496e.jpeg	\N	\N	\N	\N	1dfa53a0-6698-4dcf-b53e-0e861427b0bb
40	Test project	\N	Mission	problem	10	12	toreview	10000	\N	2021-09-15	2021-09-15 18:46:32.772+00	300	300	\N	\N	\N	\N	/files/projects/coverPhotos/7/7b795a52f9e0efa3dcf25653430450ca.jpeg	/files/projects/cardPhotos/7/7b795a52f9e0efa3dcf25653430450ca.jpeg	\N	<p>dfhasdfasdf</p><p>asdf</p><p>sadf</p><p>sd</p><p>afs</p><p>adf</p><p>asdf</p><p>sdaf</p><p>asdf</p><p><br></p><p>asdf</p><p>asd</p><p>f</p>	\N	\N	22ef4766-d0e2-40ee-8280-d93ed0de6d8d
41	Test Project	\N	\N	\N	239	10	new	0	\N	2021-09-27	2021-09-27 02:06:03.059+00	300	300	\N	\N	\N	\N	\N	/files/projects/cardPhotos/a/a8249633969ce3ba3d4027157aa6a507.jpeg	\N	\N	\N	\N	d6313be6-651d-4d2b-8b82-2631d3070502
\.


--
-- Data for Name: project_experience; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.project_experience (id, "projectId", "userId_old", comment, "createdAt", "updatedAt", "userId") FROM stdin;
12	33	41	Patricia lim funder, and circles of angels Co founder doing a round of mentoring of the rising stars in Jakarta.	2021-02-03 20:59:25.787+00	\N	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
13	31	\N	#PakistanDay celebrations happening now at #SehatKahani’s Head Office in Karachi.\r\nWe pledge to relive the resolution set forth by our forefathers back in 1940, and aspire to be better citizens & representatives of our beloved Country - . \r\nPakistan Zindabad,Pakistan Paindabad.	2021-04-07 01:42:24.006+00	\N	bba1cc12-910f-47e3-9b48-b37b38c356e7
14	31	\N	Sehat Kahani has collaborated with Shaheed Benazir Bhutto University-An MOU signing ceremony was held on 11th March 2021 during Women's Day Celebration at SBBUW to empower more than 5000 female students of the university to get access to Mental Health Counselling. #SehatKahani	2021-04-07 01:43:33.187+00	\N	bba1cc12-910f-47e3-9b48-b37b38c356e7
15	31	\N	Mr. Syed Usman Qaiser, the man who has over 20 years experience in Pakistani Advertising Industry and a passion for Cricket :)\r\n\r\nIt was truly motivating to hear you speak today at our Million $ Affair. Thank you for sharing your words  of wisdom.\r\n	2021-04-07 01:44:22.277+00	\N	bba1cc12-910f-47e3-9b48-b37b38c356e7
16	31	\N	Jubilee Life Insurance, #Pakistan’s leading life insurance company, has collaborated with @SehatKahani\r\n, a leading telemedicine platform, to provide health care services free of charge to all Jubilee Life customers and employees. #AKFED	2021-04-07 01:44:59.291+00	\N	bba1cc12-910f-47e3-9b48-b37b38c356e7
17	31	\N	Another feather for Sehat Kahani !\r\n\r\nWe proudly announce our collaboration with BYCO; to provide quality healthcare services through the Sehat Kahani app to the entire BYCO Family.	2021-04-07 01:45:41.097+00	\N	bba1cc12-910f-47e3-9b48-b37b38c356e7
18	31	\N	Such a proud moment for us to be able to expand our #telemedicine services through the launch of our 34th clinic in the province of Balochistan with support from @WHO\r\n @dpr_gob	2021-04-07 01:46:38.819+00	\N	bba1cc12-910f-47e3-9b48-b37b38c356e7
\.


--
-- Data for Name: project_experience_photo; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.project_experience_photo (id, path, "projectExperienceId", "createdAt") FROM stdin;
3	/files/projects/experiencePhotos/6/6bf80c27de3113e9fc93e06da8e07bd2.png	12	2021-02-03 20:59:25.886+00
4	/files/projects/experiencePhotos/f/fa88992ee4718fe66a00e3e604ceea4a.jpeg	13	2021-04-07 01:42:24.106+00
5	/files/projects/experiencePhotos/f/fa890e2f6466fad7dd98c7d0d3edbc92.jpeg	14	2021-04-07 01:43:33.297+00
6	/files/projects/experiencePhotos/7/716831b0478f1a332d771cfc7c633446.jpeg	15	2021-04-07 01:44:22.403+00
7	/files/projects/experiencePhotos/6/610149cc47e389f44fdbb8b712b5a83b.jpeg	16	2021-04-07 01:44:59.441+00
8	/files/projects/experiencePhotos/6/6ecaf579b68da3770080dcfa6c990af1.jpeg	17	2021-04-07 01:45:41.224+00
9	/files/projects/experiencePhotos/a/a8249633969ce3ba3d4027157aa6a507.jpeg	18	2021-04-07 01:46:38.917+00
\.


--
-- Data for Name: project_follower; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.project_follower (id, "projectId", "userId_old", "userId") FROM stdin;
\.


--
-- Data for Name: project_funder; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.project_funder (id, "projectId", "userId_old", "userId") FROM stdin;
9	25	42	3d07c69e-2245-4371-a3a9-6cc8577dd911
10	26	42	3d07c69e-2245-4371-a3a9-6cc8577dd911
11	24	42	3d07c69e-2245-4371-a3a9-6cc8577dd911
12	23	42	3d07c69e-2245-4371-a3a9-6cc8577dd911
13	22	42	3d07c69e-2245-4371-a3a9-6cc8577dd911
14	28	42	3d07c69e-2245-4371-a3a9-6cc8577dd911
15	30	42	3d07c69e-2245-4371-a3a9-6cc8577dd911
16	29	42	3d07c69e-2245-4371-a3a9-6cc8577dd911
17	25	47	b61fd1df-41f6-470a-a076-bd8728d215e4
18	26	47	b61fd1df-41f6-470a-a076-bd8728d215e4
20	29	47	b61fd1df-41f6-470a-a076-bd8728d215e4
21	32	42	3d07c69e-2245-4371-a3a9-6cc8577dd911
22	33	42	3d07c69e-2245-4371-a3a9-6cc8577dd911
24	31	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
\.


--
-- Data for Name: project_oracle; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.project_oracle (id, "projectId", "userId_old", "userId") FROM stdin;
5	25	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
6	26	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
7	24	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
8	23	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
9	22	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
10	28	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
11	30	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
12	29	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
13	22	47	b61fd1df-41f6-470a-a076-bd8728d215e4
14	32	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
15	33	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
16	31	45	bba1cc12-910f-47e3-9b48-b37b38c356e7
\.


--
-- Data for Name: project_status; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.project_status (status, name) FROM stdin;
0	Pending Approval
2	Published
1	Rejected
3	In Progress
\.


--
-- Data for Name: proposal; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.proposal (id, "proposalId", "daoId", applicant, proposer, description, type, "txHash", "createdAt", status) FROM stdin;
1	0	0	0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543	0x867825c2172988e35f8fd3560279a93fec9136aa	I'm proposing SE 1 user to be part of the Super DAO	0	0x1e6159634297da08bdedad9d7c809beb9b538124322e4295bb3688f65792d7c1	2021-02-02	confirmed
2	1	0	0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543	0x867825c2172988e35f8fd3560279a93fec9136aa	I'm proposing SE 1 user to be part of the Super DAO	0	0x786fa7b2cddc4c61854c318acadb4264e0ddce5f3a00a6f43f5040148c1cd835	2021-02-03	confirmed
3	\N	0	0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543	0x867825c2172988e35f8fd3560279a93fec9136aa	nuevo	0	0x0f48f5ed4773d88bb6ef05a55bcba4a73c5f4a4c5e234f8c1a25ea3f172d6016	2021-03-05	sent
4	\N	0	0x0d8b0eac87f4566Ad24D54AF7b2068fFafAc24AB	0x867825c2172988e35f8fd3560279a93fec9136aa	okopkpok	0	0x04722b473d812fa9c895485a659315540e2d0bc57416f7f70b59d83804241495	2021-03-05	sent
5	\N	0	0x9A731f1042146AaD9Cf8287184aD6ecdF588A83B	0x867825c2172988e35f8fd3560279a93fec9136aa	A	0	0x2c18620b6319eedee9561389e7a7bb5dfe6051fb44bac929cc7dbaaf9f5052df	2021-03-09	sent
6	\N	0	0x867825c2172988e35f8fd3560279a93fec9136aa	0x867825c2172988e35f8fd3560279a93fec9136aa	UAT DAO	1	0x221367aea646a10763d227086e92cf21189b13533f7b6388eee26b1d2c7bb08f	2021-03-09	sent
10	\N	0	0x867825c2172988e35f8fd3560279a93fec9136aa	0x867825c2172988e35f8fd3560279a93fec9136aa	DAO Number 2	1	0xc39843a26ff6428ed513a350b7a7f9a64e25ab6c613d0de756a08136620147de	2021-03-10	failed
7	\N	0	0x9A731f1042146AaD9Cf8287184aD6ecdF588A83B	0x867825c2172988e35f8fd3560279a93fec9136aa	Sarasa	2	0x0b0fa4367a9a45538cd7acb749374d6fb552737ba30b5818dac08932860dcf58	2021-03-10	failed
8	\N	0	0x9A731f1042146AaD9Cf8287184aD6ecdF588A83B	0x867825c2172988e35f8fd3560279a93fec9136aa	Make Eric a banker	2	0x01d9a000120729b8689b8365d527f7bde2b959d2d8e0acd113d848d88e2c7c64	2021-03-10	failed
9	\N	0	0x867825c2172988e35f8fd3560279a93fec9136aa	0x867825c2172988e35f8fd3560279a93fec9136aa	DAO Number 2	1	0x9c5487d86e661768e29e855830e7f7f964f5f48b235ffd1a93a303e943d79e15	2021-03-10	failed
\.


--
-- Data for Name: question; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.question (id, question, role, "answerLimit") FROM stdin;
1	How often do you or your firm make angel impact investments?	3	1
2	Are you currently an advocate/ volunteer or donor for a social cause? If yes, what are the top 3 impact areas you focus on? Please select up to 3 UN Sustainable Development Goals	3	3
3	Type of funding you are seeking:	2	1
4	Which are the areas of impact that you tackle based on the UN Sustainable Development Goals?	2	3
\.


--
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.task (id, "milestoneId", "createdAt", "taskHash", "oracleId_old", description, "reviewCriteria", category, "keyPersonnel", budget, "oracleId") FROM stdin;
66	80	2021-04-06	\N	\N	Task 1	Criteria 1	Category	marcio	10000	\N
68	81	2021-04-07	\N	\N	Hire two factory workers	Two salary receipts	hiring	Marcio Degiovannini	30000	\N
30	61	2021-02-02	\N	\N	ccccc	ddddd	aaaaa	bbbbb	215000	\N
70	84	2021-09-28	\N	\N	Hire new employee	Employee contract	Hiring	Owner	10000	\N
8	50	2021-02-01	\N	\N	West conferences	No. of given conferences	Training	Caroline Mc-Hale	15000	\N
10	50	2021-02-01	\N	\N	Midwest conferences	No. of given conferences	Training	Caroline Mc-Hale	10000	\N
9	50	2021-02-01	\N	\N	Southwest conferences	No. of given conferences	Training	Caroline Mc-Hale	10000	\N
11	50	2021-02-01	\N	\N	Southeast Conferences	No. of given conferences	Training	Caroline Mc-Hale	12500	\N
12	50	2021-02-01	\N	\N	Northeast conferences	No. of given conferences	Training	Caroline Mc-Hale	17500	\N
13	51	2021-02-01	\N	\N	Online conference	Held conference	Training	Richard Chapman	1000	\N
29	62	2021-02-02	\N	\N	Hire 10 teachers	Teachers hired	Employment	Carolina Ramirez	10000	\N
31	61	2021-02-02	\N	\N	Build sports field	Built sport field	Building	Carolina Ramirez	35000	\N
34	63	2021-02-02	\N	\N	Build Tennis court	Tennis court built	Building	Sabrina Jansen	1500	\N
32	63	2021-02-02	\N	\N	Build soccer field	Soccer field built	Building	Sabrina Jansen	10000	\N
36	63	2021-02-02	\N	\N	Build lockers room	Lockers room built	Building	Sabrina Jansen	3000	\N
33	63	2021-02-02	\N	\N	Build volleyball court	Bolleyball court built	Building	Sabrina Jansen	2000	\N
35	63	2021-02-02	\N	\N	Build running track	Running track built	Building	Sabrina Jansen	2500	\N
46	68	2021-02-03	\N	45	Hire 20 doctors	Hired employees	Employment	Nguyen Phan 	25000	bba1cc12-910f-47e3-9b48-b37b38c356e7
47	68	2021-02-03	\N	45	Hire 10 administrative employees	Hired employees	Employment	Nguyen Phan 	10000	bba1cc12-910f-47e3-9b48-b37b38c356e7
64	78	2021-02-09	\N	\N	test	test	test	test	20000	\N
65	79	2021-02-25	\N	\N	isburse at least 20k USD of FISA to students - 	FISA contracts signed. Applications for FISA in the system	FISA Disbursed	Newly hired IE team membe	20000	\N
67	81	2021-04-07	\N	\N	Buy raw material	raw material invoice	Setup expenditures	Marcio Degiovannini	15000	\N
69	82	2021-09-15	\N	\N	Activity 1	Criteria 1	Category 1	key personel	10000	\N
21	56	2021-02-02	\N	45	Build water well	Water Well built	Development	Alika Abioye	2000000	bba1cc12-910f-47e3-9b48-b37b38c356e7
48	68	2021-02-03	\N	45	Hire 10 nurses	Hired employees	Employment	Nguyen Phan 	16000	bba1cc12-910f-47e3-9b48-b37b38c356e7
26	58	2021-02-02	\N	45	Hire full time employees	Employees	Employment	Jessica Perez	75000	bba1cc12-910f-47e3-9b48-b37b38c356e7
27	59	2021-02-02	\N	45	Find 5 partners	Partners found	Partnerships	Jessica Perez	5000	bba1cc12-910f-47e3-9b48-b37b38c356e7
20	55	2021-02-02	\N	45	Build sewer system in neighbourhood 3	Sewer system done	Development	Alika Abioye	1500000	bba1cc12-910f-47e3-9b48-b37b38c356e7
22	56	2021-02-02	\N	45	Build water tower	Water tower built	Development	Alika Abioye	2500000	bba1cc12-910f-47e3-9b48-b37b38c356e7
37	64	2021-02-03	\N	45	Vaccinate 10000 people against measles	Vaccinated people	Health	Carla Morales	100000	bba1cc12-910f-47e3-9b48-b37b38c356e7
38	64	2021-02-03	\N	45	Vaccinate 10000 people against poliomyelitis	Vaccinated people	Health	Carla Morales	150000	bba1cc12-910f-47e3-9b48-b37b38c356e7
39	64	2021-02-03	\N	45	Vaccinate 20000 people against smallpox	Vaccinated people	Health	Carla Morales	300000	bba1cc12-910f-47e3-9b48-b37b38c356e7
40	64	2021-02-03	\N	45	Vaccinate 10000 people against tetanus	Vaccinated people	Health	Carolina Ramirez	200000	bba1cc12-910f-47e3-9b48-b37b38c356e7
41	65	2021-02-03	\N	45	Distribution of barrier methods	Amount of barrier methods distributed	Health	Carla Morales	150000	bba1cc12-910f-47e3-9b48-b37b38c356e7
42	66	2021-02-03	\N	45	Search for a land to build the hospital	Possible options	Building	Nguyen Phan 	3000	bba1cc12-910f-47e3-9b48-b37b38c356e7
43	66	2021-02-03	\N	45	Buy land	Property deeds	Building	Nguyen Phan 	200000	bba1cc12-910f-47e3-9b48-b37b38c356e7
44	67	2021-02-03	\N	45	Build Hospital	Hospital Built	Construction	Nguyen Phan 	1500000	bba1cc12-910f-47e3-9b48-b37b38c356e7
28	60	2021-02-02	\N	45	Feed 10000 children	Children fed	Operations	Jessica Perez	50000	bba1cc12-910f-47e3-9b48-b37b38c356e7
14	52	2021-02-02	\N	45	Create headquarters	Headquarters office	Location	Sophia Valdez	50000	bba1cc12-910f-47e3-9b48-b37b38c356e7
15	52	2021-02-02	\N	45	Build office in West Coast	Built office	Building	Sophia Valdez	75000	bba1cc12-910f-47e3-9b48-b37b38c356e7
16	53	2021-02-02	\N	45	Settle in South America	Have an office in South America	Operations	Tom Richards	30000	bba1cc12-910f-47e3-9b48-b37b38c356e7
17	53	2021-02-02	\N	45	Settle in Africa	Have an office in Africa	Operations	Laura Simpson	25000	bba1cc12-910f-47e3-9b48-b37b38c356e7
18	55	2021-02-02	\N	45	Build sewer system in neighbourhood 1	Sewer system done	Development	Alika Abioye	2000000	bba1cc12-910f-47e3-9b48-b37b38c356e7
19	55	2021-02-02	\N	45	Build sewer system in neighbourhood 2	Sewer system done	Development	Alika Abioye	3000000	bba1cc12-910f-47e3-9b48-b37b38c356e7
23	57	2021-02-02	\N	45	Build park in neighbourhood 1	Park built	Urbanization	Alika Abioye	600000	bba1cc12-910f-47e3-9b48-b37b38c356e7
24	57	2021-02-02	\N	45	Build park in neighbourhood 2	Park built	Urbanization	Alika Abioye	350000	bba1cc12-910f-47e3-9b48-b37b38c356e7
25	57	2021-02-02	\N	45	Build park in neighbourhood 3	Park built	Urbanization	Alika Abioye	400000	bba1cc12-910f-47e3-9b48-b37b38c356e7
49	69	2021-02-03	\N	45	Electrician program	Program	Education	Anniken Leite	1000	bba1cc12-910f-47e3-9b48-b37b38c356e7
50	69	2021-02-03	\N	45	Plumbin program	Program	Education	Anniken Leite	1000	bba1cc12-910f-47e3-9b48-b37b38c356e7
51	69	2021-02-03	\N	45	Carpentry program	Program	Education	Anniken Leite	1000	bba1cc12-910f-47e3-9b48-b37b38c356e7
52	70	2021-02-03	\N	45	Find location with at least 3 rooms	Location	Location	Anniken Leite	5000	bba1cc12-910f-47e3-9b48-b37b38c356e7
53	71	2021-02-03	\N	45	Hire 3 administrative employees	Employees	Employment	Anniken Leite	5000	bba1cc12-910f-47e3-9b48-b37b38c356e7
54	71	2021-02-03	\N	45	Hire 5 teachers	Hired employees	Employment	Anniken Leite	7000	bba1cc12-910f-47e3-9b48-b37b38c356e7
59	75	2021-02-03	\N	45	Pay 50% deposit to yarn company for cotton yarn - Expected Changes/ Social Impac	Robb Vices purchase order. Bank Transfers	 Raw materials expenditure	Joe and Allen	5000	bba1cc12-910f-47e3-9b48-b37b38c356e7
60	75	2021-02-03	\N	45	Pay remaining amount to yarn company cotton yarn	Robb Vices purchase order. Bank Transfers	Raw materials expenditure	Joe and Allen	5000	bba1cc12-910f-47e3-9b48-b37b38c356e7
61	76	2021-02-03	\N	45	Pay deposit to get yarn into production - Expected Changes/ Social Impact T	Virgin purchase order. Bank Transfers	Production, payments to weavers begining in April/May	 Joe and Allen	20000	bba1cc12-910f-47e3-9b48-b37b38c356e7
62	76	2021-02-03	\N	45	 Pay remaining balance to receive yarn. Weavers	Virgin purchase order. Bank Transfers	Production, payments to weavers begining in April/M	 Joe and Allen	18000	bba1cc12-910f-47e3-9b48-b37b38c356e7
55	72	2021-02-03	\N	45	Hire full time CFO and CTO, Project Manager along with a team of 2 full time dev	Staff Contracts - Contracts and pay roll slips of hired staff	Employment	Sandra	90000	bba1cc12-910f-47e3-9b48-b37b38c356e7
56	73	2021-02-03	\N	45	Launch 3 clinics in low income communities across 3 provinces	Clinical Launch Feasibility Reports	deployment capital	Sandra	20000	bba1cc12-910f-47e3-9b48-b37b38c356e7
57	74	2021-02-03	\N	45	Initiate maintenance and upgradation	Scope of Work Document for Technology Upgradation and changes . Invoice, Contrac	expenditure	Nguyen Phan 	50000	bba1cc12-910f-47e3-9b48-b37b38c356e7
58	74	2021-02-03	\N	45	Lock Corporate and B2B2C Partners - Expected Changes/ Social Impact Targets	email correspondance, MOU. Invoice, Contracts, Email Correspondences	expenditure	 Sales & Business Development Team	30000	bba1cc12-910f-47e3-9b48-b37b38c356e7
63	77	2021-02-03	\N	45	isburse at least 20k USD of FISA to students - 	FISA contracts signed. Applications for FISA in the system	FISA Disbursed	Newly hired IE team membe	20000	bba1cc12-910f-47e3-9b48-b37b38c356e7
\.


--
-- Data for Name: task_evidence; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.task_evidence (id, "createdAt", description, proof, approved, "taskId", "txHash", status) FROM stdin;
1	2021-01-12 14:27:26.445+00	Test	/files/projects/milestones/tasks/claims/7/72838693349c15de5b056f28c12bc8de.jpeg	t	7	0x3f9ac347a30085320277717466c8a43fd4c2c564402bf14ae114c50f49da232f	confirmed
13	2021-02-09 18:25:59.991+00	Approved	/files/projects/milestones/tasks/claims/5/5c6d560f8f0223ced8968e2da9413dc1.png	t	38	0x8022b0aa6fe97ab7ad7e3ecfdb9c5eb3ed4d8e88de4b7ea40ab09447f78c9d4e	confirmed
2	2021-02-03 20:05:33.768+00	Office rental	/files/projects/milestones/tasks/claims/8/8e6a495b399cdb056f194ff05ef22ad4.jpeg	t	14	0xa752619fc77c285583c80fbd465ec9ff032494ead8b96e2f7ff083971b3ef874	confirmed
3	2021-02-03 20:09:04.751+00	Construction contract	/files/projects/milestones/tasks/claims/5/544779ad82e9abc717521a717cab5186.jpeg	t	15	0x911dda88b13a526620c1bebca1885b7b37525f217a3726f8d3911f721e595d67	confirmed
21	2021-02-09 19:56:41.591+00	approved	/files/projects/milestones/tasks/claims/7/7970ae4facc2505cbe2aa5bb992b6945.jpeg	t	55	0x0cec4e622f3499a064c0f9ef1bb1995faca1ae4b882c32d3e48fa7868de996ae	confirmed
4	2021-02-03 20:20:04.804+00	Rental contract in SA	/files/projects/milestones/tasks/claims/2/205f9247002de7898f004c76c3ab9a01.jpeg	t	16	0x335aa90ffdd2d7314aff331b42fdf2127744674313eb7e65d3acad8ef90377c1	confirmed
14	2021-02-09 18:35:30.254+00	approved	/files/projects/milestones/tasks/claims/5/544779ad82e9abc717521a717cab5186.jpeg	t	39	0x99237f6d98e15c327ff7c795d0abbaed131c1bf2d4d4cd426026d016a08d7061	confirmed
5	2021-02-03 21:25:52.416+00	Evidence 1	/files/projects/milestones/tasks/claims/3/3faf0b60c27bed155d35abea3011ed41.png	t	42	0x537d03f02a80f4404c494c67f9a8abb817c86c64de75767d6eb408ce5a3940fa	confirmed
6	2021-02-04 01:00:58.668+00	Evidence 1	/files/projects/milestones/tasks/claims/3/3faf0b60c27bed155d35abea3011ed41.png	t	63	0x0f2c1de1d5c750713dfec4401212396062cc4573b06de16c54786ff26eebaf13	confirmed
15	2021-02-09 18:42:32.069+00	Approved	/files/projects/milestones/tasks/claims/5/544779ad82e9abc717521a717cab5186.jpeg	t	40	0xe0335e3be4a86cb08b21986530086ad97c9bc5d6a85d652aeadcd9e817305cb4	confirmed
9	2021-02-09 18:02:47.489+00	approved	/files/projects/milestones/tasks/claims/3/3a98c0bf39d872a1aaca23faa36863b7.jpeg	t	20	0x05983eea0d9ee6f70dd95ec8f2c71ab703825e65af952aa09ca441d9c602ff60	sent
7	2021-02-09 18:00:40.765+00	Approved	/files/projects/milestones/tasks/claims/2/205f9247002de7898f004c76c3ab9a01.jpeg	t	18	0x13a905c1c705e69760948078bba290db9fc926f0f46d95202c7a4b82c91fb2e3	confirmed
8	2021-02-09 18:01:57.64+00	approved	/files/projects/milestones/tasks/claims/5/544779ad82e9abc717521a717cab5186.jpeg	t	19	0x7ebf525f835d5a695d8e3d2594d5bc6d1aa7985a13a102462900491c4fa7cb4a	confirmed
16	2021-02-09 18:55:58.534+00	approved	/files/projects/milestones/tasks/claims/8/8e6a495b399cdb056f194ff05ef22ad4.jpeg	t	41	0x3a28db58782d7777f918dc376d751db6d421e70631321ca8d6907855b8e7ad1e	sent
10	2021-02-09 18:11:53.871+00	approved	/files/projects/milestones/tasks/claims/5/544779ad82e9abc717521a717cab5186.jpeg	t	17	0xa75f4fd44f1e7134c98ab494dc450aa521b8acacbdbf7539743ff1efa2cce4e9	confirmed
11	2021-02-09 18:15:21.175+00	approved	/files/projects/milestones/tasks/claims/9/9ca6bbee02dd195d21a8eea84e821cce.png	t	43	0x7cd7c023d982f25f16df1bc9fb03ea875417ccdf9158627e7719e4a30c5a7114	confirmed
12	2021-02-09 18:20:29.85+00	approved	/files/projects/milestones/tasks/claims/2/205f9247002de7898f004c76c3ab9a01.jpeg	t	37	0x993fe8320c4561dfb9182fed91b0e159614675cf366ec84f857c02d8cf257b1e	confirmed
17	2021-02-09 19:32:52.596+00	approved	/files/projects/milestones/tasks/claims/2/2bcf5e00ce16d2e42dfc4d92c5897e50.jpeg	t	44	0x1c228e78b8acbceb9dec3357200dcfdc092fd735b65ca107f49d46871bf33ec9	confirmed
22	2021-02-09 20:07:42.063+00	approved	/files/projects/milestones/tasks/claims/7/7970ae4facc2505cbe2aa5bb992b6945.jpeg	t	56	0x280f3f54a0610600180c085b9b17754491c67efdea3404691f563e15f933de47	confirmed
26	2021-04-07 02:41:54.001+00	Purchase order scan	/files/projects/milestones/tasks/claims/3/3958d63030612a3a41fc4c5c42d6e4a9.jpeg	t	60	0x504cb36edce7b8bc4129b7a053f5ba6ccc92740cd0879978c237fabd13c06b98	confirmed
18	2021-02-09 19:43:53.123+00	approved	/files/projects/milestones/tasks/claims/7/7970ae4facc2505cbe2aa5bb992b6945.jpeg	t	46	0x540d10be84f5e400c1d63840a6b873c7fd56d60860e9f30ad72abb92a487668f	confirmed
19	2021-02-09 19:46:52.036+00	approved	/files/projects/milestones/tasks/claims/8/8e6a495b399cdb056f194ff05ef22ad4.jpeg	t	47	0x3f6e2793261edc37bac41d9861ea51070437a13452618ba772a6b83a59fab90b	confirmed
20	2021-02-09 19:48:52.914+00	approved	/files/projects/milestones/tasks/claims/7/7970ae4facc2505cbe2aa5bb992b6945.jpeg	t	48	0x7f5191cc64f1efb8774c4f573544e80172c0774130c49782741907a0a5885350	confirmed
23	2021-02-09 20:16:34.337+00	approved	/files/projects/milestones/tasks/claims/9/970dc20945361a5da75ce303965e620a.jpeg	t	57	0x6821c9fa1844d1e165c1bebcd70c451c91f0e683339e6a41fe655986dd200d10	confirmed
24	2021-02-09 20:22:53.252+00	approved	/files/projects/milestones/tasks/claims/9/970dc20945361a5da75ce303965e620a.jpeg	t	58	0xc4da7b9d283b3a9481c69751fe18c6e77151796d9af0c1e6a0f2e39ea459c2e3	confirmed
25	2021-04-06 20:23:38.864+00	invoice	/files/projects/milestones/tasks/claims/3/3958d63030612a3a41fc4c5c42d6e4a9.jpeg	t	59	0x0c43e5b2e917efc00463f43cfa8a8cc4dedabe7fa83b38d54908128cdd1cbfa1	confirmed
\.


--
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.transaction (id, sender, "txHash", nonce, "createdAt") FROM stdin;
1	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0x6115249b5efd13adb9a08cda9778241ae84f7248920de8ed7745e0eb589f728a	0	2021-01-11
2	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0xfaa8af88f1200b60d1615af8e516db2eba64e55629c23ccf41cec0f266e0e102	1	2021-01-11
3	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0x0332b82715958a8947c3145dfecc7f88fa80d553c667cbf86eb2b01458b1dd80	2	2021-01-11
4	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0x6f9bd1d415c494d27c2edfdea9bd77f487025cbee78544a9eb45182e5ddc82e4	3	2021-01-11
5	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0x8700d9f2fd83c011d463dca9ff07dc5c333e94810e46e9ea134cecbf17221468	4	2021-01-12
6	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0xd10fced1dec82a0e7e18121a01af69f35a428b96737332be18ab7dce7ae8ae33	5	2021-01-12
7	0xcA0902f12C63D9619a62131642CA5F07aF1AE93d	0x3f9ac347a30085320277717466c8a43fd4c2c564402bf14ae114c50f49da232f	0	2021-01-12
8	0x867825c2172988e35f8fd3560279a93fec9136aa	0x1e6159634297da08bdedad9d7c809beb9b538124322e4295bb3688f65792d7c1	1442	2021-02-02
9	0x867825c2172988e35f8fd3560279a93fec9136aa	0x786fa7b2cddc4c61854c318acadb4264e0ddce5f3a00a6f43f5040148c1cd835	1443	2021-02-03
10	0x867825c2172988e35f8fd3560279a93fec9136aa	0x184132a19248cc307a726240c8d9450697c871ddee5b12c5eab5cf32f3276ea0	1444	2021-02-03
11	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0xebec9f7546de0b3a09402654f0f2962b853329185db11b565b952dad1f21d793	6	2021-02-03
12	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0xcdf6457e49d83a293addef2f1bafbab1f770afd066221cc18ec6d988f8acf075	7	2021-02-03
13	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0x36e34b7c57122d6c82efab876ee2b739c29df27fb19d4c7303b6f89d4c411005	8	2021-02-03
14	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0x0b76816449e04da1d3fd61a922864b9b0f29b274c1ccd731bba60de5604d696d	9	2021-02-03
15	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0xb5a2f69e4462607b01936ffd40058572d5f7b88abea27feb235cb07b7814e25b	10	2021-02-03
16	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0x890e6c2e2798053e4e7e6e8a1786657d7d68b21425b35dee794b4378fb473ee4	11	2021-02-03
17	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0xcbc4a3ed2927e9197fc6d78a2b9674341834cd7a1a6ff711ea31703bc52d94ba	12	2021-02-03
18	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0xa752619fc77c285583c80fbd465ec9ff032494ead8b96e2f7ff083971b3ef874	0	2021-02-03
19	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x911dda88b13a526620c1bebca1885b7b37525f217a3726f8d3911f721e595d67	1	2021-02-03
20	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x335aa90ffdd2d7314aff331b42fdf2127744674313eb7e65d3acad8ef90377c1	2	2021-02-03
21	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0x2792887eda6891aa7be7954a396625529843117c350abb56db9dbfd15d84c9b1	13	2021-02-03
22	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0x7eaf37a5aa18c0aed15787907770eebac3611df7e18bebd9e264a2ef47261f71	14	2021-02-03
23	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x537d03f02a80f4404c494c67f9a8abb817c86c64de75767d6eb408ce5a3940fa	3	2021-02-03
24	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x0f2c1de1d5c750713dfec4401212396062cc4573b06de16c54786ff26eebaf13	4	2021-02-04
25	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0xd35003a5a7b30714d92d1938c94a9cce5ef358a0028a4d6287422244d5d7b4ae	15	2021-02-09
26	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x13a905c1c705e69760948078bba290db9fc926f0f46d95202c7a4b82c91fb2e3	5	2021-02-09
27	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x7ebf525f835d5a695d8e3d2594d5bc6d1aa7985a13a102462900491c4fa7cb4a	6	2021-02-09
28	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x05983eea0d9ee6f70dd95ec8f2c71ab703825e65af952aa09ca441d9c602ff60	7	2021-02-09
29	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0xa75f4fd44f1e7134c98ab494dc450aa521b8acacbdbf7539743ff1efa2cce4e9	8	2021-02-09
30	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x7cd7c023d982f25f16df1bc9fb03ea875417ccdf9158627e7719e4a30c5a7114	9	2021-02-09
31	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x993fe8320c4561dfb9182fed91b0e159614675cf366ec84f857c02d8cf257b1e	10	2021-02-09
32	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x8022b0aa6fe97ab7ad7e3ecfdb9c5eb3ed4d8e88de4b7ea40ab09447f78c9d4e	11	2021-02-09
33	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x99237f6d98e15c327ff7c795d0abbaed131c1bf2d4d4cd426026d016a08d7061	12	2021-02-09
34	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0xe0335e3be4a86cb08b21986530086ad97c9bc5d6a85d652aeadcd9e817305cb4	13	2021-02-09
35	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x3a28db58782d7777f918dc376d751db6d421e70631321ca8d6907855b8e7ad1e	14	2021-02-09
36	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x1c228e78b8acbceb9dec3357200dcfdc092fd735b65ca107f49d46871bf33ec9	15	2021-02-09
37	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x540d10be84f5e400c1d63840a6b873c7fd56d60860e9f30ad72abb92a487668f	16	2021-02-09
38	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x3f6e2793261edc37bac41d9861ea51070437a13452618ba772a6b83a59fab90b	17	2021-02-09
39	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0xf0ca1f3dfe07f2ced12b29196e87a1492238850cabe8bc2c07c1190d313e408a	16	2021-02-09
40	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x7f5191cc64f1efb8774c4f573544e80172c0774130c49782741907a0a5885350	18	2021-02-09
41	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	0xc2d79dc5a4ae04dae1f6f4e6ab4da6d8e279fdda292b0e2563bc44d4e33612fa	17	2021-02-09
42	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x0cec4e622f3499a064c0f9ef1bb1995faca1ae4b882c32d3e48fa7868de996ae	19	2021-02-09
43	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x280f3f54a0610600180c085b9b17754491c67efdea3404691f563e15f933de47	20	2021-02-09
44	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x6821c9fa1844d1e165c1bebcd70c451c91f0e683339e6a41fe655986dd200d10	21	2021-02-09
45	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0xc4da7b9d283b3a9481c69751fe18c6e77151796d9af0c1e6a0f2e39ea459c2e3	22	2021-02-09
46	0x867825c2172988e35f8fd3560279a93fec9136aa	0x0f48f5ed4773d88bb6ef05a55bcba4a73c5f4a4c5e234f8c1a25ea3f172d6016	1445	2021-03-05
47	0x867825c2172988e35f8fd3560279a93fec9136aa	0x04722b473d812fa9c895485a659315540e2d0bc57416f7f70b59d83804241495	1446	2021-03-05
48	0x867825c2172988e35f8fd3560279a93fec9136aa	0x2c18620b6319eedee9561389e7a7bb5dfe6051fb44bac929cc7dbaaf9f5052df	1447	2021-03-09
49	0x867825c2172988e35f8fd3560279a93fec9136aa	0x221367aea646a10763d227086e92cf21189b13533f7b6388eee26b1d2c7bb08f	1448	2021-03-09
50	0x867825c2172988e35f8fd3560279a93fec9136aa	0xa6feeb5e6782148a22f93edfde2f8c05976cb48d847d2b68aa35ce56b857c4f9	1449	2021-03-09
51	0x867825c2172988e35f8fd3560279a93fec9136aa	0xc8e6d652779a462103d496ea7c8a88d6ed91106addc36c98c012a6bd9bb54956	1450	2021-03-09
52	0x867825c2172988e35f8fd3560279a93fec9136aa	0x0b0fa4367a9a45538cd7acb749374d6fb552737ba30b5818dac08932860dcf58	1451	2021-03-10
53	0x867825c2172988e35f8fd3560279a93fec9136aa	0x01d9a000120729b8689b8365d527f7bde2b959d2d8e0acd113d848d88e2c7c64	1452	2021-03-10
54	0x867825c2172988e35f8fd3560279a93fec9136aa	0x9c5487d86e661768e29e855830e7f7f964f5f48b235ffd1a93a303e943d79e15	1453	2021-03-10
55	0x867825c2172988e35f8fd3560279a93fec9136aa	0xc39843a26ff6428ed513a350b7a7f9a64e25ab6c613d0de756a08136620147de	1454	2021-03-10
56	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x0c43e5b2e917efc00463f43cfa8a8cc4dedabe7fa83b38d54908128cdd1cbfa1	23	2021-04-06
57	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	0x504cb36edce7b8bc4129b7a053f5ba6ccc92740cd0879978c237fabd13c06b98	24	2021-04-07
\.


--
-- Data for Name: transfer_status; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.transfer_status (status, name) FROM stdin;
3	Cancelled
0	Pending Verification
1	Reconciliaton
2	Verified
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public."user" (id_old, "firstName", email, password, address, "createdAt", role, "lastName", blocked, "phoneNumber", company, answers, "countryId", "encryptedWallet", "forcePasswordChange", mnemonic, "emailConfirmation", id) FROM stdin;
38	Bank Operator	pat@circlesofangels.com	$2b$10$lrCFQHDhHMuCYRLLO9AHPezEV8hwWkjJmn/6DJ06gnp8myDqC3J1O	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	2020-11-16	bankoperator	User	f	9999999999999999	COA	{"What type of funding are you seeking?":"Combination of blended finance","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Clean Water and Sanitation"]}	196	"{\\"address\\":\\"ed37daa629c4beb58ee6fd24eabc0e6f2aef0647\\",\\"id\\":\\"c6bae16b-c06a-4917-90d4-8d4dd4369d90\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"f079df32854c0cb1c69b865d8c7756ad\\"},\\"ciphertext\\":\\"74ce51f899a3fad8490b5712def095c4360ebe553ab519051da9d80c59763c95\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"c4880a53e7c148b799307f4c9547aae79a79b109263b7a9bf3b60a812835b395\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"8f3e4ab18f5337ddc53a89285297b96f5908b1afffed4467eb52b75093f15e1b\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2020-11-18T18-56-28.0Z--ed37daa629c4beb58ee6fd24eabc0e6f2aef0647\\",\\"mnemonicCounter\\":\\"dac0b40b2343d5f0ec6a181c7229f5d0\\",\\"mnemonicCiphertext\\":\\"c1d019ef0953f9b643416c4f6ba75c92\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	f	vendor tackle duck mystery will scheme panic average exact shiver praise right	t	bcb3c7a8-921d-435c-b140-b95ca60739ac
37	Curator	a@circlesofangels.com	$2b$10$ndFodTMYxPRv3PK5rYwwzOmdmBSm/dI3XVraLEVs3yZt42SF7OIP2	0x9855f77Ac6d53eC2E23432437C0fE08921f57fb4	2020-11-16	curator	User	f	99999999999999999	COA	{"What type of funding are you seeking?":"Not Yet","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Quality Education"]}	196	"{\\"address\\":\\"9855f77ac6d53ec2e23432437c0fe08921f57fb4\\",\\"id\\":\\"1ef45274-f77c-4731-80b7-ca0907fac713\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"13df08422a54080be714cbf20e1c5c7a\\"},\\"ciphertext\\":\\"854a5bd2ce291e44f134f06af0512e04d5c8f72f0f44064b643988592312248b\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"0b25abe7efe2f84d2f1672db83377812cb8e4157467c114cd0787ce9b26568ee\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"081e442e037c910415859af21060a377b2c95d565e86f3d21054d590e584aeef\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2020-11-18T18-57-17.0Z--9855f77ac6d53ec2e23432437c0fe08921f57fb4\\",\\"mnemonicCounter\\":\\"bcb30bc4f9cccdbeafc2c98596417f65\\",\\"mnemonicCiphertext\\":\\"b06f4bc0bf402d7930091cccb89e3515\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	f	toss tomato lumber dance jelly else license net ribbon swap uncle sample	t	31605bfe-3ce6-44d4-8cd0-1487c63960e2
39	Bank Operator	circlesofangelsinfo@gmail.com	$2b$10$fxxkiPTYUb3LsQmBrS5P.uR87L2ArrTJAlRAks1raNa94r8RqpMQ.	0xCd02F7f44259D28bE9a59bC3eAD10a5826796408	2020-11-16	bankoperator	User 2	f	999999999999999	COA	{"What type of funding are you seeking?":"Equity Financing","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Quality Education"]}	196	"{\\"address\\":\\"cd02f7f44259d28be9a59bc3ead10a5826796408\\",\\"id\\":\\"e86ce832-7da7-4689-b98a-45e8f8553941\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"0f8a50fbf584bb0782098f447ed477b2\\"},\\"ciphertext\\":\\"48a854216cab49b9f22fccc9d0458ac74d5ed374b1b6638053c7f1f755539af9\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"60737cc140eedbfd4b576b378982bd889d44fc7c857239f889e7b8f0a9230dff\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"9105011ece270bbaae8aa1d78bc57a01208d4771f26758e6ec22d8169f897091\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2020-11-18T18-58-06.0Z--cd02f7f44259d28be9a59bc3ead10a5826796408\\",\\"mnemonicCounter\\":\\"0d7cadc0733d735451600e3ef6c02447\\",\\"mnemonicCiphertext\\":\\"c2ffa8b19f03e1d384117532e7655673\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	f	abstract shell accuse air possible dragon sense hidden country minimum tiger dirt	t	e1d71e63-f5c5-4cb6-9f8d-f5d0e63e8d6c
41	Marcos	milagi+se1@atixlabs.com	$2b$10$ck.hUhZ0M6.8sqt5Kqam0eaLutsXd.f70sO4gtKcdX2G7wjQR3tk6	0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543	2021-01-11	entrepreneur	Ilagi	f	8895955955151	Google	{"What type of funding are you seeking?":"Debt Financing","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Good Health and Well-Being"]}	42	"{\\"address\\":\\"dcc23c6b7b6b592b3f3cec5c174894ba3ea18543\\",\\"id\\":\\"efc736b5-796b-49b0-8844-e59831a52cca\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"a718240e960b51132056c51b0b8bae4a\\"},\\"ciphertext\\":\\"4c1d4f1332a70728a4e14417cde0cf28db6d79deecfab201a7b3fc779f07b78d\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"8bd6075f81715d0c4afe8ef2799ddd9d16988348a07fd3b77b8df784ceeb99e4\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"74dcf3b923a0cf11b0692549d8e418b83d46455ef679c3930d9dcf2a5d84e38a\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-01-11T12-36-44.0Z--dcc23c6b7b6b592b3f3cec5c174894ba3ea18543\\",\\"mnemonicCounter\\":\\"e0677f055d7c6cbda57cc3cf802c7d7a\\",\\"mnemonicCiphertext\\":\\"c253088a3be8c3c5efdb2960df1cff7f\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	f	glow define unhappy tank caution bundle once maple brief distance endless crunch	t	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
46	SE	milagi+se2@atixlabs.com	$2b$10$rX9UYbKQHP3KnEwvNXaikemQ4AhBwupG9cT6OofEDBThCQCB8LxBq	\N	2021-02-03	entrepreneur	2	f	4567875435	Atix	{"What type of funding are you seeking?":"Combination of blended finance","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Quality Education"]}	24	\N	f	\N	t	3f2e1823-1d64-463b-8758-5f0dd0d66e10
50	Audrey	audreytanyx@gmail.com	$2b$10$/VCQBvX96VJB0/36TycumOyCj62V31F.18nHBVoJWfuMhYSZ4vQrG	\N	2021-03-12	supporter	Test Account	f	963852147	Audrey Test Account 	{"How often do you make angel impact investments?":"Less than 1 investment in the last 12 months","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Zero Hunger","Quality Education","Good Health and Well-Being","Clean Water and Sanitation"]}	3	\N	f	\N	t	9bee3a8e-ff8e-4d6a-b7a7-6c5b8057d761
43	Supporter 3	milagi+se6@atixlabs.com	$2b$10$uFm5bK2clS6D3gRGTCOf..ZKFCzf.iJydTulyAxqjlnc0Dg1goSJO	\N	2021-01-27	entrepreneur	user1	f	5646564564	COA	{"What type of funding are you seeking?":"Equity Financing","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Zero Hunger"]}	3	\N	f	\N	f	6a69f266-49de-423f-a6f3-18efad50c800
44	DAO	milagi+dao@atixlabs.com	$2b$10$GAiiydhIkiP9McQ3SbnzDuhJyMEudoP1Oj1RQj6zF0ko/Vjf0rLWO	\N	2021-02-01	entrepreneur	User	f	99999999999	Atix	{"What type of funding are you seeking?":"Equity Financing","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Quality Education"]}	7	\N	f	\N	t	8c301e6a-bc55-49f8-985a-1dff99944b9b
47	Supporter	milagi+supporter3@atixlabs.com	$2b$10$j2YogfHnJmJXfCDdb//1wO04fe.vH5yriuynLnQwLJvUOPQ9qEzga	\N	2021-02-03	supporter	3	f	9551151351351	Atix	{"How often do you make angel impact investments?":"4 to 5 investments in the last 12 months","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Good Health and Well-Being"]}	129	\N	f	\N	t	b61fd1df-41f6-470a-a076-bd8728d215e4
42	Marcio	milagi+supporter1@atixlabs.com	$2b$10$w2yZGQasQ.HlzGn3D4oO9O36Dcv6YsWKK3DZHFH8t468xHAfsmzL6	0xcA0902f12C63D9619a62131642CA5F07aF1AE93d	2021-01-11	supporter	Degiovannini	f	9999999999999999	COA	{"How often do you make angel impact investments?":"4 to 5 investments in the last 12 months","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Quality Education"]}	119	"{\\"address\\":\\"ca0902f12c63d9619a62131642ca5f07af1ae93d\\",\\"id\\":\\"2e51c9b7-7db6-458d-b1af-19060ab990f9\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"97705eb6313fef93f08c0ac020fff4e0\\"},\\"ciphertext\\":\\"a943707d5563b310196cf3d4200013414c11ced31768235094d432b22503456a\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"79ca0f2ea9da3d8308ebfd8fee595a818ec4ddd616c55e5886ae5b3a02b995ed\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"bfc01affc883e73dfcf1435ee6d471b5a7381bccd439f51a12383bd9193cd0da\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-01-11T12-37-43.0Z--ca0902f12c63d9619a62131642ca5f07af1ae93d\\",\\"mnemonicCounter\\":\\"2b7986d70713ebd251d172dd4a4c2105\\",\\"mnemonicCiphertext\\":\\"c2f30afcbe6804cbb94a20eaad033264\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	f	maximum other tribe model pig panic inject civil hawk ability gesture evolve	t	3d07c69e-2245-4371-a3a9-6cc8577dd911
45	Dmitri	milagi+supporter2@atixlabs.com	$2b$10$JHEugIF8k1XY9h3Q5hVGz.5CxJSNfOFMdXp8CQeHljtmL36xZlkbe	\N	2021-02-03	supporter	Kravchuk	f	999999999999999999	Atix	{"How often do you make angel impact investments?":"1 to 3 investments in the last 12 months","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Affordable and Clean Energy"]}	45	\N	f	\N	t	bba1cc12-910f-47e3-9b48-b37b38c356e7
48	Eric	egrosvald+se@atixlabs.com	$2b$10$7OLne9mFQX8Uqvpa7utAxe6gaG6DkbusIIDSNvWN5dNLN4GgKx5Im	\N	2021-03-09	entrepreneur	Entrepreneur	f	46465	46546	{"What type of funding are you seeking?":"Not Yet","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Decent Work and Economic Growth"]}	61	\N	f	\N	t	1dfa53a0-6698-4dcf-b53e-0e861427b0bb
49	Audrey	audreytanyx@gmaill.com	$2b$10$InhAC.EQzc9.9Fm/8OVG/eF6h3t0PsgL7AWLYChBatgo1XMi0V4/q	\N	2021-03-12	supporter	Test 	f	\N	Audrey Test Account	{"How often do you make angel impact investments?":"Less than 1 investment in the last 12 months","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["No poverty","Zero Hunger","Good Health and Well-Being"]}	196	\N	f	\N	f	6a8c3750-5a9e-4ec2-a49a-33d424f6e965
51	Marcio	mdegiovannin+coa1@atixlabs.com	$2b$10$Xy96kkC7ZpykbhNvdnA4N.0DqVQBCeaPgBLosKQ0IE4p0.ef7fJX6	\N	2021-04-06	supporter	Degiovannini	f	1211	Atix Labs	{"How often do you make angel impact investments?":"Not yet","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["No poverty"]}	10	\N	f	\N	f	09c2aff6-8818-48c0-8b9f-1375d517098a
52	Marcio	mdegiovannini+coa01@atixlabs.com	$2b$10$toiNPP1OpSDwkFhCVzin3ukTnSYpZQgr0aAqMZcMDqGrznWKUsmNO	\N	2021-04-06	entrepreneur	Deg1	f	123123	Atixlabs	{"What type of funding are you seeking?":"Grant Funding","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Zero Hunger"]}	10	\N	f	\N	t	29a51ca1-5d8e-4449-99fe-bb7826f1bcf7
53	Marcio	mdegiovannini+coa03@atixlabs.com	$2b$10$XrLns.P4Jl7OavZRUr9IO.ixkxqtJcBtFPC78mdpn8CYzrMk98LWu	\N	2021-04-07	entrepreneur	Degiovannini	f	123123123	Atix	{"What type of funding are you seeking?":"Grant Funding","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Zero Hunger"]}	10	\N	f	\N	t	6c100c7a-5f5b-496b-aac4-64d6e5efc1b2
54	A	sarasa@gmail.com	$2b$10$5vJ6r2Z6LHkEM6.Bt2zEI.szjpTgiETftLnDKdHmaxt6ZJjtd1Bqa	\N	2021-04-27	entrepreneur	A	f	111241414	12414	{"What type of funding are you seeking?":"Grant Funding","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Clean Water and Sanitation"]}	31	\N	f	\N	f	a76eca65-2a8b-444f-b633-7a26c576b502
55	Marcio SE	mdegiovannini+se1@atixlabs.com	$2b$10$tY73Z1kL3OjFf.68c5v8peSsykVmhM3l4R1B.afWH2aSHcWtoKVDC	\N	2021-09-14	entrepreneur	SE1	f	1234234	Atix	{"What type of funding are you seeking?":"Grant Funding","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Zero Hunger"]}	10	\N	f	\N	f	05d5600e-bf0c-4a52-a7c7-5c29338a9ac8
56	Marcio	mdegiovannini@atixlabs.com	$2b$10$NtJE5oQ687bqk/e6d5gUaeLU2iagwIVR8y/UWVgy37WN1Ife.M2Ae	\N	2021-09-14	entrepreneur	DEgiovannini	f	123123	Atix	{"What type of funding are you seeking?":"Grant Funding","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Zero Hunger"]}	10	\N	f	\N	f	67c6c75f-483e-44ef-8930-a791c97a1b81
57	Marcos	milagi+se99@atixlabs.com	$2b$10$kOuFdjCzL1Nwi.rIfCWKCOCnugGeXtI7/K2mbW1dWuTcZX0U.4EzG	\N	2021-09-14	supporter	Ilagi	f	2324234	Atix	{"How often do you make angel impact investments?":"4 to 5 investments in the last 12 months","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Good Health and Well-Being"]}	84	\N	f	\N	f	ecb8cc05-2f48-4983-903e-499a20e82f12
59	Marcio	mdegiovannini+se03@atixlabs.com	$2b$10$NTYmvJkBDKrzox.u0o/FUe4BZwcRbzMzwUVQwEYJgxogeuc2eSYGO	\N	2021-09-27	entrepreneur	Degiovannini	f	234234324	AAA	{"What type of funding are you seeking?":"Grant Funding","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["Good Health and Well-Being","Gender Equality"]}	30	\N	f	\N	t	d6313be6-651d-4d2b-8b82-2631d3070502
58	Marcio	mdegiovannini+se01@atixlabs.com	$2b$10$VF6qvzjR/6uQjxCtNJ4AU.mDcaMpgbousaefmYk744i.TgLkHeQ4i	\N	2021-09-15	entrepreneur	Degiovannini	f	234234324	Atix	{"What type of funding are you seeking?":"Grant Funding","Which are the areas of impact that you tackle? Based on the UN Sustainable Development Goals":["No poverty"]}	10	\N	f	\N	t	22ef4766-d0e2-40ee-8280-d93ed0de6d8d
\.


--
-- Data for Name: user_funder; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.user_funder (id, "userId", "phoneNumber") FROM stdin;
\.


--
-- Data for Name: user_project; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.user_project (id, status, "userId", "projectId") FROM stdin;
\.


--
-- Data for Name: user_social_entrepreneur; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.user_social_entrepreneur (id, "userId", company, "phoneNumber") FROM stdin;
\.


--
-- Data for Name: user_wallet; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.user_wallet (id, "userId_old", address, "encryptedWallet", mnemonic, active, "createdAt", iv, "userId") FROM stdin;
2	41	0xdcC23C6b7b6b592b3F3cEC5c174894BA3Ea18543	"{\\"address\\":\\"dcc23c6b7b6b592b3f3cec5c174894ba3ea18543\\",\\"id\\":\\"e2b16413-9882-4085-a24d-547f3e6ebfdb\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"1fb3f9ff25e7946ffc7e7bcd31c29f42\\"},\\"ciphertext\\":\\"c440c9e135016cd88cedde5b7f90acfa0f6cc2fb8b84710393721ed8601bfbce\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"e66fe654fd9abf28f8323e21fbd297871601eaa189374421d3d74e56d80507bf\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"ea3e1222d35529418e954d979b400b1df64c43ec0636eb2f4d93d158522fa089\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-01-20T22-09-41.0Z--dcc23c6b7b6b592b3f3cec5c174894ba3ea18543\\",\\"mnemonicCounter\\":\\"8bf7f548cc68d2fb437a24e3cc42323f\\",\\"mnemonicCiphertext\\":\\"5fbeb7f105d172bcd017e309dcebb415\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	9da5b61a6f0457db583f505b078bffb436efa9c1bec0ce800c1a3d3c48dff3b09a043d0a141c7c609a33eae673182631caf80cb08d239c2f5d53261c777181a4cf6a31e7fbce6ca1589fac209305b87f6227ca9c11a4a9ba63bd71bed02c2ad8	t	2021-01-20	dd99d960ce745c29d9380ffdb1026afe	14c5929f-b1cf-483a-8e0c-a5cbcb1defc5
6	43	0x0d8b0eac87f4566Ad24D54AF7b2068fFafAc24AB	"{\\"address\\":\\"0d8b0eac87f4566ad24d54af7b2068ffafac24ab\\",\\"id\\":\\"26929139-af6c-47d7-b98e-0860a608ec8d\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"0fe843b8836534cc9cf195bb1c27b49d\\"},\\"ciphertext\\":\\"181a04461d72e9d2a853a11e7a227d2a96ad56377c70f3eea488c07e165e6c9d\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"2860b8ab5bbde20d167802152d09d6becaae19199c17db704817d56d3370a800\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"c77ea3df4488bdc9665d6664a566e80c0863a46920f5e5e14ebf4046f4aa0c31\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-01-27T21-26-51.0Z--0d8b0eac87f4566ad24d54af7b2068ffafac24ab\\",\\"mnemonicCounter\\":\\"fe140b97aa2c4402ca700b1e986d2721\\",\\"mnemonicCiphertext\\":\\"1c7d700464372af41dc45f7738a15a54\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	28fb943b7bc2b1440702c569a16fd391f7ce4b61aa8645aece42363c24b7427f10a2fe68affeb55cb92ec097118381859c6f2fda872d4c568c7b12919981f7d21b4573c320f0db253b6fe0af3b1b2b66	t	2021-01-27	ab9e5be689d3539974a9e5505923e96d	6a69f266-49de-423f-a6f3-18efad50c800
5	42	0xcA0902f12C63D9619a62131642CA5F07aF1AE93d	"{\\"address\\":\\"ca0902f12c63d9619a62131642ca5f07af1ae93d\\",\\"id\\":\\"96c5e124-ef9a-4ba0-95c8-c9423238c3ec\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"6dbaaf60024702d8c38113028febf6f3\\"},\\"ciphertext\\":\\"b08fe9c2f9c4c134515d5c41ba60fcdf760c334d9171dbdc3a79bb1460ff0041\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"1798c83b5e0ab30bbb4ca0cd12fc252d5beeade6f79cc1b807f963ba61963a06\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"e8fcda507c5e348d7fbb6f18fd7f189809eaed0013b568a22a2a16b44ce54ec4\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-01-20T22-15-48.0Z--ca0902f12c63d9619a62131642ca5f07af1ae93d\\",\\"mnemonicCounter\\":\\"488c5ce0b06bdc53e39eed091427967a\\",\\"mnemonicCiphertext\\":\\"7e07d13c1968dfa10eb2da211d677471\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	385cde1b7d80ee81fce4c13d72a00f6f25a9fb0c8339ded1d2f11779b45b21fcd7c4a13adcdddeb6acd5f6554940010e3e6341ecfa1bfdda887210cfc30605be5d38178850a4cd1ea2ab488d7e3f33b5	t	2021-01-20	dd99d960ce745c29d9380ffdb1026afe	3d07c69e-2245-4371-a3a9-6cc8577dd911
7	44	0x867825c2172988e35f8fd3560279a93fec9136aa	"{\\"address\\":\\"867825c2172988e35f8fd3560279a93fec9136aa\\",\\"id\\":\\"3198289a-b210-45aa-a116-768769c8b29a\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"c98d8506f00c3b3460eb7ea09e54f04e\\"},\\"ciphertext\\":\\"83412393b24ccde5696c2942a7338eaf5a0e7c08165f73d2fa4d55f4c28ecc3b\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"a03b3bcea9738e8a1c5b211d23be003d2694f0dd89ed144913ed3b89448fb184\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"4b554e3f209f6eb8449bc086900ffa94a31f2505e70695b89f7f25cec45b9597\\"}}"	f085204d21654d88830ff4af64b427a9016b7af19e7112794eb202002b3e6db31715fa26523d1dc06d3ef2b86bf79213f67af34817e9c7bdb811171d5d2d37a9256e7cba01cc056d3b4c95ec28b62a25	t	2021-02-01	e2474e843e6e5b811d9b5ffa51f0f698	8c301e6a-bc55-49f8-985a-1dff99944b9b
8	37	0x9855f77Ac6d53eC2E23432437C0fE08921f57fb4	"{\\"address\\":\\"9855f77ac6d53ec2e23432437c0fe08921f57fb4\\",\\"id\\":\\"1ef45274-f77c-4731-80b7-ca0907fac713\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"13df08422a54080be714cbf20e1c5c7a\\"},\\"ciphertext\\":\\"854a5bd2ce291e44f134f06af0512e04d5c8f72f0f44064b643988592312248b\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"0b25abe7efe2f84d2f1672db83377812cb8e4157467c114cd0787ce9b26568ee\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"081e442e037c910415859af21060a377b2c95d565e86f3d21054d590e584aeef\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2020-11-18T18-57-17.0Z--9855f77ac6d53ec2e23432437c0fe08921f57fb4\\",\\"mnemonicCounter\\":\\"bcb30bc4f9cccdbeafc2c98596417f65\\",\\"mnemonicCiphertext\\":\\"b06f4bc0bf402d7930091cccb89e3515\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	\N	t	2021-02-02	\N	31605bfe-3ce6-44d4-8cd0-1487c63960e2
9	38	0xED37daA629c4bEb58Ee6fD24EABC0E6f2AEf0647	"{\\"address\\":\\"ed37daa629c4beb58ee6fd24eabc0e6f2aef0647\\",\\"id\\":\\"c6bae16b-c06a-4917-90d4-8d4dd4369d90\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"f079df32854c0cb1c69b865d8c7756ad\\"},\\"ciphertext\\":\\"74ce51f899a3fad8490b5712def095c4360ebe553ab519051da9d80c59763c95\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"c4880a53e7c148b799307f4c9547aae79a79b109263b7a9bf3b60a812835b395\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"8f3e4ab18f5337ddc53a89285297b96f5908b1afffed4467eb52b75093f15e1b\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2020-11-18T18-56-28.0Z--ed37daa629c4beb58ee6fd24eabc0e6f2aef0647\\",\\"mnemonicCounter\\":\\"dac0b40b2343d5f0ec6a181c7229f5d0\\",\\"mnemonicCiphertext\\":\\"c1d019ef0953f9b643416c4f6ba75c92\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	\N	t	2021-02-02	\N	bcb3c7a8-921d-435c-b140-b95ca60739ac
10	39	0xCd02F7f44259D28bE9a59bC3eAD10a5826796408	"{\\"address\\":\\"cd02f7f44259d28be9a59bc3ead10a5826796408\\",\\"id\\":\\"e86ce832-7da7-4689-b98a-45e8f8553941\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"0f8a50fbf584bb0782098f447ed477b2\\"},\\"ciphertext\\":\\"48a854216cab49b9f22fccc9d0458ac74d5ed374b1b6638053c7f1f755539af9\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"60737cc140eedbfd4b576b378982bd889d44fc7c857239f889e7b8f0a9230dff\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"9105011ece270bbaae8aa1d78bc57a01208d4771f26758e6ec22d8169f897091\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2020-11-18T18-58-06.0Z--cd02f7f44259d28be9a59bc3ead10a5826796408\\",\\"mnemonicCounter\\":\\"0d7cadc0733d735451600e3ef6c02447\\",\\"mnemonicCiphertext\\":\\"c2ffa8b19f03e1d384117532e7655673\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	\N	t	2021-02-02	\N	e1d71e63-f5c5-4cb6-9f8d-f5d0e63e8d6c
11	45	0x9f01E75Fe9Ae026Dcb0D9b58834282acB35a7063	"{\\"address\\":\\"9f01e75fe9ae026dcb0d9b58834282acb35a7063\\",\\"id\\":\\"67f56af0-1978-4a3c-af98-033380ece380\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"845c2bcbba18e1cc8ece5cc768e64381\\"},\\"ciphertext\\":\\"e23d596ade5ab95d545b461ebf82920057817e5f88d2d820fab5238e55c5b759\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"891e58c71dc535efdb97decc3b70307e4a12c4b4727e410efca02adcd68256c4\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"4062a3c4b1fd46c10a480273056fa5cac9c004fa28fe596c0bb0e98a48277a40\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-02-03T12-52-47.0Z--9f01e75fe9ae026dcb0d9b58834282acb35a7063\\",\\"mnemonicCounter\\":\\"27fe3a849449fff991e5732b94fec5fb\\",\\"mnemonicCiphertext\\":\\"e37a23571c4b5905563cc3ca7d4daf1d\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	111ea6f005d32368dffb21e456a00332e9cc965c9f59547b05fee548b9cb706ef3563286fd6fb5c63c43ce3ba5da5742b810bde3b5faf971d1387be34c7f0cd0840685af7ded51906dc9e2d200b4c9c3bfb7ea291d3ba66d14542672626e9824	t	2021-02-03	e18f08a703603e8856df1cc13f27f4c4	bba1cc12-910f-47e3-9b48-b37b38c356e7
12	46	0x3eFEdc63Ca5D2d2Ce68ec3e16b4b89D423002216	"{\\"address\\":\\"3efedc63ca5d2d2ce68ec3e16b4b89d423002216\\",\\"id\\":\\"e1611d71-1f6a-4140-b9e7-5196f5195d28\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"e4eefdc9d3e0baa90a3227150c7faec6\\"},\\"ciphertext\\":\\"7fb462e708ac811f605a6296bc4cbb293a35ee732644509f661c66334a5e809e\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"02bd107ed5a708674124de49b6b408a5a0dcb52e1cc8ad077b349bd45102155e\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"00ce391c30af4c6d8a6b2ac51d2a49143049a5d4d61fa7987fa0f5ad7b024b4b\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-02-03T13-13-45.0Z--3efedc63ca5d2d2ce68ec3e16b4b89d423002216\\",\\"mnemonicCounter\\":\\"9dbdc9a4340543ce91b3e790ad758cff\\",\\"mnemonicCiphertext\\":\\"b318dd1694015d15c479f0bfc0738415\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	48246df777b8e854db8c8814dc2b61f07e213eee25613f7e0a71554a2bde420f86df3485c60c9e236f6de7738ebc1416ca9b619c37a180703502294f76024f4c32a7589f8d7d51e1e404191c27c81fe55b1c323e7d4e18b9ab9b4465cdb15872	t	2021-02-03	e81ebb9774c2bbd74b349e550af7a512	3f2e1823-1d64-463b-8758-5f0dd0d66e10
13	47	0xdAAB0f26172Dd6F2C6bd56E2734F08f551cc96bf	"{\\"address\\":\\"daab0f26172dd6f2c6bd56e2734f08f551cc96bf\\",\\"id\\":\\"78251210-4101-45cd-a614-5bb3d4c8a67d\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"ae522a25d871593d47fff20922bb4794\\"},\\"ciphertext\\":\\"a0e008864cb19dac0c8626d915826a44f6e44e001e48703a3eb5e1d52dc77ca6\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"126322707c17d596692b031b493c9eff8e5449406f4d984e1946837fce6eb2d7\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"03986f8df44f39862ba38b6f3d79875da86abc346f1436076896e1f99d0d61ae\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-02-03T16-06-40.0Z--daab0f26172dd6f2c6bd56e2734f08f551cc96bf\\",\\"mnemonicCounter\\":\\"20403ef753179774aa51f059e9ccbac3\\",\\"mnemonicCiphertext\\":\\"bac41d66b0e37081bfd89e5a6815c57f\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	2ae9f531045b32eb8f51cbf89e93f7c1329a0d1aede619db7d2c7e3bc7521330415ad29bf59035c6e2d805832d8306d09765d197008eb072a5eabaaa0eb29aa9953569b6c38ff76a6e9affa23592c6b1	t	2021-02-03	d18e5ab124b5dff7d90499eee401e1ba	b61fd1df-41f6-470a-a076-bd8728d215e4
14	48	0x9A731f1042146AaD9Cf8287184aD6ecdF588A83B	"{\\"address\\":\\"9a731f1042146aad9cf8287184ad6ecdf588a83b\\",\\"id\\":\\"7cb6ca9e-8a5b-4e77-bf89-9d4c52e64e22\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"6fe218e0482be53bcdd779c2eb890c20\\"},\\"ciphertext\\":\\"6a38b6ed330e38fad16f0f0facf6a559a1b688a673a0282d95eb8cbce1a83131\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"d3ea9f52d1fb07d9c180c63702e466b47f9f09d439084a01333176475de81a1e\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"27dd4d2f2680c60550f0aac74fcf53c2a8750f710a3603c26c2116a4c5c98502\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-03-09T13-15-07.0Z--9a731f1042146aad9cf8287184ad6ecdf588a83b\\",\\"mnemonicCounter\\":\\"bb5f0b2b0d0681d8535f2c622eb07a04\\",\\"mnemonicCiphertext\\":\\"a8825fc517afea6eb2992eb6e0871d0b\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	54c7c0f949f8b5805fed02dfaad38d3c1c62d3958c94fff473b222f5d927010e33851a388a5c0225c88196e1d3473f36594421cfe86f9ab8c135e73400df9f363863136c5a071441dee93e9b86ce3e26	t	2021-03-09	378aabf0f9a32824b6d194ad3a23e539	1dfa53a0-6698-4dcf-b53e-0e861427b0bb
15	49	0x4991951AC554372c237c371eEd68dD4AE777982C	"{\\"address\\":\\"4991951ac554372c237c371eed68dd4ae777982c\\",\\"id\\":\\"a7a0fa35-27f7-4eb8-8b7c-64088b9a86f3\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"a7b3b6e735c725fbaeff15f7f1cd57cc\\"},\\"ciphertext\\":\\"87360b3a5c5b12346942d3a65e15ddbb66a1b1032856789e5d1ff1d7bfdba3eb\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"1784bbb010a56a23f1b90baba278c74ad7f101c2e52410ab4563576833db78e4\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"00f6526da2722f90cb4e0ee11958a1a3529d307d720b701208990545ef7e3f71\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-03-12T06-50-56.0Z--4991951ac554372c237c371eed68dd4ae777982c\\",\\"mnemonicCounter\\":\\"9e6f7152d49b18be62fb8e122939634d\\",\\"mnemonicCiphertext\\":\\"9d27a74d43ef22a63f831ec788b0aa7f\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	d160907c575951fdc07885128e12e51cfde521629c23747834b849ca685f99d2584a042cce904b27013817a410dd793ecea5d9909f9fdc2e7a3255dbf84b0e28c0511773dcc3d4577bf4940d92ba34aa	t	2021-03-12	60cbec5ac4453ed00666e51b72d17543	6a8c3750-5a9e-4ec2-a49a-33d424f6e965
16	50	0x2fc52d844fC058b8f1A0AA51c120615ABa6B4c67	"{\\"address\\":\\"2fc52d844fc058b8f1a0aa51c120615aba6b4c67\\",\\"id\\":\\"dd73cd9d-99d0-4831-aaf2-98b7b4c3a0f4\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"7a0a59ea09cf5a9273c5b4d306d2a1dd\\"},\\"ciphertext\\":\\"37c32ac5f6190a663c966eef6173d752dcdeed625a0321ca05c7c74973d87fbf\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"fe6a7b36c977e9ad9dede15a707d98d9dc0391562e0a001cc31f8daf9bc4fe44\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"b30903dd1277b6a3ec4871082c7d7f90de1d376a9e7a67d05f954e25cc427324\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-03-12T06-55-22.0Z--2fc52d844fc058b8f1a0aa51c120615aba6b4c67\\",\\"mnemonicCounter\\":\\"eaa4805671c73ed7139d7d7eaa2d8f85\\",\\"mnemonicCiphertext\\":\\"c7fe9b9189027030718ba025a864d620\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	f85098f3e0322f888922bd58003c9ea1a0e1d36d4aed9749f7cb54eac4ae3584d279d254da57b8e158191062d3b5df5cbd57e640764dcc21a6209f0d0e54d7dd83ff331a6e9054b3ffda17e1d32382e0	t	2021-03-12	839706b2179b64696aae85f574a367f2	9bee3a8e-ff8e-4d6a-b7a7-6c5b8057d761
17	\N	0xe948E44A605be372fD6B70f6f8ff4a30eD757D15	"{\\"address\\":\\"e948e44a605be372fd6b70f6f8ff4a30ed757d15\\",\\"id\\":\\"d4f11ebd-a72f-4583-b1ff-66322b1fe280\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"03608e74a0034b182bf1f89019c72feb\\"},\\"ciphertext\\":\\"b2d11042a4db89aaac3cdb84679c49fe146542d2437ba725709c2e0ecc7d2d0e\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"bf5233526e08bed963fc892744b7086493b48a64eb8d4c3255d587cb8bf4c55c\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"f5d4346c4d267612cc7456f3e000c9e802de16dcc10ed0a5cdc1f5d0de38408d\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-04-06T12-00-20.0Z--e948e44a605be372fd6b70f6f8ff4a30ed757d15\\",\\"mnemonicCounter\\":\\"e6aad34d250122b7d6a45097b6720e03\\",\\"mnemonicCiphertext\\":\\"5d29d81cb8cb4d27e59416de5d07d38d\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	0bada4e3141bba4aaab99c42eb22c04025dd6699b9067524dbe15461159953a77785d32cd9a8a627845733befd4055167b586c973e2f049a91c6f5d398e070c87e249ad782b7b6944affea295d7eb623	t	2021-04-06	bf193d9ebfb5f726ac88473271e5d76c	09c2aff6-8818-48c0-8b9f-1375d517098a
18	\N	0x84E7EA9ea4bF9819e6B63bD437EC42912Ef24CfF	"{\\"address\\":\\"84e7ea9ea4bf9819e6b63bd437ec42912ef24cff\\",\\"id\\":\\"80417ea9-91e9-4275-bcca-cb23dace07d8\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"2a68e76d09713589cc489ae24139ee16\\"},\\"ciphertext\\":\\"433e8cebffc4e693c340c9c0a42871099971d6c4bca77151e64730fd507ca5e3\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"660fe2f58a3c98e41dbbeb86ca9af36fbeb1e6a53d7237cc6b6e355d16038860\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"da94f8b0dfa41a5de5a9ba76f4dd4cd437389a229422a7e44bed934b2881ce84\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-04-06T12-07-15.0Z--84e7ea9ea4bf9819e6b63bd437ec42912ef24cff\\",\\"mnemonicCounter\\":\\"1618fc2894890ad08ba7ea22758d6118\\",\\"mnemonicCiphertext\\":\\"78db25fc72b79f72e63a88cdcebe3c92\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	979d45f8fc9d9e696e4e1c6d4f5d43ff1d41aa0b2edc7c43afcd863a17eb7626645478ce50be254e5f57c2a82bd51f3173ea9987f8fbd13ec5507f78281707cc4fab12ed3fff1f4deb4b0f120f048135	t	2021-04-06	fadc618e6088e3702b64d0ae97650259	29a51ca1-5d8e-4449-99fe-bb7826f1bcf7
19	\N	0x2Daa67901AD15A82A88aac92BE45C581b8d6A4C2	"{\\"address\\":\\"2daa67901ad15a82a88aac92be45c581b8d6a4c2\\",\\"id\\":\\"e5a8e82c-29d0-4be0-98f2-39afa835baa3\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"d53134bd5acfd41e3e3f5348c8ad24f4\\"},\\"ciphertext\\":\\"338e3defad25dc43fd45d74fce818a1773ffdc451ecb1877e8a0ed4c03eb4223\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"97aac904799c4a735d908e494b01be013089f840b2733b70e3f6bddcb59a94a1\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"b5a7f32464a1ec3477e2349b3a2cefedc5de34743595a984bb5504284df1eddf\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-04-07T02-27-14.0Z--2daa67901ad15a82a88aac92be45c581b8d6a4c2\\",\\"mnemonicCounter\\":\\"3457c9676b8b2b36e1b40686ab956b43\\",\\"mnemonicCiphertext\\":\\"6673e3eb365c21385f3bb3cb48754655\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	939ae1766606c05d00e372bc078f16a395bfaf9e06b24e4c6b041ac0618ccdb5f15d48c22b2eadaa7b01ff6d97859bf6bf20eeb647dc672837b95d5fc827b688dfb8c67d2c9dd19561ca72aaee930fe8	t	2021-04-07	bc757fbf74f5cedb4f68e951363f74c8	6c100c7a-5f5b-496b-aac4-64d6e5efc1b2
20	\N	0x13b193Ba7FD31C4Eb3D18Dfe9c86F192F195BA0c	"{\\"address\\":\\"13b193ba7fd31c4eb3d18dfe9c86f192f195ba0c\\",\\"id\\":\\"f0fb1fb2-984e-4fc7-a815-005432983e49\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"e0378a266ac866e110838a967e640726\\"},\\"ciphertext\\":\\"89e4d21979d679f5e73d0b09979cb7d4c986766da65376c1037dfa156e82e7f1\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"4118f5e6cbf6e31fba1bc40e3b1ab052b5b49c9ae1bc8be2d2c4a006462551e6\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"eb6457954057f2eabbb8a0770f55cb12d3a71030d8f17a961c58ad674e01fc75\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-04-27T17-25-21.0Z--13b193ba7fd31c4eb3d18dfe9c86f192f195ba0c\\",\\"mnemonicCounter\\":\\"47bba352085e23730bbc3c643bef7525\\",\\"mnemonicCiphertext\\":\\"2bc8934335fe063d2ac97fed0945e81d\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	dc25eedaa2fdb0c315dd2200f712258946bc76375baaaf45a0190dfd3b7a96ac2a4d94e9c98f681c13f57e1cfb3486587fe43ee94272fd27502d27fc2d3eeb2cc1d3a8014d8d6772bbf480ce210e40c7	t	2021-04-27	1fdddd540e0392ee9fbe949bc91614ca	a76eca65-2a8b-444f-b633-7a26c576b502
21	\N	0xFF6DEFF40617B807B748d4e01E0810D32096EdC8	"{\\"address\\":\\"ff6deff40617b807b748d4e01e0810d32096edc8\\",\\"id\\":\\"bd605cce-1839-4649-9900-7c3a09b22733\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"b6515d084d5f1126dd8f16793c5b618d\\"},\\"ciphertext\\":\\"e995ea5522d962297743abcf1ebbbb9548a9a395d34c8250f2b1e6e40908ced5\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"ce7706509680b9b44bd8ba562295205e7822fa991a1ad05b6358f0abc62d4f21\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"ab6cceeeff1329c763219172adfc0c350cf16228cc6020c197c8779c3f4fdc39\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-09-14T04-05-51.0Z--ff6deff40617b807b748d4e01e0810d32096edc8\\",\\"mnemonicCounter\\":\\"e9a91c266bb821d106da70d41b941116\\",\\"mnemonicCiphertext\\":\\"0997618526c94ef75d68031dce865691\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	412fadcea4b700e8565a0ba4c3cd44c502462cef65a43393ae3b2cadf0af096739a987335031d05b9a98de4d43cfcd23930f1d0a2d6d5da28913ecc24c25ba9ec406e32fa0bffc08222304bb816ba11a3dde9e6173c3563e8ffcd0e569be5275	t	2021-09-14	4fd7d667971df7ec6b785d9c8296f001	05d5600e-bf0c-4a52-a7c7-5c29338a9ac8
22	\N	0x5dd595fC6DE577541b3d3d419b41bB1ADe748b27	"{\\"address\\":\\"5dd595fc6de577541b3d3d419b41bb1ade748b27\\",\\"id\\":\\"5228fbc3-2901-457b-bd6d-3cb4f70c358a\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"17a0c0e717f07447b4a8705db9742476\\"},\\"ciphertext\\":\\"15bf7be63df7b6b09430737319e24998b2ff88fb6699b10ca3bacd28f2dfdee7\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"5e772be868dc5dee523a89ec829bf975b4980628c5f47e679b84d4b4a5275659\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"f8beb0082c70d523155baf48adfaece281a5b2c365db88e43b10a44da5c8c3c8\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-09-14T04-12-09.0Z--5dd595fc6de577541b3d3d419b41bb1ade748b27\\",\\"mnemonicCounter\\":\\"7bd279ce7949547d1cc3bd54e1402e0b\\",\\"mnemonicCiphertext\\":\\"1a41f478a6d65d39eca2a970ece40aad\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	cbd46bd808409bd6685c7fb7f28f435f014f49a6fcdd990e3b74996e96f8cfef9216c969ce89bd915ae5d8c899ab3e90e2fec773a3523ba26d8893d16b8b64004565e063187cea3dae37de5a68d38dca	t	2021-09-14	ce5657b5ea73cce6c8186480aeb01afb	67c6c75f-483e-44ef-8930-a791c97a1b81
23	\N	0x8a613E4fa96E564f9eaDF6172E04231BA9E0e376	"{\\"address\\":\\"8a613e4fa96e564f9eadf6172e04231ba9e0e376\\",\\"id\\":\\"4e6e2ff4-79b6-41f1-b551-4d7e606f1769\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"c262f58963d0287da2cbcd9142caccae\\"},\\"ciphertext\\":\\"d199c974ebbdc8d5dd74c4e91a2443c7729efd342be52aa328fb563ac22ccd78\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"9f19accdda213a7d9eb86d9622ba683c8bdbd2abc70246f283655e3e8c9f9503\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"ff8c2bf63dee2f09cad4ca909bd1164bbc92f812fc224de1267324de1de03d9a\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-09-14T20-24-04.0Z--8a613e4fa96e564f9eadf6172e04231ba9e0e376\\",\\"mnemonicCounter\\":\\"31a5c850cc93a79f89965f2121eeff65\\",\\"mnemonicCiphertext\\":\\"4e0107863de5d570595ae0c3a5a5885f\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	6f6950091ee8384a74274c0b77daf451c62e5d424adb019ca9d0a2db0cb4390168f367827bb2ca478b36032a1618a3032d9658131547f7775dec008d7ea5131b373065dfdd9a6c5b6a8965139fbc21673ba9bc856fad85eb355f5a8007a79191	t	2021-09-14	c06ef322bd4e5df4a15fd9d665820dfc	ecb8cc05-2f48-4983-903e-499a20e82f12
24	\N	0x4Acf3f9Ba6866cad927b95f4EC2723c08017269c	"{\\"address\\":\\"4acf3f9ba6866cad927b95f4ec2723c08017269c\\",\\"id\\":\\"cc6d3bd5-f24c-42dd-bf89-da03f64a3aa6\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"53e8057ae1146378e744ba99fc83d5d8\\"},\\"ciphertext\\":\\"be0e30566aada3bffd14c529831c938bf93280d8eaf248f6db1709dd2f9d2b7c\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"170e31e4e9fd92862bdfe5e0ff9e8a4856ef3dde0c2101999ec2b8d28253f6ed\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"2d37df8ac52a14ca7c4b73bc311680ebbb11b25864a5c2909ce64e986d044d83\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-09-15T17-56-13.0Z--4acf3f9ba6866cad927b95f4ec2723c08017269c\\",\\"mnemonicCounter\\":\\"35e3146108e83d2caa9b3accb28e2215\\",\\"mnemonicCiphertext\\":\\"86d57309c0330c18f801b7380179123d\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	5d87550a94f2a05acb4ce6f887790fd6db3a48df70181766c5a9e940932ff0ef1f26944d24ba2f8f01e33fd49e16378d6aafd77cfe80b50141ddb901f4c92fbb3a38e46dede9621ff1acd6049513f0d3	t	2021-09-15	4001450e83788b01648181233ea49e27	22ef4766-d0e2-40ee-8280-d93ed0de6d8d
25	\N	0xDD72b5f1175ec56C0bE3a254b7FFB62119Ff9c36	"{\\"address\\":\\"dd72b5f1175ec56c0be3a254b7ffb62119ff9c36\\",\\"id\\":\\"dea9e48d-8ff4-448f-b374-2a22a20f2660\\",\\"version\\":3,\\"Crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"2b6299274b17bfa2c45649cfb336b096\\"},\\"ciphertext\\":\\"5ea67aac578b85bba1521c7a3f26afb7f58d9c3629f061411c8e4c7b4391ba15\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"b7f6a9d90f18e0f68d66b24425a37372439a3f82d93168787d0d150ad730b82b\\",\\"n\\":131072,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"4c38a89592cb4c0999799d65de061d8d6ab100330b7572fdb07edcf90ab21522\\"},\\"x-ethers\\":{\\"client\\":\\"ethers.js\\",\\"gethFilename\\":\\"UTC--2021-09-27T02-04-18.0Z--dd72b5f1175ec56c0be3a254b7ffb62119ff9c36\\",\\"mnemonicCounter\\":\\"45ba2012222a81964cdf1c6fe05aafd7\\",\\"mnemonicCiphertext\\":\\"deb348c9f6df7db9ca98f717ee7d734e\\",\\"path\\":\\"m/44'/60'/0'/0/0\\",\\"version\\":\\"0.1\\"}}"	b7c2b6fa7de9a6b1c0009c3c989f0f84c613929398242f1c3c34b42689bb1e0285e50b8459d32a04bd9d03e8cf3c53bb4f18a732fa7364ce598df5e464ff2d1762fcdb3dfcc090fe6c062977dee565d4	t	2021-09-27	3e1bbd1f8bc3cacd44ced31ceaa72c4b	d6313be6-651d-4d2b-8b82-2631d3070502
\.


--
-- Data for Name: vote; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.vote (id, "daoId", "proposalId", vote, voter, "txHash", "createdAt", status) FROM stdin;
1	0	1	1	0x867825c2172988e35f8fd3560279a93fec9136aa	0x184132a19248cc307a726240c8d9450697c871ddee5b12c5eab5cf32f3276ea0	2021-02-03	confirmed
2	0	4	1	0x867825c2172988e35f8fd3560279a93fec9136aa	0xa6feeb5e6782148a22f93edfde2f8c05976cb48d847d2b68aa35ce56b857c4f9	2021-03-09	sent
3	0	4	1	0x867825c2172988e35f8fd3560279a93fec9136aa	0xc8e6d652779a462103d496ea7c8a88d6ed91106addc36c98c012a6bd9bb54956	2021-03-09	failed
\.


--
-- Name: activity_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.activity_file_id_seq', 1, false);


--
-- Name: activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.activity_id_seq', 74, true);


--
-- Name: activity_photo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.activity_photo_id_seq', 2, true);


--
-- Name: answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.answer_id_seq', 47, true);


--
-- Name: answer_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.answer_question_id_seq', 43, true);


--
-- Name: blockchain_block_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.blockchain_block_id_seq', 1, true);


--
-- Name: configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.configs_id_seq', 3, true);


--
-- Name: country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.country_id_seq', 1, false);


--
-- Name: featured_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.featured_project_id_seq', 6, true);


--
-- Name: file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.file_id_seq', 1, false);


--
-- Name: fund_transfer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.fund_transfer_id_seq', 28, true);


--
-- Name: milestone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.milestone_id_seq', 84, true);


--
-- Name: oracle_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.oracle_activity_id_seq', 55, true);


--
-- Name: pass_recovery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.pass_recovery_id_seq', 8, true);


--
-- Name: photo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.photo_id_seq', 32, true);


--
-- Name: project_experience_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.project_experience_id_seq', 18, true);


--
-- Name: project_experience_photo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.project_experience_photo_id_seq', 9, true);


--
-- Name: project_follower_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.project_follower_id_seq', 1, false);


--
-- Name: project_funder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.project_funder_id_seq', 24, true);


--
-- Name: project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.project_id_seq', 43, true);


--
-- Name: project_oracle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.project_oracle_id_seq', 16, true);


--
-- Name: proposal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.proposal_id_seq', 10, true);


--
-- Name: question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.question_id_seq', 4, true);


--
-- Name: task_evidence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.task_evidence_id_seq', 26, true);


--
-- Name: task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.task_id_seq', 70, true);


--
-- Name: transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.transaction_id_seq', 57, true);


--
-- Name: user_funder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.user_funder_id_seq', 4, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.user_id_seq', 62, true);


--
-- Name: user_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.user_project_id_seq', 11, true);


--
-- Name: user_social_entrepreneur_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.user_social_entrepreneur_id_seq', 8, true);


--
-- Name: user_wallet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.user_wallet_id_seq', 28, true);


--
-- Name: vote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.vote_id_seq', 3, true);


--
-- Name: activity_file activity_file_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity_file
    ADD CONSTRAINT activity_file_pkey PRIMARY KEY (id);


--
-- Name: activity_photo activity_photo_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity_photo
    ADD CONSTRAINT activity_photo_pkey PRIMARY KEY (id);


--
-- Name: activity activity_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT activity_pkey PRIMARY KEY (id);


--
-- Name: answer answer_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_pkey PRIMARY KEY (id);


--
-- Name: answer_question answer_question_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.answer_question
    ADD CONSTRAINT answer_question_pkey PRIMARY KEY (id);


--
-- Name: blockchain_block blockchain_block_transactionHash_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.blockchain_block
    ADD CONSTRAINT "blockchain_block_transactionHash_key" UNIQUE ("transactionHash");


--
-- Name: configs configs_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.configs
    ADD CONSTRAINT configs_pkey PRIMARY KEY (id);


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
-- Name: fund_transfer fund_transfer_transferId_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.fund_transfer
    ADD CONSTRAINT "fund_transfer_transferId_key" UNIQUE ("transferId");


--
-- Name: milestone_activity_status milestone_activity_status_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.milestone_activity_status
    ADD CONSTRAINT milestone_activity_status_pkey PRIMARY KEY (status);


--
-- Name: milestone_budget_status milestone_budget_status_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.milestone_budget_status
    ADD CONSTRAINT milestone_budget_status_pkey PRIMARY KEY (id);


--
-- Name: milestone milestone_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.milestone
    ADD CONSTRAINT milestone_pkey PRIMARY KEY (id);


--
-- Name: oracle_activity oracle_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.oracle_activity
    ADD CONSTRAINT oracle_activity_pkey PRIMARY KEY (id);


--
-- Name: oracle_activity oracle_activity_userId_activityId_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.oracle_activity
    ADD CONSTRAINT "oracle_activity_userId_activityId_key" UNIQUE ("userId", "activityId");


--
-- Name: pass_recovery pass_recovery_email_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.pass_recovery
    ADD CONSTRAINT pass_recovery_email_key UNIQUE (email);


--
-- Name: pass_recovery pass_recovery_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.pass_recovery
    ADD CONSTRAINT pass_recovery_pkey PRIMARY KEY (id);


--
-- Name: photo photo_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.photo
    ADD CONSTRAINT photo_pkey PRIMARY KEY (id);


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
-- Name: project_status project_status_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_status
    ADD CONSTRAINT project_status_pkey PRIMARY KEY (status);


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
-- Name: task_evidence task_evidence_txHash_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.task_evidence
    ADD CONSTRAINT "task_evidence_txHash_key" UNIQUE ("txHash");


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
-- Name: transfer_status transfer_status_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.transfer_status
    ADD CONSTRAINT transfer_status_pkey PRIMARY KEY (status);


--
-- Name: user_wallet unique_address; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_wallet
    ADD CONSTRAINT unique_address UNIQUE (address);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user_funder user_funder_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_funder
    ADD CONSTRAINT user_funder_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_project user_project_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_project
    ADD CONSTRAINT user_project_pkey PRIMARY KEY (id);


--
-- Name: user_social_entrepreneur user_social_entrepreneur_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_social_entrepreneur
    ADD CONSTRAINT user_social_entrepreneur_pkey PRIMARY KEY (id);


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
-- Name: activity_file activity_file_activityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity_file
    ADD CONSTRAINT "activity_file_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public.activity(id) ON DELETE CASCADE;


--
-- Name: activity_file activity_file_fileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity_file
    ADD CONSTRAINT "activity_file_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES public.file(id) ON DELETE CASCADE;


--
-- Name: activity activity_milestoneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT "activity_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES public.milestone(id) ON DELETE CASCADE;


--
-- Name: activity_photo activity_photo_activityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity_photo
    ADD CONSTRAINT "activity_photo_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public.activity(id) ON DELETE CASCADE;


--
-- Name: activity_photo activity_photo_photoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.activity_photo
    ADD CONSTRAINT "activity_photo_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES public.photo(id) ON DELETE CASCADE;


--
-- Name: answer answer_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT "answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.question(id) ON DELETE CASCADE;


--
-- Name: answer_question answer_question_answerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.answer_question
    ADD CONSTRAINT "answer_question_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES public.answer(id) ON DELETE CASCADE;


--
-- Name: answer_question answer_question_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.answer_question
    ADD CONSTRAINT "answer_question_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.question(id) ON DELETE CASCADE;


--
-- Name: answer_question answer_question_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.answer_question
    ADD CONSTRAINT "answer_question_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


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
    ADD CONSTRAINT "fund_transfer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


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
-- Name: oracle_activity oracle_activity_activityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.oracle_activity
    ADD CONSTRAINT "oracle_activity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public.activity(id) ON DELETE CASCADE;


--
-- Name: photo photo_projectExperienceId_fk; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.photo
    ADD CONSTRAINT "photo_projectExperienceId_fk" FOREIGN KEY ("projectExperienceId") REFERENCES public.project_experience(id);


--
-- Name: project_experience_photo project_experience_photo_projectExperienceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience_photo
    ADD CONSTRAINT "project_experience_photo_projectExperienceId_fkey" FOREIGN KEY ("projectExperienceId") REFERENCES public.project_experience(id);


--
-- Name: project_experience project_experience_projectId_fk; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience
    ADD CONSTRAINT "project_experience_projectId_fk" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


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
-- Name: user_project user_project_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_project
    ADD CONSTRAINT "user_project_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);


--
-- PostgreSQL database dump complete
--

