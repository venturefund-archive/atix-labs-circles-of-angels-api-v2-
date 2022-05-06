--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE atixlabs;
ALTER ROLE atixlabs WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'md5d539d7b05fd8db6104c0aff29cf82227';


\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5 (Ubuntu 11.5-3.pgdg18.04+1)
-- Dumped by pg_dump version 11.5 (Ubuntu 11.5-3.pgdg18.04+1)

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
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5 (Ubuntu 11.5-3.pgdg18.04+1)
-- Dumped by pg_dump version 11.5 (Ubuntu 11.5-3.pgdg18.04+1)

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
-- Name: coadb; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE coadb WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'es_AR.UTF-8' LC_CTYPE = 'es_AR.UTF-8';


ALTER DATABASE coadb OWNER TO postgres;

\connect coadb

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

SET default_tablespace = '';

SET default_with_oids = false;

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
    "userId" integer NOT NULL
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
    "senderId" integer NOT NULL,
    "destinationAccount" character varying NOT NULL,
    currency character varying NOT NULL,
    "projectId" integer NOT NULL,
    state smallint NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    amount integer NOT NULL
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
    quarter text,
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
    "budgetStatus" integer NOT NULL,
    "blockchainStatus" integer DEFAULT 1 NOT NULL
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
    "ownerId" integer NOT NULL,
    mission text NOT NULL,
    "problemAddressed" text NOT NULL,
    location text NOT NULL,
    timeframe text NOT NULL,
    "coverPhoto" integer,
    "cardPhoto" integer,
    status smallint NOT NULL,
    "goalAmount" real NOT NULL,
    "faqLink" character varying,
    "pitchProposal" character varying(100),
    "createdAt" date,
    "updatedAt" date,
    "projectAgreement" character varying(100),
    "milestonesFile" character varying(100),
    "transactionHash" character varying(80),
    "creationTransactionHash" character varying(80),
    "blockchainStatus" integer DEFAULT 1 NOT NULL,
    "startBlockchainStatus" integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.project OWNER TO atixlabs;

--
-- Name: project_experience; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project_experience (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "userId" integer NOT NULL,
    comment text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone
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
-- Name: project_status; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.project_status (
    status integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.project_status OWNER TO atixlabs;

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
-- Name: role; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.role (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.role OWNER TO atixlabs;

--
-- Name: transaction; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.transaction (
    id integer NOT NULL,
    sender character varying(80),
    receiver character varying(80),
    data text NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    "transactionHash" character varying(80),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "privKey" character varying(80),
    type character varying(40),
    "projectId" integer,
    "milestoneId" integer,
    "activityId" integer
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
    id integer NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    pwd character varying NOT NULL,
    address character varying,
    "roleId" integer NOT NULL,
    "createdAt" date,
    "updatedAt" date,
    "registrationStatus" integer DEFAULT 1 NOT NULL,
    "privKey" character varying(80) DEFAULT '0x0000000000000000000000000000000000000000000000000000000000000000'::character varying NOT NULL,
    "transferBlockchainStatus" integer DEFAULT 1 NOT NULL
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

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


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
-- Name: user_registration_status; Type: TABLE; Schema: public; Owner: atixlabs
--

CREATE TABLE public.user_registration_status (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.user_registration_status OWNER TO atixlabs;

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
-- Name: question id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.question ALTER COLUMN id SET DEFAULT nextval('public.question_id_seq'::regclass);


--
-- Name: transaction id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.transaction ALTER COLUMN id SET DEFAULT nextval('public.transaction_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


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
4	1	4 to 5 investments in the last 12 months
5	1	More than 5 investments in the last 12 months
6	1	I currently only do philanthropy e.g.: donate to charitable causes online & offline
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

COPY public.answer_question (id, "questionId", "answerId", "customAnswer", "userId") FROM stdin;
1	1	3		1
2	2	8		1
\.


--
-- Data for Name: blockchain_block; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.blockchain_block (id, "blockNumber", "transactionHash", "createdAt", "updatedAt") FROM stdin;
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
1	coa_bank_account_address	\N	\N	\N
2	coa_bank_account_bank_name	\N	\N	\N
3	coa_bank_account_owner_name	\N	\N	\N
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
1	2	13 03 2019 create project status table	SQL	V2__13_03_2019_create_project_status_table.sql	-666642714	atixlabs	2019-10-23 12:19:23.178186	81	t
2	3	24 04 2019 create milestone budget status table	SQL	V3__24_04_2019_create_milestone_budget_status_table.sql	1385090560	atixlabs	2019-10-23 12:19:23.29149	91	t
3	4	27 02 2019 create transfer status table	SQL	V4__27_02_2019_create_transfer_status_table.sql	1348075062	atixlabs	2019-10-23 12:19:23.430721	63	t
4	5	11 04 2019 create milestone activity status table	SQL	V5__11_04_2019_create_milestone_activity_status_table.sql	1518344838	atixlabs	2019-10-23 12:19:23.549246	57	t
5	6	08 04 2019 create file table	SQL	V6__08_04_2019_create_file_table.sql	-1451223577	atixlabs	2019-10-23 12:19:23.640693	109	t
6	7	05 04 2019 create photo table	SQL	V7__05_04_2019_create_photo_table.sql	899839721	atixlabs	2019-10-23 12:19:23.795237	133	t
7	8	27 02 2019 create project table	SQL	V8__27_02_2019_create_project_table.sql	-1673124948	atixlabs	2019-10-23 12:19:23.97758	202	t
8	9	03 04 2019 create role table	SQL	V9__03_04_2019_create_role_table.sql	1315326266	atixlabs	2019-10-23 12:19:24.24816	58	t
9	10	27 02 2019 create user table	SQL	V10__27_02_2019_create_user_table.sql	-1345099507	atixlabs	2019-10-23 12:19:24.349695	94	t
10	11	13 03 2019 create milestone table	SQL	V11__13_03_2019_create_milestone_table.sql	-933726725	atixlabs	2019-10-23 12:19:24.484108	127	t
11	12	13 03 2019 create activity table	SQL	V12__13_03_2019_create_activity_table.sql	-1595447584	atixlabs	2019-10-23 12:19:24.647911	80	t
12	13	27 02 2019 create fund transfer table	SQL	V13__27_02_2019_create_fund_transfer_table.sql	-764271505	atixlabs	2019-10-23 12:19:24.759247	108	t
13	14	27 02 2019 create configs table	SQL	V14__27_02_2019_create_configs_table.sql	1261045174	atixlabs	2019-10-23 12:19:24.916364	125	t
14	15	19 03 2019 create user project table	SQL	V15__19_03_2019_create_user_project_table.sql	587102864	atixlabs	2019-10-23 12:19:25.083132	83	t
15	16	08 04 2019 create activity photo table	SQL	V16__08_04_2019_create_activity_photo_table.sql	-821844075	atixlabs	2019-10-23 12:19:25.214946	64	t
16	17	08 04 2019 create activity file table	SQL	V17__08_04_2019_create_activity_file_table.sql	1277351208	atixlabs	2019-10-23 12:19:25.342705	73	t
17	18	05 04 2019 create oracle activity table	SQL	V18__05_04_2019_create_oracle_activity_table.sql	-2020955035	atixlabs	2019-10-23 12:19:25.481555	86	t
18	19	03 04 2019 insert into role	SQL	V19__03_04_2019_insert_into_role.sql	-867376885	atixlabs	2019-10-23 12:19:25.611204	27	t
19	20	14 03 2019 insert into project status	SQL	V20__14_03_2019_insert_into_project_status.sql	-2048499335	atixlabs	2019-10-23 12:19:25.659361	4	t
20	21	15 04 2019 insert into transfer status	SQL	V21__15_04_2019_insert_into_transfer_status.sql	-62758043	atixlabs	2019-10-23 12:19:25.679473	9	t
21	22	24 04 2019 insert into milestone budget status	SQL	V22__24_04_2019_insert_into_milestone_budget_status.sql	-419272468	atixlabs	2019-10-23 12:19:25.707	6	t
22	23	26 04 2019 insert into milestone activity status	SQL	V23__26_04_2019_insert_into_milestone_activity_status.sql	-1939937604	atixlabs	2019-10-23 12:19:25.723557	2	t
23	24	26 04 2019 add pk project status table	SQL	V24__26_04_2019_add_pk_project_status_table.sql	1463858887	atixlabs	2019-10-23 12:19:25.743578	132	t
24	25	26 04 2019 add pk transfer status table	SQL	V25__26_04_2019_add_pk_transfer_status_table.sql	-355491554	atixlabs	2019-10-23 12:19:25.916693	92	t
25	26	26 04 2019 add pk milestone activity status table	SQL	V26__26_04_2019_add_pk_milestone_activity_status_table.sql	-1839395841	atixlabs	2019-10-23 12:19:26.034907	119	t
26	27	26 04 2019 add creationeTransactionHash column	SQL	V27__26_04_2019_add_creationeTransactionHash_column.sql	-1839306166	atixlabs	2019-10-23 12:19:26.202112	8	t
27	28	26 04 2019 alter project table set link null	SQL	V28__26_04_2019_alter_project_table_set_link_null.sql	686292908	atixlabs	2019-10-23 12:19:26.246657	16	t
28	561.1	30 04 2019 create table user registration status	SQL	V561.1__30_04_2019_create_table_user_registration_status.sql	-1385131858	atixlabs	2019-10-23 12:19:26.292527	84	t
29	561.2	30 04 2019 insert into user registration status	SQL	V561.2__30_04_2019_insert_into_user_registration_status.sql	-1884940114	atixlabs	2019-10-23 12:19:26.409482	8	t
30	561.3	30 04 2019 add column user registration status to user table	SQL	V561.3__30_04_2019_add_column_user_registration_status_to_user_table.sql	1946606964	atixlabs	2019-10-23 12:19:26.444869	11	t
31	562.1	30 04 2019 alter user table remove privKey	SQL	V562.1__30_04_2019_alter_user_table_remove_privKey.sql	-1156372308	atixlabs	2019-10-23 12:19:26.481106	4	t
32	564.1	30 04 2019 create user funder table	SQL	V564.1__30_04_2019_create_user_funder_table.sql	-790107122	atixlabs	2019-10-23 12:19:26.498393	47	t
33	564.2	30 04 2019 create user social entrepreneur table	SQL	V564.2__30_04_2019_create_user_social_entrepreneur_table.sql	493047715	atixlabs	2019-10-23 12:19:26.590963	65	t
34	579.1	2 05 2019 create question table	SQL	V579.1__2_05_2019_create_question_table.sql	-455068215	atixlabs	2019-10-23 12:19:26.67555	79	t
35	579.2	2 05 2019 create answer table	SQL	V579.2__2_05_2019_create_answer_table.sql	903978698	atixlabs	2019-10-23 12:19:26.779383	89	t
36	579.3	2 05 2019 create answer question table	SQL	V579.3__2_05_2019_create_answer_question_table.sql	1007475414	atixlabs	2019-10-23 12:19:26.922874	129	t
37	579.4	2 05 2019 insert on question table	SQL	V579.4__2_05_2019_insert_on_question_table.sql	-2074298942	atixlabs	2019-10-23 12:19:27.099876	14	t
38	579.5	2 05 2019 insert on answer table	SQL	V579.5__2_05_2019_insert_on_answer_table.sql	-1496902618	atixlabs	2019-10-23 12:19:27.135972	24	t
39	579.6	06 05 2019 insert into question table se	SQL	V579.6__06_05_2019_insert_into_question_table_se.sql	512224707	atixlabs	2019-10-23 12:19:27.174379	1	t
40	579.7	06 05 2019 insert into answer table se	SQL	V579.7__06_05_2019_insert_into_answer_table_se.sql	1616159999	atixlabs	2019-10-23 12:19:27.197999	46	t
41	592.1	07 06 2019 alter user social entrepreneur drop company not null	SQL	V592.1__07_06_2019_alter_user_social_entrepreneur_drop_company_not_null.sql	297272055	atixlabs	2019-10-23 12:19:27.253015	4	t
42	598.1	10 05 2019 create project experience table	SQL	V598.1__10_05_2019_create_project_experience_table.sql	-1614910425	atixlabs	2019-10-23 12:19:27.274872	82	t
43	598.2	14 05 2019 add experienceId column to photo table	SQL	V598.2__14_05_2019_add_experienceId_column_to_photo_table.sql	242056699	atixlabs	2019-10-23 12:19:27.39626	18	t
44	627.1	9 05 2019 create pass recovery table	SQL	V627.1__9_05_2019_create_pass_recovery_table.sql	1703805290	atixlabs	2019-10-23 12:19:27.457862	88	t
45	651	23 05 2019 insert status on milestone budget status	SQL	V651__23_05_2019_insert_status_on_milestone_budget_status.sql	-2081046804	atixlabs	2019-10-23 12:19:27.583539	13	t
46	655	24 05 2019 create blockchain status table	SQL	V655__24_05_2019_create_blockchain_status_table.sql	1299217276	atixlabs	2019-10-23 12:19:27.625918	45	t
47	655.1	24 05 2019 insert on blockchain status table	SQL	V655.1__24_05_2019_insert_on_blockchain_status_table.sql	-552562707	atixlabs	2019-10-23 12:19:27.698809	4	t
48	655.2	24 05 2019 alter project milestone activity table	SQL	V655.2__24_05_2019_alter_project_milestone_activity_table.sql	-694190660	atixlabs	2019-10-23 12:19:27.722862	7	t
49	671	29 05 2019 create blockchain block table	SQL	V671__29_05_2019_create_blockchain_block_table.sql	337358993	atixlabs	2019-10-23 12:19:27.74596	55	t
50	678	24 06 2019 alter fund transfer add unique transferId	SQL	V678__24_06_2019_alter_fund_transfer_add_unique_transferId.sql	1797650819	atixlabs	2019-10-23 12:19:27.83572	54	t
51	678.1	25 06 2019 alter activity add column validatedTransactionHash	SQL	V678.1__25_06_2019_alter_activity_add_column_validatedTransactionHash.sql	-1095129861	atixlabs	2019-10-23 12:19:27.924085	3	t
52	679	13 06 2019 insert bank account config	SQL	V679__13_06_2019_insert_bank_account_config.sql	-1650378400	atixlabs	2019-10-23 12:19:27.945395	12	t
53	702	6 06 2019 alter project table	SQL	V702__6_06_2019_alter_project_table.sql	-277973677	atixlabs	2019-10-23 12:19:27.976882	3	t
54	702.1	25 06 2019 alter user table	SQL	V702.1__25_06_2019_alter_user_table.sql	-1982132771	atixlabs	2019-10-23 12:19:27.997866	10	t
55	729	19 06 2019 create transaction table	SQL	V729__19_06_2019_create_transaction_table.sql	1992043060	atixlabs	2019-10-23 12:19:28.023568	87	t
56	742	26 06 2019 alter transaction table	SQL	V742__26_06_2019_alter_transaction_table.sql	1241837103	atixlabs	2019-10-23 12:19:28.130121	2	t
57	742.1	2 07 2019 alter transaction table	SQL	V742.1__2_07_2019_alter_transaction_table.sql	2109111940	atixlabs	2019-10-23 12:19:28.152171	7	t
58	742.2	2 07 2019 alter transaction table	SQL	V742.2__2_07_2019_alter_transaction_table.sql	577377586	atixlabs	2019-10-23 12:19:28.177486	3	t
\.


--
-- Data for Name: fund_transfer; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.fund_transfer (id, "transferId", "senderId", "destinationAccount", currency, "projectId", state, "createdAt", "updatedAt", amount) FROM stdin;
\.


--
-- Data for Name: milestone; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.milestone (id, "projectId", quarter, tasks, impact, "impactCriterion", "signsOfSuccess", "signsOfSuccessCriterion", category, "keyPersonnel", budget, status, "transactionHash", "createdAt", "updatedAt", "budgetStatus", "blockchainStatus") FROM stdin;
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
\.


--
-- Data for Name: photo; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.photo (id, path, "createdAt", "updatedAt", "projectExperienceId") FROM stdin;
\.


--
-- Data for Name: project; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.project (id, "projectName", "ownerId", mission, "problemAddressed", location, timeframe, "coverPhoto", "cardPhoto", status, "goalAmount", "faqLink", "pitchProposal", "createdAt", "updatedAt", "projectAgreement", "milestonesFile", "transactionHash", "creationTransactionHash", "blockchainStatus", "startBlockchainStatus") FROM stdin;
\.


--
-- Data for Name: project_experience; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.project_experience (id, "projectId", "userId", comment, "createdAt", "updatedAt") FROM stdin;
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
-- Data for Name: question; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.question (id, question, role, "answerLimit") FROM stdin;
1	How often do you or your firm make angel impact investments?	3	1
2	Are you currently an advocate/ volunteer or donor for a social cause? If yes, what are the top 3 impact areas you focus on? Please select up to 3 UN Sustainable Development Goals	3	3
3	Type of funding you are seeking:	2	1
4	Which are the areas of impact that you tackle based on the UN Sustainable Development Goals?	2	3
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.role (id, name) FROM stdin;
1	BO Admin
2	Social Entrepreneur
3	Impact Funder
4	Oracle
\.


--
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.transaction (id, sender, receiver, data, status, "transactionHash", "createdAt", "updatedAt", "privKey", type, "projectId", "milestoneId", "activityId") FROM stdin;
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

COPY public."user" (id, username, email, pwd, address, "roleId", "createdAt", "updatedAt", "registrationStatus", "privKey", "transferBlockchainStatus") FROM stdin;
1	User Admin	admin@atixlabs.com	$2b$10$yjNwH3K0M72zmvYzOqTf.e/0K//I/McY8QrTnOFDeg7iTHZ6l0l2K	0x0f8800393cCa643a0f7717f9D3e47797Ab5Ec190	1	2019-10-23	2019-10-23	2	0xeced554a27c7c0c88668031d6d46b91ae7a8d64a883537cff62c964ec08d07a8	2
\.


--
-- Data for Name: user_funder; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.user_funder (id, "userId", "phoneNumber") FROM stdin;
1	1	1112234
\.


--
-- Data for Name: user_project; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.user_project (id, status, "userId", "projectId") FROM stdin;
\.


--
-- Data for Name: user_registration_status; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.user_registration_status (id, name) FROM stdin;
1	Pending Approval
2	Approved
3	Rejected
\.


--
-- Data for Name: user_social_entrepreneur; Type: TABLE DATA; Schema: public; Owner: atixlabs
--

COPY public.user_social_entrepreneur (id, "userId", company, "phoneNumber") FROM stdin;
\.


--
-- Name: activity_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.activity_file_id_seq', 1, false);


--
-- Name: activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.activity_id_seq', 1, false);


--
-- Name: activity_photo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.activity_photo_id_seq', 1, false);


--
-- Name: answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.answer_id_seq', 47, true);


--
-- Name: answer_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.answer_question_id_seq', 2, true);


--
-- Name: blockchain_block_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.blockchain_block_id_seq', 1, false);


--
-- Name: configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.configs_id_seq', 3, true);


--
-- Name: file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.file_id_seq', 1, false);


--
-- Name: fund_transfer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.fund_transfer_id_seq', 1, false);


--
-- Name: milestone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.milestone_id_seq', 1, false);


--
-- Name: oracle_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.oracle_activity_id_seq', 1, false);


--
-- Name: pass_recovery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.pass_recovery_id_seq', 1, false);


--
-- Name: photo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.photo_id_seq', 1, false);


--
-- Name: project_experience_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.project_experience_id_seq', 1, false);


--
-- Name: project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.project_id_seq', 1, false);


--
-- Name: question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.question_id_seq', 4, true);


--
-- Name: transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.transaction_id_seq', 1, false);


--
-- Name: user_funder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.user_funder_id_seq', 1, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.user_id_seq', 3, true);


--
-- Name: user_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.user_project_id_seq', 1, false);


--
-- Name: user_social_entrepreneur_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atixlabs
--

SELECT pg_catalog.setval('public.user_social_entrepreneur_id_seq', 1, false);


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
-- Name: project_experience project_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience
    ADD CONSTRAINT project_experience_pkey PRIMARY KEY (id);


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
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


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
-- Name: user_registration_status user_registration_status_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_registration_status
    ADD CONSTRAINT user_registration_status_pkey PRIMARY KEY (id);


--
-- Name: user_social_entrepreneur user_social_entrepreneur_pkey; Type: CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_social_entrepreneur
    ADD CONSTRAINT user_social_entrepreneur_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: atixlabs
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


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
-- Name: project card_photo_fk; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT card_photo_fk FOREIGN KEY ("cardPhoto") REFERENCES public.photo(id);


--
-- Name: project cover_photo_fk; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT cover_photo_fk FOREIGN KEY ("coverPhoto") REFERENCES public.photo(id);


--
-- Name: user fk_user_registration_status; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT fk_user_registration_status FOREIGN KEY ("registrationStatus") REFERENCES public.user_registration_status(id);


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
-- Name: milestone milestone_milestone_budget_status_fk; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.milestone
    ADD CONSTRAINT milestone_milestone_budget_status_fk FOREIGN KEY ("budgetStatus") REFERENCES public.milestone_budget_status(id);


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
-- Name: oracle_activity oracle_activity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.oracle_activity
    ADD CONSTRAINT "oracle_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: photo photo_projectExperienceId_fk; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.photo
    ADD CONSTRAINT "photo_projectExperienceId_fk" FOREIGN KEY ("projectExperienceId") REFERENCES public.project_experience(id);


--
-- Name: project_experience project_experience_projectId_fk; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience
    ADD CONSTRAINT "project_experience_projectId_fk" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: project_experience project_experience_userId_fk; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.project_experience
    ADD CONSTRAINT "project_experience_userId_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user_funder user_funder_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_funder
    ADD CONSTRAINT "user_funder_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: user_project user_project_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_project
    ADD CONSTRAINT "user_project_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id);


--
-- Name: user_project user_project_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_project
    ADD CONSTRAINT "user_project_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: user user_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.role(id);


--
-- Name: user_social_entrepreneur user_social_entrepreneur_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atixlabs
--

ALTER TABLE ONLY public.user_social_entrepreneur
    ADD CONSTRAINT "user_social_entrepreneur_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- PostgreSQL database dump complete
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5 (Ubuntu 11.5-3.pgdg18.04+1)
-- Dumped by pg_dump version 11.5 (Ubuntu 11.5-3.pgdg18.04+1)

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
-- Name: coadb; Type: SCHEMA; Schema: -; Owner: atixlabs
--

CREATE SCHEMA coadb;


ALTER SCHEMA coadb OWNER TO atixlabs;

--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

