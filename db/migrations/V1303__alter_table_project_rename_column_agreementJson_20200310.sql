ALTER TABLE project RENAME COLUMN "agreementPath" TO "agreementJson";
ALTER TABLE project ALTER COLUMN "agreementJson" TYPE text;
