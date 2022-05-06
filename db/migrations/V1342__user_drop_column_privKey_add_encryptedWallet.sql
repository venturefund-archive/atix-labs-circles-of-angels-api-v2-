ALTER TABLE public."user" DROP COLUMN "privKey";
ALTER TABLE public."user" ADD COLUMN "encryptedWallet" json NOT NULL DEFAULT '{}';
