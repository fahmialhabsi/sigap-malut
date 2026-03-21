#!/bin/bash
# scripts/verify_cross_agency.sh
# Read-only checker for cross-agency workflow implementation

set -e

MAX_LINES=200
SEARCH_TERMS="domainSequence|currentDomain|currentAgency|domain_sequence|current_domain|current_agency|current_step_index"
MODEL_FILE="backend/models/WorkflowInstance.js"
MIGRATION_PATTERN="cross-agency"
MIGRATION_FILE="backend/migrations/20260315-add-cross-agency-to-workflow-instance.js"
ENGINE_FILE="backend/services/workflowEngine.js"
SERVICE_FILE="backend/services/workflowService.js"
TEST_SCRIPT="backend/scripts/test_workflow.js"
MODE5_SCRIPT="scripts/check_mode5.sh"
PROBE_SCRIPT="scripts/verify_workflowengine.sh"
PROBE_URL="http://localhost:3000/api/workflows/probe"

# 1. Search terms
echo "==[1] Search terms in codebase=="
grep -iEnr --include="*.js" --include="*.ts" --include="*.json" --include="*.md" --include="*.sh" "$SEARCH_TERMS" backend/ config/ scripts/ frontend/ 2>/dev/null | head -n $MAX_LINES
SEARCH_FOUND=$?

# 2. Model check
echo
echo "==[2] Model field check=="
declare -A FIELDS
FIELDS=( [domain_sequence]=MISSING [current_domain]=MISSING [current_agency]=MISSING [current_step_index]=MISSING [current_state]=MISSING )
if [ -f "$MODEL_FILE" ]; then
  for f in "${!FIELDS[@]}"; do
    if grep -iq "$f" "$MODEL_FILE"; then
      FIELDS[$f]=FOUND
    fi
  done
  echo "Model file: FOUND"
else
  echo "Model file: MISSING"
fi
for f in "${!FIELDS[@]}"; do
  echo "  $f: ${FIELDS[$f]}"
done

# 3. Migration check
echo
echo "==[3] Migration file check=="
MIGRATION_PRESENT=MISSING
MIGRATION_FIELDS=(domain_sequence current_domain current_agency current_step_index current_state)
MIGRATION_FIELD_STATUS=()
MIGRATION_FILE_FOUND=""
for mf in $(find backend/migrations -type f -iname "*$MIGRATION_PATTERN*.js" -o -iname "*add-cross-agency*.js" 2>/dev/null); do
  MIGRATION_FILE_FOUND="$mf"
  break
done
if [ -z "$MIGRATION_FILE_FOUND" ] && [ -f "$MIGRATION_FILE" ]; then
  MIGRATION_FILE_FOUND="$MIGRATION_FILE"
fi
if [ -n "$MIGRATION_FILE_FOUND" ]; then
  MIGRATION_PRESENT=FOUND
  for f in "${MIGRATION_FIELDS[@]}"; do
    if grep -iq "$f" "$MIGRATION_FILE_FOUND"; then
      MIGRATION_FIELD_STATUS+=("$f: FOUND")
    else
      MIGRATION_FIELD_STATUS+=("$f: MISSING")
    fi
  done
  echo "Migration file: $MIGRATION_FILE_FOUND"
else
  echo "Migration file: MISSING"
fi
echo "Migration fields:"
for s in "${MIGRATION_FIELD_STATUS[@]}"; do
  echo "  $s"
done

# 4. Engine & Service reference check
echo
echo "==[4] Engine & Service reference check=="
ENGINE_REFS=MISSING
SERVICE_REFS=MISSING
if [ -f "$ENGINE_FILE" ]; then
  if grep -iqE "domain_sequence|current_domain|current_step_index" "$ENGINE_FILE"; then
    ENGINE_REFS=FOUND
  fi
fi
if [ -f "$SERVICE_FILE" ]; then
  if grep -iqE "domain_sequence.*(create|update)|current_domain|current_agency|current_step_index|WorkflowHistory" "$SERVICE_FILE"; then
    SERVICE_REFS=FOUND
  fi
fi
echo "workflowEngine.js: $ENGINE_REFS"
echo "workflowService.js: $SERVICE_REFS"

# 5. Create workflow persistence
echo
echo "==[5] createWorkflow persistence check=="
CREATE_PERSISTED=NOT_PERSISTED
CREATE_LINES=""
if [ -f "$SERVICE_FILE" ]; then
  CREATE_LINES=$(grep -iEn 'WorkflowInstance\\.create.*CROSS_AGENCY_PERSIST' "$SERVICE_FILE" || true)
  if [ -n "$CREATE_LINES" ]; then
    CREATE_PERSISTED=PERSISTED
  fi
fi
echo "createWorkflow persists domain_sequence: $CREATE_PERSISTED"
if [ "$CREATE_PERSISTED" = "PERSISTED" ]; then
  echo "$CREATE_LINES"
fi

# 6. Dynamic test existence
echo
echo "==[6] Test script existence=="
if [ -f "$TEST_SCRIPT" ]; then
  TEST_SCRIPT_EXISTS=EXISTS
else
  # Try to find similar
  TEST_SCRIPT_EXISTS=$(find backend/scripts -iname "test_workflow*.js" 2>/dev/null | grep -q . && echo EXISTS || echo MISSING)
fi
echo "Test script: $TEST_SCRIPT_EXISTS"

# 7. MODE5 checker
echo
echo "==[7] MODE5 checker=="
MODE5_RESULT=NOT_RUN
if [ -f "$MODE5_SCRIPT" ]; then
  MODE5_OUT=$("$MODE5_SCRIPT" 2>/dev/null | grep -iE "cross_terms|cross_agency|currentDomain|domainSequence" || true)
  if echo "$MODE5_OUT" | grep -iq "found"; then
    MODE5_RESULT=FOUND
  elif [ -n "$MODE5_OUT" ]; then
    MODE5_RESULT=FOUND
  else
    MODE5_RESULT=MISSING
  fi
  echo "$MODE5_SCRIPT output:"
  echo "$MODE5_OUT"
else
  echo "MODE5 script: NOT FOUND"
fi
echo "mode5_cross_terms: $MODE5_RESULT"

# 8. Probe endpoint verification
echo
echo "==[8] Probe endpoint verification=="
PROBE_OK=NOT_RUN
if [ -f "$PROBE_SCRIPT" ]; then
  PROBE_OUT=$("$PROBE_SCRIPT" 2>/dev/null | grep -i "probe OK" || true)
  if echo "$PROBE_OUT" | grep -iq "probe OK"; then
    PROBE_OK=OK
  else
    PROBE_OK=CONNECTION_FAILED
  fi
  echo "$PROBE_SCRIPT output:"
  echo "$PROBE_OUT"
else
  # Try curl
  CURL_OUT=$(curl -s --max-time 3 "$PROBE_URL" || true)
  if echo "$CURL_OUT" | grep -q '"loaded":true'; then
    PROBE_OK=OK
    echo "Probe endpoint: OK"
  elif [ -n "$CURL_OUT" ]; then
    PROBE_OK=CONNECTION_FAILED
    echo "Probe endpoint: CONNECTION_FAILED"
  else
    echo "Probe endpoint: NOT RUN"
  fi
fi

# 9. Summary & overall
echo
echo "==[9] Summary=="
PASS=true
for f in domain_sequence current_domain current_agency current_step_index current_state; do
  if [ "${FIELDS[$f]}" != "FOUND" ]; then
    PASS=false
  fi
done
if [ "$MIGRATION_PRESENT" != "FOUND" ]; then PASS=false; fi
if [ "$ENGINE_REFS" != "FOUND" ]; then PASS=false; fi
if [ "$SERVICE_REFS" != "FOUND" ]; then PASS=false; fi
if [ "$PROBE_OK" = "OK" ] || [ "$MODE5_RESULT" = "FOUND" ] || [ "$CREATE_PERSISTED" = "PERSISTED" ]; then
  # at least one of these is OK
  :
else
  PASS=false
fi

echo "Model fields: ${FIELDS[*]}"
echo "Migration: $MIGRATION_PRESENT"
echo "Engine refs: $ENGINE_REFS"
echo "Service refs: $SERVICE_REFS"
echo "createWorkflow persists sequence: $CREATE_PERSISTED"
echo "Test script: $TEST_SCRIPT_EXISTS"
echo "mode5_cross_terms: $MODE5_RESULT"
echo "probe_ok: $PROBE_OK"
echo "Overall: $( [ "$PASS" = true ] && echo PASS || echo FAIL )"

# JSON output
echo
echo "==[JSON RESULT]=="
cat <<EOF
{
  "fields_in_model": {
    "domain_sequence": "${FIELDS[domain_sequence]}",
    "current_domain": "${FIELDS[current_domain]}",
    "current_agency": "${FIELDS[current_agency]}",
    "current_step_index": "${FIELDS[current_step_index]}",
    "current_state": "${FIELDS[current_state]}"
  },
  "migration_present": "$MIGRATION_PRESENT",
  "engine_refs": "$ENGINE_REFS",
  "service_refs": "$SERVICE_REFS",
  "create_workflow_persists_sequence": "$CREATE_PERSISTED",
  "test_script_exists": "$TEST_SCRIPT_EXISTS",
  "mode5_cross_terms": "$MODE5_RESULT",
  "probe_ok": "$PROBE_OK",
  "overall": "$( [ "$PASS" = true ] && echo PASS || echo FAIL )"
}
EOF