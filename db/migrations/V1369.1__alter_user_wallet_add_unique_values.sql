ALTER TABLE public.user_wallet
    ADD CONSTRAINT unique_address UNIQUE (address);

ALTER TABLE public.user_wallet
    ADD CONSTRAINT unique_encrypted_wallet UNIQUE ("encryptedWallet");

ALTER TABLE public.user_wallet
    ADD CONSTRAINT mnemonic UNIQUE (mnemonic);