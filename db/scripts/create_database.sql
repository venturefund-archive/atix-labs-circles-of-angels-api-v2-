CREATE ROLE atixlabs NOSUPERUSER NOCREATEDB NOCREATEROLE LOGIN PASSWORD 'atix2018';

CREATE DATABASE coadb WITH OWNER atixlabs;

-- ALTER DATABASE coadb OWNER TO postgres;
