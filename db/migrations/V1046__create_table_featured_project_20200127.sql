-- this table is a workaround until the action to choose projects by the admin is done
-- after that, a new migration should be added to delete this table
-- do not add to schema.sql
CREATE TABLE public."featured_project" (
    id SERIAL NOT NULL, --needed because ORM
    "projectId" int4 NOT NULL,
    PRIMARY KEY (id),
	CONSTRAINT "featured_project_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES project(id),
);
