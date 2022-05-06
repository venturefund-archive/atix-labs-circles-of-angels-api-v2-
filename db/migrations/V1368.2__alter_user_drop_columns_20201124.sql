-- Run when all wallets have been migrated.
ALTER TABLE public."user"
DROP COLUMN address,
DROP COLUMN "encryptedWallet", 
DROP COLUMN mnemonic;