ALTER TYPE "role" RENAME TO "role_old";

CREATE TABLE "role" (
    id SERIAL primary KEY,
    description varchar(255) NOT NULL
);

INSERT INTO "role"(description) 
VALUES ('beneficiary'), ('investor'), ('auditor');

ALTER TABLE "user_project" 
ADD COLUMN "roleId" int NOT NULL
CONSTRAINT fk_user_project_role REFERENCES role(id)
DEFAUlt (1);

ALTER TABLE "user" ADD COLUMN "isAdmin" BOOLEAN DEFAULT false;