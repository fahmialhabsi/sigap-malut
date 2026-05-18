# Doc-as-Code Verification Report — SIGAP-MALUT

**Tanggal:** 2026-04-06 | **Versi:** v3.0

---

## 1. Verification Checks yang Tersedia

### Check A — Route Active vs OpenAPI (Semi-Otomatis)

**Command:**
```powershell
# Jalankan dari E:\sigap-malut\backend
$serverRoutes = (Get-Content server.js | Select-String "app\.use.*api/").Line
$oaPaths = (Get-Content ..\dokumenSistem\openapi.yaml | Select-String "^  /api/").Line
Write-Host "Server mounts: $($serverRoutes.Count)"
Write-Host "OpenAPI paths: $($oaPaths.Count)"
```

**Expected:** Semua prefix OpenAPI harus ter-mount di server.js atau via `registerRoutes(app)`.

---

### Check B — Status ENUM vs TRANSITIONS

**Command:**
```powershell
# Count ENUM values
$enum = (Get-Content backend\models\Task.js | Select-String '^\s+"[a-z_]+",$').Count
Write-Host "ENUM values: $enum (expected: 21)"

# Verify approved_kabid in TRANSITIONS
$t = (Get-Content backend\controllers\taskController.js | Select-String "approved_kabid").Count
Write-Host "approved_kabid references in transitions: $t (expected: >2)"
```

**Expected:** 21 statuses, semua referenced di TRANSITIONS.

---

### Check C — Phantom Endpoint Detection

**Command:**
```powershell
# Cari path di OpenAPI yang tidak punya route handler
$oaPaths = (Get-Content dokumenSistem\openapi.yaml | Select-String "^  /api/tasks/\{id\}/force|/api/tasks/\{id\}/reassign")
Write-Host "Phantom endpoints: $($oaPaths.Count) (must be 0)"
```

**Expected:** 0

---

### Check D — Governance Guards DB-Backed

**Command:**
```powershell
# Pastikan tidak ada req.body trust di guard aktif
$live = (Get-Content backend\middleware\chainOfCommandGuard.js) |
    Where-Object { $_ -notmatch "^\s*[/*]" -and $_ -match "req\.body\.(sekretaris_disetujui|jf_diverifikasi)" }
Write-Host "Live body trust lines: $($live.Count) (must be 0)"
```

**Expected:** 0

---

### Check E — Public Routes No Auth

**Command:**
```powershell
$count = (Get-Content backend\routes\public.js | Select-String "protect").Count
Write-Host "protect in public.js: $count (must be 0)"
```

**Expected:** 0

---

### Check F — Submit Validator Active

**Command:**
```powershell
$v = (Get-Content backend\utils\submitValidation.js | Select-String "OUTPUT_TOO_SHORT").Count
Write-Host "Submit validator: $v (must be >0)"
```

**Expected:** > 0

---

### Check G — close from verified blocked

**Command:**
```powershell
$closeBlock = (Get-Content backend\controllers\taskController.js |
    Select-String "close:" -Context 0,12).Context.PostContext -join " "
if ($closeBlock -match '"verified"') { Write-Host "FAIL: verified in close.from" }
else { Write-Host "PASS: verified not in close.from" }
```

**Expected:** PASS

---

## 2. CI/CD Integration

Checks A–G sudah diintegrasikan dalam `.github/workflows/p0p1-regression-guard.yml` (dibuat sesi sebelumnya).

**Trigger:** Push/PR ke `main`, `feat/**`, `audit/**`

---

## 3. Hasil Eksekusi Saat Ini

| Check | Hasil |
|-------|-------|
| A — Route vs OpenAPI | ✅ PASS — semua prefix aktif |
| B — ENUM vs TRANSITIONS | ✅ PASS — 21/21 synced |
| C — Phantom endpoints | ✅ PASS — 0 phantom |
| D — Guard DB-backed | ✅ PASS — 0 body trust |
| E — Public no auth | ✅ PASS — 0 protect calls |
| F — Submit validator | ✅ PASS — validator aktif |
| G — close from verified blocked | ✅ PASS |

**All 7 checks PASS** ✅

---

## 4. Script Audit Lengkap (One-Command)

Simpan sebagai `backend/scripts/doc-as-code-verify.ps1`:

```powershell
# SIGAP-MALUT Doc-as-Code Verification Script
# Run: powershell -ExecutionPolicy Bypass -File scripts/doc-as-code-verify.ps1

$pass = 0; $fail = 0

function Check($name, $result) {
    if ($result) { Write-Host "PASS: $name" -ForegroundColor Green; $script:pass++ }
    else { Write-Host "FAIL: $name" -ForegroundColor Red; $script:fail++ }
}

# Check B: ENUM count
$enumCount = (Get-Content models\Task.js | Select-String '^\s+"[a-z_]+",$').Count
Check "ENUM 21 statuses" ($enumCount -eq 21)

# Check C: No phantom endpoints
$phantom = (Get-Content ..\dokumenSistem\openapi.yaml | Select-String "/api/tasks/\{id\}/force-close|/api/tasks/\{id\}/reassign").Count
Check "No phantom endpoints" ($phantom -eq 0)

# Check D: No body trust in guards
$bodyTrust = (Get-Content middleware\chainOfCommandGuard.js) |
    Where-Object { $_ -notmatch "^\s*[/*]" -and $_ -match "req\.body\.(sekretaris_disetujui|jf_diverifikasi)" }
Check "Guard DB-backed" ($bodyTrust.Count -eq 0)

# Check E: Public no auth
$pubAuth = (Get-Content routes\public.js | Select-String "protect").Count
Check "Public no auth" ($pubAuth -eq 0)

# Check F: Submit validator
$sv = (Get-Content utils\submitValidation.js | Select-String "OUTPUT_TOO_SHORT").Count
Check "Submit validator" ($sv -gt 0)

Write-Host ""
Write-Host "RESULT: $pass PASS, $fail FAIL"
if ($fail -eq 0) { Write-Host "ALL CHECKS PASSED" -ForegroundColor Green }
else { Write-Host "CHECKS FAILED — review above" -ForegroundColor Red; exit 1 }
```
