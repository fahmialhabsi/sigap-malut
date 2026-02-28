# DB_DEPLOYMENT_POLICY

Tujuan

- Menetapkan target RDBMS per environment dan aturan credential handling.

Environments

- development: sqlite (local) or docker postgres (recommend)
- staging: postgres (host: <STAGING_DB_HOST>)
- production: postgres (host: <PROD_DB_HOST>)

Config recommended

- production should use Postgres with SSL and secrets stored in secret manager (do NOT commit credentials).
- Use .env for local and templates for CI (.env.postgres.example).

Secrets & Access

- Production DB credentials MUST be stored in:
  - GitHub Secrets (CI) and/or
  - Vault/Secret Manager (cloud provider)
- CI will read DB connection strings from secrets and run smoke tests only if `migration-approval` is present.

How generator uses this file

- Generator will generate Postgres-friendly migrations if target_env = "postgres" in migration-approval.yaml.
- Generator will NOT write credentials; it will create `.env.tpl` and instruct ops to populate secrets.
