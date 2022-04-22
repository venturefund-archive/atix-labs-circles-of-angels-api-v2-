ALTER TABLE public."user" ADD COLUMN "phoneNumber" varchar(80) DEFAULT NULL;
ALTER TABLE public."user" ADD COLUMN "company" varchar(80) DEFAULT NULL;
ALTER TABLE public."user" ADD COLUMN "answers" text DEFAULT NULL;
ALTER TABLE public."user" ADD COLUMN "countryId" int4 DEFAULT NULL;
ALTER TABLE public."user" ADD CONSTRAINT "user_countryId_fkey"
   FOREIGN KEY ("countryId")
   REFERENCES public."country"(id);
