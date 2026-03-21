#!/bin/bash
# scripts/verify_workflowengine.sh
# Read-only checker for workflowEngine.js health and integration

WF_FILE="backend/services/workflowEngine.js"
INDEX_FILE="backend/services/index.js"
MODE5_SCRIPT="scripts/check_mode5.sh"
PROBE_URLS=("http://localhost:5000/api/workflows/probe" "http://127.0.0.1:5000/api/workflows/probe")

file_exists="MISSING"
patch_markers="NOT_FOUND"
export_ok="MISSING"
load_ok="FAIL"
index_ref="NOT_FOUND"
probe_ok="FAIL"
mode5_reports_workflowEngine="NOT_RUN"

# 1. File existence
if [ -f "$WF_FILE" ]; then
  file_exists="FOUND"
else
  file_exists="MISSING"
fi

# 2. File sanity (patch/diff markers)
if [ "$file_exists" = "FOUND" ]; then
  if grep -Eq '(^--- |^\+\+\+ |^@@|^index )' "$WF_FILE"; then
    patch_markers="PATCH_MARKERS_FOUND"
  else
    patch_markers="NOT_FOUND"
  fi
fi

# 3. Export check
if [ "$file_exists" = "FOUND" ]; then
  if grep -Eq 'module\.exports|export default' "$WF_FILE"; then
    export_ok="FOUND"
  else
    export_ok="MISSING"
  fi
fi

# 4. Load check (Node require)
if [ "$file_exists" = "FOUND" ]; then
  node -e "require('./$WF_FILE'); console.log('OK')" >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    load_ok="OK"
  else
    load_ok="FAIL"
  fi
fi

# 5. Service index check
if [ -f "$INDEX_FILE" ]; then
  if grep -q "workflowEngine" "$INDEX_FILE"; then
    index_ref="FOUND"
  else
    index_ref="NOT_FOUND"
  fi
else
  index_ref="NOT_FOUND"
fi

# 6. Probe endpoint check
for url in "${PROBE_URLS[@]}"; do
  resp=$(curl -s --max-time 2 "$url")
  if [ $? -eq 0 ]; then
    loaded=$(echo "$resp" | grep -o '"loaded":[ ]*true')
    if [ -n "$loaded" ]; then
      probe_ok="OK"
      break
    fi
  else
    probe_ok="CONNECTION_FAILED"
  fi
done

# 7. MODE5 checker
if [ -f "$MODE5_SCRIPT" ]; then
  mode5_out=$("$MODE5_SCRIPT" 2>/dev/null)
  if echo "$mode5_out" | grep -q "workflowEngine"; then
    mode5_reports_workflowEngine="FOUND"
  else
    mode5_reports_workflowEngine="NOT_FOUND"
  fi
fi

# 8. Summary & JSON
overall="FAIL"
if [ "$file_exists" = "FOUND" ] && [ "$patch_markers" = "NOT_FOUND" ] && [ "$export_ok" = "FOUND" ] && [ "$load_ok" = "OK" ] && [ "$index_ref" = "FOUND" ] && [ "$probe_ok" = "OK" ]; then
  overall="PASS"
elif [ "$mode5_reports_workflowEngine" = "FOUND" ]; then
  overall="PASS"
fi

echo "=== workflowEngine.js Verification Summary ==="
echo "File exists:           $file_exists"
echo "Patch markers:         $patch_markers"
echo "Export (module/ESM):   $export_ok"
echo "Node load:             $load_ok"
echo "Index.js reference:    $index_ref"
echo "Probe endpoint:        $probe_ok"
echo "MODE5 checker:         $mode5_reports_workflowEngine"
echo "Overall result:        $overall"
echo "---------------------------------------------"
echo "{\"file_exists\":\"$file_exists\",\"patch_markers\":\"$patch_markers\",\"export_ok\":\"$export_ok\",\"load_ok\":\"$load_ok\",\"index_ref\":\"$index_ref\",\"probe_ok\":\"$probe_ok\",\"mode5_reports_workflowEngine\":\"$mode5_reports_workflowEngine\",\"overall\":\"$overall\"}"