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
