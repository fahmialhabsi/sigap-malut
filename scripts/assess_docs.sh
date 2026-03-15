#!/usr/bin/env bash
# assess_docs.sh
# Quick scanner to check if documentation for a Government IS is present in given folders.
# Usage: bash scripts/assess_docs.sh
# Run from repo root. Read-only.

set -euo pipefail

ROOT="$(pwd)"
FOLDERS=( ".dse" "dokumenSistem" "frontend/public/master-data" "master-data" )
KEYFILES=( "README" "readme" "openapi.yaml" "openapi.yml" "swagger.yaml" "swagger.yml" "architecture" "erd" "ERD" "deployment" "docker" "kubernetes" "k8s" "rbac" "role" "permission" "workflow" "requirements" "nfr" "security" "privacy" "data-retention" "glossary" "api" )
echo "Assessment started: repo root = $ROOT"
echo

declare -A found_counts
for d in "${FOLDERS[@]}"; do
  echo "Scanning folder: $d"
  if [ -d "$d" ]; then
    echo "  - Exists: YES"
    # list top-level files
    echo "  - Top-level files (up to 50):"
    ls -1 "$d" | sed 's/^/      /' | head -n 50 || true
    # search for keyfiles/keywords
    echo "  - Keyword hits (sample, up to 30 lines):"
    hits=$(grep -RIn --exclude-dir={.git,node_modules,dist,build} -E "$(printf "%s|" "${KEYFILES[@]}" | sed 's/|$//')" "$d" 2>/dev/null || true)
    if [ -n "$hits" ]; then
      printf "%s\n" "$hits" | sed 's/^/      /' | head -n 30
      found_counts["$d"]=1
    else
      echo "      (no keyword hits found)"
      found_counts["$d"]=0
    fi
  else
    echo "  - Exists: NO"
    found_counts["$d"]=0
  fi
  echo
done

echo "Summary per area (heuristic):"
# Key document categories to check
categories=( "Architecture/Diagrams" "Data model/ERD" "Workflow definitions" "API specification (OpenAPI/Swagger)" "RBAC/Role definitions" "Security & Privacy" "Deployment/Infra (Docker/K8s/CI)" "Master data lists" "Glossary / Requirements" "Tests / QA / Migration scripts" )
declare -A cat_found
# heuristics: search repo for keywords per category
cat_found["Architecture/Diagrams"]=$(grep -RIl --exclude-dir={.git,node_modules,dist,build} -E "architecture|diagram|archi|component diagram|deployment diagram" . 2>/dev/null | wc -l || true)
cat_found["Data model/ERD"]=$(grep -RIl --exclude-dir={.git,node_modules,dist,build} -E "ERD|entity relationship|schema|table name|create table|migration|model" . 2>/dev/null | wc -l || true)
cat_found["Workflow definitions"]=$(grep -RIl --exclude-dir={.git,node_modules,dist,build} -E "workflow|workflow_instance|workflow_history|state|draft|submitted|review|approved|rejected" . 2>/dev/null | wc -l || true)
cat_found["API specification (OpenAPI/Swagger)"]=$(ls docs/api/openapi.yaml docs/api/openapi.yml 2>/dev/null | wc -l || true)
cat_found["RBAC/Role definitions"]=$(grep -RIl --exclude-dir={.git,node_modules,dist,build} -E "role|permission|rbac|role_permission|access control" . 2>/dev/null | wc -l || true)
cat_found["Security & Privacy"]=$(grep -RIl --exclude-dir={.git,node_modules,dist,build} -E "security|privacy|data retention|encryption|TLS|CSP|GDPR|personal data" . 2>/dev/null | wc -l || true)
cat_found["Deployment/Infra (Docker/K8s/CI)"]=$(grep -RIl --exclude-dir={.git,node_modules,dist,build} -E "Dockerfile|docker-compose|k8s|kubernetes|helm|deployment.yaml|actions|.github/workflows" . 2>/dev/null | wc -l || true)
cat_found["Master data lists"]=$(grep -RIl --exclude-dir={.git,node_modules,dist,build} -E "master-data|masterdata|lookup|reference data|kod(e)?|kode|kode_instansi|kabupaten|kecamatan" . 2>/dev/null | wc -l || true)
cat_found["Glossary / Requirements"]=$(grep -RIl --exclude-dir={.git,node_modules,dist,build} -E "requirement|functional requirement|non-functional|NFR|glossary|use case|user story" . 2>/dev/null | wc -l || true)
cat_found["Tests / QA / Migration scripts"]=$(grep -RIl --exclude-dir={.git,node_modules,dist,build} -E "test|spec|migration|migrate|seed|fixture" . 2>/dev/null | wc -l || true)

for c in "${categories[@]}"; do
  count=${cat_found[$c]}
  if [ "$count" -gt 0 ]; then
    status="FOUND ($count hits)"
  else
    status="MISSING"
  fi
  printf "  - %-40s : %s\n" "$c" "$status"
done

echo
echo "High-level assessment:"
# Determine completeness heuristically
missing=0
for c in "${categories[@]}"; do
  if [ "${cat_found[$c]}" -eq 0 ]; then missing=$((missing+1)); fi
done

if [ "$missing" -eq 0 ]; then
  echo "  Documents appear to cover all major areas for building a Government IS (heuristic)."
else
  echo "  Detected missing areas: $missing. See list above for specifics (categories marked MISSING)."
fi

echo
echo "Recommended next documents/artifacts to create if missing:"
echo "  - Architecture diagrams: component, deployment, data flow"
echo "  - Data model ERD and table schemas (canonical model)"
echo "  - Full OpenAPI / Swagger spec for public/internal APIs (docs/api/openapi.yaml)"
echo "  - Workflow specifications per module (state diagrams and domain routing)"
echo "  - RBAC matrix: roles, permissions, which API/actions each role can perform"
echo "  - Security & privacy policy: data classification, retention, encryption, audit"
echo "  - Deployment runbook: Docker/K8s manifests, CI/CD pipeline, backups"
echo "  - Master data catalog (definitions and authoritative sources)"
echo "  - Test plans: integration, E2E, load and security tests"
echo
echo "If you want, run: bash scripts/assess_docs.sh > docs_assessment.txt and paste results here so I can advise next steps."
exit 0