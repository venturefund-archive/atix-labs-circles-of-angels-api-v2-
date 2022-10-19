# Installation

## Run in local environment

### Creating the database

The schema for the `coadb` database can be found in [schema.sql](./db/scripts/schema.sql).
Execute this script by running `psql -d postgres -a -f schema.sql` to create the database.

### Verify prerequisites

1. Configure env vars. Check [example](../.env.example)

2. Complete seed admin email in setup file [setup-config](../setup-config.json)

3. Check prerequisites to

```bash
cd scripts/ && ./verify-initial-setup.sh
```

4. Start server

```bash
npm run index
```

5. Run initial setup script

```bash
node initial-setup.js
```

6. Check the administrator's email box. An email will be sent to reset the password
