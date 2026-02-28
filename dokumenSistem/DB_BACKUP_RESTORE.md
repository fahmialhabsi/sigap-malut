# DB_BACKUP_RESTORE

Backup policy

- Backup before any production migration or role mass-update.
- Retention: keep last 14 daily backups and 12 monthly backups.
- Backup storage: secure S3 bucket or on-prem storage accessible to ops.

Commands (Postgres)

- Backup:
  pg_dump -h $DB_HOST -U $DB_USER -Fc -d $DB_NAME -f backups/prod-$(date +%F-%H%M).dump
- Restore:
  pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME -c backups/<file>.dump

Validation

- After restore, run quick queries to validate critical tables (users, roles, approval_log).

Automation

- The generator will record the backup command and refuse to run destructive migration unless `backup_done: true` in migration-approval.yaml or a DB snapshot exists.
