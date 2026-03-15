#!/usr/bin/env bash
# check_sigap_mode.sh
# Heuristic detector for SIGAP NGSF execution MODE.
# Output: detected MODE (1..8) and check details.
#
# Usage: bash scripts/check_sigap_mode.sh
# Run from repository root.

set -euo pipefail

ROOT_DIR="$(pwd)"
EXCLUDE_DIRS="(.git|node_modules|venv|dist|build)"

# Helpers
exists_file_ci() {
  # case-insensitive file search for given basename (e.g., workflowEngine.js)
  find . -type f -iname "$1" -print -quit 2>/dev/null || true
}
grep_content() {
  # grep in backend/frontend/docs excluding common large dirs
  # args: pattern paths...
  grep -R --line-number --exclude-dir={.git,node_modules,dist,build} -E "$1" ${2:-.} 2>/dev/null || true
}

echo "SIGAP NGSF MODE CHECKER"
echo "Repository root: $ROOT_DIR"
echo

# 1) Core engines existence checks
declare -A core
core[workflowEngine]="workflowEngine.js workflowEngine.*"
core[rbac]="rbacMiddleware.js rbacMiddleware.*"
core[dashboard]="dashboardService.js dashboardService.*"
core[moduleGenerator]="moduleGeneratorService.js moduleGeneratorService.*"
core[openapiGen]="generateOpenApi.js generateOpenApi.*"

echo "Checking core factory engines..."
core_passed=0
for k in "${!core[@]}"; do
  found=""
  for p in ${core[$k]}; do
    if exists_file_ci "$p" >/dev/null; then
      found=$(exists_file_ci "$p")
      break
    fi
  done
  if [ -n "$found" ]; then
    printf "  - %-18s : FOUND (%s)\n" "$k" "$found"
    core_passed=$((core_passed+1))
  else
    printf "  - %-18s : MISSING\n" "$k"
  fi
done
echo

# 2) Detect modules pattern in repository content
echo "Detecting modules with pattern <DOMAIN>-<CODE> (e.g., SEK-ADM)..."
# Search uppercase patterns like SEK-ADM or BKT-KBJ
module_pattern='[A-Z]{2,4}-[A-Z0-9]{2,}'
modules_raw=$(grep -RhoE "\b$module_pattern\b" backend frontend 2>/dev/null || true)
# unique and sort
modules_list=$(printf "%s\n" "$modules_raw" | sort -u || true)
modules_count=0
if [ -n "$modules_list" ]; then
  modules_count=$(printf "%s\n" "$modules_list" | grep -cve '^$' || true)
fi
echo "  Modules detected: $modules_count"
if [ "$modules_count" -gt 0 ]; then
  printf "  List (up to 50):\n"
  printf "    %s\n" "$(printf "%s\n" "$modules_list" | head -n 50 | sed 's/^/    - /')"
else
  echo "    (no module-like keys found in backend/frontend)"
fi
echo

# 3) MODE heuristics
# MODE1: NATIONAL PLATFORM SCAN -> core engines should exist minimally (at least workflowEngine & rbac & dashboard or moduleGenerator)
mode1_ok=0
if [ $core_passed -ge 2 ]; then
  # require at least workflowEngine + rbac OR moduleGenerator + openapiGen etc.
  mode1_ok=1
fi

# MODE2: GOVERNMENT DOMAIN MAPPING -> module prefixes present (any detected modules)
mode2_ok=0
if [ "$modules_count" -gt 0 ]; then
  mode2_ok=1
fi

# MODE3: NATIONAL MODULE REGISTRY -> presence of a central registry or each module has controller/model/routes/service mentions
mode3_ok=0
# possible registry filenames
registry_files="module-registry.json module_registry.json modules_registry.json modules.json backend/services/moduleRegistry.js docs/modules_registry.json docs/module-registry.json"
found_registry=""
for f in $registry_files; do
  if [ -f "$f" ]; then
    found_registry="$f"
    break
  fi
done

# heuristic: either registry file exists OR for majority of detected modules there are occurrences in controllers/models/services
if [ -n "$found_registry" ]; then
  mode3_ok=1
else
  if [ "$modules_count" -gt 0 ]; then
    total=0
    matched=0
    while IFS= read -r m; do
      [ -z "$m" ] && continue
      total=$((total+1))
      # search for module key inside backend controllers/models/services/routes
      occ=$(grep -RIl --exclude-dir={.git,node_modules,dist,build} -e "$m" backend 2>/dev/null || true)
      if [ -n "$occ" ]; then
        matched=$((matched+1))
      fi
    done <<< "$modules_list"
    # require >=50% modules have occurrences to consider registry present
    if [ "$total" -gt 0 ] && [ $matched -ge $(( (total*50 + 99)/100 )) ]; then
      mode3_ok=1
    fi
  fi
fi

# MODE4: SERVICE MODULE AUTO GENERATION -> many modules have service files in backend/services/modules
mode4_ok=0
if [ -d "backend/services/modules" ]; then
  svc_hits=$(grep -RhoE "\b$module_pattern\b" backend/services/modules 2>/dev/null | sort -u || true)
  svc_count=0
  if [ -n "$svc_hits" ]; then
    svc_count=$(printf "%s\n" "$svc_hits" | grep -cve '^$' || true)
  fi
  # if >=1 module services present and modules detected, mark mode4 possible
  if [ "$svc_count" -gt 0 ] && [ "$modules_count" -gt 0 ]; then
    mode4_ok=1
  fi
fi

# MODE5: CROSS-AGENCY WORKFLOW ENGINE -> look for WorkflowInstance/WorkflowHistory or workflow transitions mention
mode5_ok=0
wf_models=$(grep -RIn --exclude-dir={.git,node_modules,dist,build} -E "WorkflowInstance|WorkflowHistory|cross-?agency|crossagency|cross agency" 2>/dev/null || true)
if [ -n "$wf_models" ]; then
  mode5_ok=1
fi

# MODE6: INTER-OPD API INTEGRATION -> check for /api/integration paths in routes or openapi spec
mode6_ok=0
# check openapi
if [ -f "docs/api/openapi.yaml" ]; then
  if grep -qE "/api/integration|integration" docs/api/openapi.yaml 2>/dev/null; then
    mode6_ok=1
  fi
fi
# check backend routes for "integration"
if [ $mode6_ok -eq 0 ]; then
  if grep -RIl --exclude-dir={.git,node_modules,dist,build} -e "integration" backend 2>/dev/null | grep -q .; then
    mode6_ok=1
  fi
fi

# MODE7: SPBE DASHBOARD GENERATOR -> check dashboardService for spbe-summary or endpoint /api/dashboard/spbe-summary
mode7_ok=0
if grep -RIn --exclude-dir={.git,node_modules,dist,build} -E "spbe-summary|/api/dashboard/spbe-summary|spbe" backend frontend docs 2>/dev/null | grep -q .; then
  mode7_ok=1
fi

# MODE8: FINAL NATIONAL GOVTECH FACTORY REPORT -> presence of factory report or everything else done
mode8_ok=0
if [ -f "reports/factory_report.json" ] || [ -f "reports/factory_report.md" ] || [ -f "reports/factory_report.yaml" ]; then
  mode8_ok=1
else
  # if modes 1..7 all ok, consider mode8
  if [ $mode1_ok -eq 1 ] && [ $mode2_ok -eq 1 ] && [ $mode3_ok -eq 1 ] && [ $mode4_ok -eq 1 ] && [ $mode5_ok -eq 1 ] && [ $mode6_ok -eq 1 ] && [ $mode7_ok -eq 1 ]; then
    mode8_ok=1
  fi
fi

# Decide highest mode satisfied
detected_mode=0
for m in 8 7 6 5 4 3 2 1; do
  okvar=mode${m}_ok
  if [ "${!okvar}" -eq 1 ]; then
    detected_mode=$m
    break
  fi
done

echo "HEURISTIC CHECK SUMMARY:"
printf "  MODE1 (Platform scan)               : %s\n" "$( [ $mode1_ok -eq 1 ] && echo PASS || echo FAIL )"
printf "  MODE2 (Domain mapping)              : %s\n" "$( [ $mode2_ok -eq 1 ] && echo PASS || echo FAIL )"
printf "  MODE3 (Module registry)             : %s\n" "$( [ $mode3_ok -eq 1 ] && echo PASS || echo FAIL )"
printf "  MODE4 (Service generation)          : %s\n" "$( [ $mode4_ok -eq 1 ] && echo PASS || echo FAIL )"
printf "  MODE5 (Cross-agency workflow)       : %s\n" "$( [ $mode5_ok -eq 1 ] && echo PASS || echo FAIL )"
printf "  MODE6 (Inter-OPD integration)       : %s\n" "$( [ $mode6_ok -eq 1 ] && echo PASS || echo FAIL )"
printf "  MODE7 (SPBE dashboard generator)    : %s\n" "$( [ $mode7_ok -eq 1 ] && echo PASS || echo FAIL )"
printf "  MODE8 (Final factory report)        : %s\n" "$( [ $mode8_ok -eq 1 ] && echo PASS || echo FAIL )"

echo
if [ "$detected_mode" -gt 0 ]; then
  echo "DETECTED MODE: MODE $detected_mode"
else
  echo "DETECTED MODE: UNKNOWN (no mode criteria fully matched)"
fi

# Provide simple JSON summary for machine consumption
cat <<EOF
{
  "detected_mode": ${detected_mode},
  "modules_count": ${modules_count},
  "core_engines_found": ${core_passed},
  "checks": {
    "mode1": ${mode1_ok},
    "mode2": ${mode2_ok},
    "mode3": ${mode3_ok},
    "mode4": ${mode4_ok},
    "mode5": ${mode5_ok},
    "mode6": ${mode6_ok},
    "mode7": ${mode7_ok},
    "mode8": ${mode8_ok}
  }
}
EOF