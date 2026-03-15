#!/usr/bin/env bash
# check_mode5.sh
# Heuristic verifier for MODE 5 (CROSS-AGENCY WORKFLOW ENGINE)
# Read-only checks. Run from repository root:
#   bash scripts/check_mode5.sh
set -euo pipefail

ROOT_DIR="$(pwd)"
echo "SIGAP NGSF — MODE 5 CHECKER"
echo "Repository root: $ROOT_DIR"
echo

# Helpers
exists_file_ci() {
  find . -type f -iname "$1" -print -quit 2>/dev/null || true
}
grep_files() {
  # args: pattern dirs...
  grep -RIn --exclude-dir={.git,node_modules,dist,build} -E "$1" ${2:-.} 2>/dev/null || true
}

pass=0
fail=0
declare -A details

echo "1) Check model / persistence presence (WorkflowInstance, WorkflowHistory, tables)..."
models_found=$(grep_files "WorkflowInstance|WorkflowHistory|workflow_instance|workflow_history|workflow_instances|workflow_histories" backend migrations || true)
if [ -n "$models_found" ]; then
  details[models]="FOUND"
  echo "  - Models / migrations references: FOUND"
  echo "$models_found" | sed 's/^/    /' | head -n 20
  pass=$((pass+1))
else
  details[models]="MISSING"
  echo "  - Models / migrations references: MISSING"
  fail=$((fail+1))
fi
echo

echo "2) Check workflow engine file existence and active location..."
we_found=$(exists_file_ci "workflowEngine.js" || true)
we_backup=$(grep -RIl --exclude-dir={.git,node_modules} "workflowEngine.js" . | grep '\.dse\|backup\|backups' || true)
if [ -n "$we_found" ]; then
  details[workflowEngine]="FOUND:$we_found"
  echo "  - workflowEngine found: $we_found"
  pass=$((pass+1))
  if [ -n "$we_backup" ]; then
    echo "    (Note: additional copies found in backup paths)"
    echo "$we_backup" | sed 's/^/      /'
  fi
else
  details[workflowEngine]="MISSING"
  echo "  - workflowEngine: MISSING"
  fail=$((fail+1))
fi
echo

echo "3) Check engine supports cross-agency concepts (domainSequence/currentDomain/currentAgency)..."
cross_terms=$(grep_files "domainSequence|currentDomain|currentAgency|domain_sequence|current_domain|agencySequence" backend || true)
if echo "$cross_terms" | grep -qiE "domain"; then
  details[cross_terms]="FOUND"
  echo "  - Cross-agency terms found in code:"
  echo "$cross_terms" | sed 's/^/    /' | head -n 30
  pass=$((pass+1))
else
  details[cross_terms]="MISSING"
  echo "  - Cross-agency terms NOT found"
  fail=$((fail+1))
fi
echo

echo "4) Check state machine states (draft, submitted, review, approved, rejected)..."
state_hits=$(grep_files "draft|submitted|review|approved|rejected" backend || true)
# require at least two distinct state-word matches within workflow-related files
state_count=$(printf "%s\n" "$state_hits" | grep -E "draft|submitted|review|approved|rejected" -o | sort -u | wc -l || true)
if [ "$state_count" -ge 3 ]; then
  details[states]="FOUND"
  echo "  - State names found (>=3 distinct):"
  printf "    %s\n" "$(printf "%s\n" "$state_hits" | grep -E "draft|submitted|review|approved|rejected" -o | sort -u)"
  pass=$((pass+1))
else
  details[states]="MISSING_OR_INCOMPLETE"
  echo "  - State names appear missing or incomplete (found distinct states: $state_count)."
  fail=$((fail+1))
fi
echo

echo "5) Check API routes for workflows (/api/workflows, transition endpoints)..."
routes_hits=$(grep_files "/api/workflows|/api/workflow|router.*workflows|workflows/:id|/workflows" backend || true)
if echo "$routes_hits" | grep -qi "/api/workflows\|transition"; then
  details[routes]="FOUND"
  echo "  - Workflow-related routes found:"
  echo "$routes_hits" | sed 's/^/    /' | head -n 40
  pass=$((pass+1))
else
  details[routes]="MISSING"
  echo "  - Workflow routes NOT found (/api/workflows or transition endpoints)"
  fail=$((fail+1))
fi
echo

echo "6) Check RBAC integration for workflow actions (rbac.allow('workflow:...'))..."
rbac_hits=$(grep_files "rbac|rbacMiddleware|allow\\('workflow" backend || true)
if echo "$rbac_hits" | grep -qi "allow\\('workflow"; then
  details[rbac]="FOUND"
  echo "  - RBAC 'workflow' permissions found in code:"
  echo "$rbac_hits" | sed 's/^/    /' | head -n 30
  pass=$((pass+1))
else
  # still accept if rbac middleware present and used in routes
  if echo "$rbac_hits" | grep -qi "rbacMiddleware"; then
    details[rbac]="POSSIBLE"
    echo "  - rbacMiddleware present but explicit 'workflow' permission strings not found. Check manually."
    pass=$((pass+1))
  else
    details[rbac]="MISSING"
    echo "  - RBAC integration for workflows NOT found"
    fail=$((fail+1))
  fi
fi
echo

echo "7) Check persistence operations (inserts/updates to workflow tables or model save calls)..."
persistence_hits=$(grep_files "insert.*workflow|save.*Workflow|create.*Workflow|update.*workflow_instances|insert.*workflow_instances" backend migrations || true)
if [ -n "$persistence_hits" ]; then
  details[persistence]="FOUND"
  echo "  - Persistence operations referencing workflow tables/models found:"
  echo "$persistence_hits" | sed 's/^/    /' | head -n 40
  pass=$((pass+1))
else
  details[persistence]="MISSING"
  echo "  - No obvious persistence operations found for workflow instances/history (manual review recommended)"
  fail=$((fail+1))
fi
echo

echo "8) Check for tests or examples for cross-agency flows..."
test_hits=$(grep_files "workflow.*test|workflows.*test|cross-?agency.*test|WorkflowInstance.*test" . || true)
if [ -n "$test_hits" ]; then
  details[tests]="FOUND"
  echo "  - Test references found:"
  echo "$test_hits" | sed 's/^/    /' | head -n 20
  pass=$((pass+1))
else
  details[tests]="MISSING"
  echo "  - No tests found for cross-agency workflows"
  fail=$((fail+1))
fi
echo

# Summary
echo "SUMMARY CHECK (MODE 5):"
echo "  Pass checks : $pass"
echo "  Fail checks : $fail"
if [ $fail -eq 0 ] && [ $pass -ge 5 ]; then
  echo
  echo "RESULT: MODE 5 REQUIREMENTS APPEAR TO BE SATISFIED (heuristic)."
  result=PASS
else
  echo
  echo "RESULT: MODE 5 NOT FULLY SATISFIED. See details below."
  result=FAIL
fi

echo
echo "DETAILED RESULTS (KEY:VALUE):"
for k in "${!details[@]}"; do
  printf "  - %-12s : %s\n" "$k" "${details[$k]}"
done

# JSON output for automation
cat <<EOF
{
  "mode": 5,
  "result": "${result}",
  "pass_checks": ${pass},
  "fail_checks": ${fail},
  "details": {
    "models": "${details[models]:-unknown}",
    "workflowEngine": "${details[workflowEngine]:-unknown}",
    "cross_terms": "${details[cross_terms]:-unknown}",
    "states": "${details[states]:-unknown}",
    "routes": "${details[routes]:-unknown}",
    "rbac": "${details[rbac]:-unknown}",
    "persistence": "${details[persistence]:-unknown}",
    "tests": "${details[tests]:-unknown}"
  }
}
EOF

if [ "$result" = "FAIL" ]; then
  echo
  echo "RECOMMENDATIONS (quick):"
  echo " - Jika models MISSING: tambah WorkflowInstance & WorkflowHistory model/migration."
  echo " - Jika cross_terms MISSING: pastikan workflowEngine menyimpan currentDomain/domainSequence."
  echo " - Jika routes MISSING: buat endpoints /api/workflows, /api/workflows/:id/transition."
  echo " - Jika rbac MISSING: pasang rbac.allow('workflow:...') pada routes."
  echo " - Jalankan kembali skrip setelah perubahan: bash scripts/check_mode5.sh"
fi

exit 0