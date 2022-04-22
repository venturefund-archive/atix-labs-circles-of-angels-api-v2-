CREATE TABLE public.country (
    id SERIAL NOT NULL,
    "name" varchar(42) NOT NULL,
    PRIMARY KEY (id)
);

/* TODO check which countries will be added */
INSERT INTO public.country (id, name) VALUES('1', 'Argentina');
INSERT INTO public.country (id, name) VALUES('1', 'Argelia');
INSERT INTO public.country (id, name) VALUES('1', 'Angola');
