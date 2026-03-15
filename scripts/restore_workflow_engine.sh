#!/usr/bin/env bash
# restore_workflow_engine.sh
# Safely restore workflowEngine from .dse backup to backend/services, verify references, run basic checks.
# Usage: bash scripts/restore_workflow_engine.sh
set -euo pipefail

ROOT="$(pwd)"
BACKUP_PATH=".dse/backups"
# try to auto-detect the most recent workflowEngine in backups
FOUND=$(grep -RIl --exclude-dir={.git,node_modules} "module.exports\\|export default" "$BACKUP_PATH" 2>/dev/null | grep -i "workflowEngine" | sort | tail -n 1 || true)

TARGET_DIR="backend/services"
TARGET_FILE="$TARGET_DIR/workflowEngine.js"

echo "Restore workflowEngine helper"
echo "Repo root: $ROOT"
echo

if [ -z "$FOUND" ]; then
  echo "ERROR: Tidak menemukan file workflowEngine dalam $BACKUP_PATH"
  echo "Saran: cek manual di $BACKUP_PATH atau sebutkan path lengkap"
  exit 2
fi

echo "Found backup file: $FOUND"
echo

# Ensure target dir exists
if [ ! -d "$TARGET_DIR" ]; then
  echo "Creating target directory: $TARGET_DIR"
  mkdir -p "$TARGET_DIR"
fi

# Backup existing target if exists
if [ -f "$TARGET_FILE" ]; then
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_EXISTING=".dse/backups/restore-backup-workflowEngine-$TIMESTAMP.js"
  echo "Backing up existing $TARGET_FILE -> $BACKUP_EXISTING"
  mkdir -p .dse/backups
  cp "$TARGET_FILE" "$BACKUP_EXISTING"
fi

# Copy file
echo "Copying $FOUND -> $TARGET_FILE"
cp "$FOUND" "$TARGET_FILE"
chmod 644 "$TARGET_FILE"

echo
# Verify file content/exports
echo "Verifying export presence in $TARGET_FILE"
if grep -Ei "module\\.exports|export default|exports\\." "$TARGET_FILE" >/dev/null; then
  echo "  Export found in $TARGET_FILE"
else
  echo "  WARNING: Could not detect module export lines in $TARGET_FILE. Check file content manually."
fi

echo
# Search codebase for references to workflowEngine
echo "Searching repo for references to workflowEngine (require/import)..."
grep -RIn --exclude-dir={.git,node_modules,dist,build} -E "workflowEngine|workflow_engine" . || true
echo

# Check if serviceRegistry or other registries reference workflow engine
echo "Checking for service registry referencing workflow engine..."
grep -RIn --exclude-dir={.git,node_modules,dist,build} -E "serviceRegistry|serviceRegistry.json|serviceRegistry" . || true
echo

# Optional: attempt to detect whether main app requires it
echo "Looking for direct require/import of workflowEngine in common entry points (backend/app.js, backend/index.js, backend/server.js, backend/services/index.js)..."
for f in backend/app.js backend/index.js backend/server.js backend/services/index.js; do
  if [ -f "$f" ]; then
    echo "  Checking $f"
    grep -InE "workflowEngine|workflow_engine" "$f" || echo "    no match in $f"
  fi
done
echo

# Run lightweight linter/test if available
if [ -f package.json ]; then
  if grep -q "\"lint\"" package.json; then
    echo "Running npm run lint (may take time)..."
    npm run lint || echo "Lint returned non-zero (check errors)"
  fi
  if grep -q "\"test\"" package.json; then
    echo "Running npm test (may take time)..."
    npm test || echo "Tests returned non-zero (check failures)"
  fi
fi

# Re-run MODE5 checker if present
if [ -f scripts/check_mode5.sh ]; then
  echo
  echo "Rerunning scripts/check_mode5.sh to verify MODE5 status..."
  bash scripts/check_mode5.sh | sed 's/^/    /'
else
  echo "scripts/check_mode5.sh not found — run your verification scripts manually."
fi

echo
echo "DONE: workflowEngine restored to $TARGET_FILE"
echo "Next steps:"
echo " - If app uses hot-reload, restart backend process; otherwise restart server/process manager."
echo " - Test workflow endpoints or service actions (if routes exist)."
echo " - Commit changes: git checkout -b feat/restore-workflowEngine && git add $TARGET_FILE && git commit -m \"restore: workflowEngine from .dse backup\" && git push origin HEAD && open PR."
exit 0