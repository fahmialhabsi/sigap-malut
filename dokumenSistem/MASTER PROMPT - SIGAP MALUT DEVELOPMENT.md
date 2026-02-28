COPY-PASTE PROMPT INI UNTUK MEMULAI:

🔧 SIGAP MALUT - AUTO DEVELOPMENT

MODE: Full Compliance dengan Dokumen Resmi
REFS:

- sigap-malut/docs/01-kondisi-dinas-pangan.md
- sigap-malut/docs/02-dokumentasi-sistem.md
- sigap-malut/master-data/\*.csv

TASK: [Tulis task Anda di sini]

EXAMPLES:

- "Audit sistem saat ini"
- "Develop modul SEK-KEP"
- "Fix error: [paste error di sini]"
- "Update modul BKT-PGD sesuai dokumen"
- "Generate laporan untuk semua modul"

MODE: Full Compliance
TASK: Audit sistem saat ini

FILES UPLOADED:
01-kondisi-dinas-pangan.md
02-dokumentasi-sistem.md

CONTEXT:

- Project: E:/sigap-malut
- Phase 1 Done: SEK-ADM, BDS-HRG, BKT-PGD
- Phase 2 Target: 36 modul lainnya

ACTION:

1. Read uploaded docs
2. Cross-check dengan backend/frontend code
3. Verify field mapping dengan master-data CSVs
4. Generate REAL compliance report
5. Prioritize next steps berdasarkan business impact

UNTUK ERROR :
MODE: Full Compliance
TASK: Fix error

no-case-declarations
frontend/src/pages/ModulePage.jsx

ACTION: Auto-execute sesuai SOP berikut.

🤖 SOP OTOMATIS UNTUK AI (SAYA):
Ketika Anda mengirim prompt di atas, saya akan OTOMATIS menjalankan langkah berikut:

PHASE 1: DOCUMENT ANALYSIS ⚙️
Step 1.1 - Load Reference Documents:

Code
✓ Read sigap-malut/docs/01-kondisi-dinas-pangan.md
✓ Read sigap-malut/docs/02-dokumentasi-sistem.md
✓ Parse master-data/\*.csv for field definitions
✓ Understand:

- 5 Unit Kerja
- 38 Layanan Publik
- 41 Database Tables
- Business Logic & Workflows
  Step 1.2 - Analyze Current System State:

Code
✓ Check backend/models/_.js vs documented tables
✓ Check backend/routes/_.js vs documented endpoints
✓ Check frontend/src/pages/\*.jsx vs documented UI
✓ Identify gaps & mismatches
Step 1.3 - Generate Compliance Report:

Code
📊 COMPLIANCE STATUS:
├─ Database Schema: X/41 tables (X%)
├─ Backend API: X/190 endpoints (X%)
├─ Frontend Modules: X/38 modules (X%)
├─ Workflows: X/Y implemented (X%)
└─ ⚠️ Gaps: [List discrepancies]
PHASE 2: AUTO-FIX DISCREPANCIES 🔧
IF gaps found → Auto-generate missing/incorrect files:

Code
⚙️ FIXING DISCREPANCIES...

[1/X] Creating missing model: backend/models/SekKep.js
✓ Fields from: master-data/FIELDS_SEKRETARIAT/SEK-KEP_fields.csv
✓ Relationships per docs/02-dokumentasi-sistem.md

[2/X] Updating route: backend/routes/SEK-KEP.js
✓ Endpoints per docs/02-dokumentasi-sistem.md
✓ Middleware: protect (authentication)

[3/X] Creating UI: frontend/src/pages/SEKKEPPage.jsx
✓ Fields per master-data/FIELDS_SEKRETARIAT/SEK-KEP_fields.csv
✓ Layout per docs/01-kondisi-dinas-pangan.md

[4/X] Updating navigation: frontend/src/components/Sidebar.jsx
✓ Add SEK-KEP to Sekretariat section

✅ ALL GAPS FIXED - System now 100% compliant!
PHASE 3: TASK EXECUTION 🎯
Based on your TASK input:

IF TASK = "Audit sistem saat ini":

Code
→ Execute PHASE 1 only
→ Provide detailed report
→ List action items
IF TASK = "Develop modul [MODULE_ID]":

Code
→ Execute PHASE 1 (check compliance)
→ Execute PHASE 2 (fix gaps)
→ Generate full CRUD for specified module:
✓ backend/models/[MODULE].js
✓ backend/controllers/[MODULE].js
✓ backend/routes/[MODULE].js
✓ frontend/src/pages/[MODULE]Page.jsx
✓ frontend/src/pages/[MODULE]CreatePage.jsx
✓ frontend/src/pages/[MODULE]EditPage.jsx
→ Update App.jsx routes
→ Update Sidebar navigation
→ Provide TEST INSTRUCTIONS
IF TASK = "Fix error: [ERROR_MESSAGE]":

Code
→ Analyze error context
→ Check against docs for correct implementation
→ Generate fix
→ Explain what was wrong
→ Provide updated code
IF TASK = "Update modul [MODULE_ID] sesuai dokumen":

Code
→ Compare current implementation vs docs
→ List differences
→ Generate updated code
→ Provide migration script if needed
PHASE 4: TEST INSTRUCTIONS 🧪
After code generation, provide:

Code
🧪 TEST INSTRUCTIONS - WINDOWS GIT BASH

📍 ACTIVE PATH: /e/sigap-malut

## STEP 1: Backend

$ cd backend
$ npm install # (if new dependencies)
$ npm run dev

Expected Output:
✓ Server running on port 5000
✓ Database connection established

---

## STEP 2: Frontend (NEW TERMINAL)

$ cd frontend
$ npm install # (if new dependencies)
$ npm run dev

Expected Output:
✓ Vite dev server running on http://localhost:5173

---

## STEP 3: Test Module [MODULE_ID]

1. Login: http://localhost:5173/login
   Username: superadmin
   Password: Admin123

2. Navigate: Sidebar → [Unit Kerja] → [Module Name]

3. Test CREATE:
   - Click: + Tambah Data
   - Fill form with test data:
     [Specific field values based on module]
   - Submit
   - Expected: Success alert, redirect to list

4. Test READ:
   - Verify data appears in table
   - Check all columns display correctly

5. Test VIEW:
   - Click: View on any record
   - Expected: Detail page with all fields

6. Test UPDATE:
   - Click: Edit on any record
   - Modify: [specific field]
   - Submit
   - Expected: Success alert, data updated

7. Test DELETE:
   - Click: Delete on any record
   - Confirm
   - Expected: Success alert, data removed

---

## STEP 4: Test Workflow (if applicable)

[Module-specific workflow tests]

---

✅ ALL TESTS PASS?
→ Reply: "✅ Semua test berhasil"
→ I will proceed to next module

❌ GOT ERROR?
→ Copy-paste FULL error message
→ I will auto-fix immediately
PHASE 5: ERROR HANDLING 🚨
When you paste error:

Code
🔍 ANALYZING ERROR...

Error Type: [Runtime/Compile/Logic/Database]
Location: [File:Line]
Root Cause: [Explanation]

📋 COMPARING WITH DOCS:
✓ docs/02-dokumentasi-sistem.md says: [correct spec]
✗ Current code does: [wrong implementation]

🔧 GENERATING FIX...

## UPDATE: [filename]

## [Complete fixed code]

EXPLANATION:

- Issue: [What was wrong]
- Fix: [What changed]
- Compliance: [How it matches docs now]

🧪 RE-TEST:
[Same test instructions as before]
📝 ADDITIONAL PROMPT COMMANDS:
Quick Commands:
Code
"📊 Status" → Compliance report only
"🔍 Audit [MODULE]" → Deep audit specific module
"🚀 Deploy prep" → Pre-deployment checklist
"📚 Generate docs" → User manual generation
"🔄 Sync all" → Update all modules to match docs
"🧹 Clean code" → Refactor & optimize
"🔐 Security audit" → Check authentication/authorization
"⚡ Performance" → Analyze & optimize queries
🎯 PRIORITAS DEVELOPMENT (Auto-Suggested):
Berdasarkan docs/01-kondisi-dinas-pangan.md, prioritas:

Code
PHASE 2A - HIGH PRIORITY (Week 1-4):
└─ Modul yang paling sering digunakan & critical:

1.  SEK-KEP (Kepegawaian - data pegawai)
2.  SEK-KEU (Keuangan - penggajian, realisasi)
3.  BKT-KRW (Kerawanan Pangan - early warning)
4.  BDS-CPD (Cadangan Pangan - stok strategis)
5.  BKS-KMN (Keamanan Pangan - PIRT, sertifikasi)

PHASE 2B - MEDIUM PRIORITY (Week 5-8):
└─ Supporting modules: 6. BKT-FSL (Fasilitasi Ketersediaan) 7. BDS-MON (Monitoring Distribusi) 8. BKS-DVR (Diversifikasi Pangan) 9. SEK-REN (Perencanaan) 10. SEK-AST (Aset)

PHASE 2C - LOW PRIORITY (Week 9-12):
└─ Reporting & analytics:
11-20. [Remaining modules]

PHASE 2D - FINAL (Week 12):
└─ UPTD modules
21-38. [UPTD modules]
🛡️ BUILT-IN SAFEGUARDS:
Code
✓ Every code references docs (compliance)
✓ Every field matches master-data CSV (consistency)
✓ Every workflow follows business logic (correctness)
✓ Every API has authentication (security)
✓ Every error gets fixed (reliability)
✓ Every test is documented (maintainability)
📞 KOMUNIKASI FORMAT:
Anda (Minimal Input):
Code
Option 1: "Develop modul SEK-KEP"
Option 2: "Error: [paste error]"
Option 3: "Status"
Option 4: "Next" (after successful test)
Saya (Complete Output):
Code
✓ Compliance check
✓ Code generation
✓ Test instructions
✓ Error handling (if needed)
✓ Next steps
🎊 FINAL MASTER PROMPT TEMPLATE:
Markdown
🔧 SIGAP MALUT - AUTO DEVELOPMENT

REFS: ✓ docs/01-kondisi-dinas-pangan.md
✓ docs/02-dokumentasi-sistem.md  
 ✓ master-data/\*.csv

TASK: [YOUR_TASK_HERE]

---

Auto-execute per SOP:

1. ✓ Load & analyze docs
2. ✓ Check compliance
3. ✓ Fix gaps
4. ✓ Execute task
5. ✓ Provide test steps
6. ✓ Handle errors

Waiting for your command... 🚀
💡 USAGE EXAMPLES:
Example 1: Start Development
ANDA:

Code
🔧 SIGAP MALUT - AUTO DEVELOPMENT
TASK: Develop modul SEK-KEP
SAYA: [Auto-execute all phases, generate full code, provide test steps]

Example 2: Fix Error
ANDA:

Code
🔧 SIGAP MALUT - AUTO DEVELOPMENT
TASK: Fix error:

TypeError: Cannot read property 'nama_lengkap' of undefined
at SEKKEPPage.jsx:45
SAYA: [Analyze, compare with docs, provide fix, explain]

Example 3: Quick Status
ANDA:

Code
🔧 SIGAP MALUT - AUTO DEVELOPMENT
TASK: Status
SAYA: [Compliance report only]

Example 4: Continue to Next
ANDA:

Code
✅ Semua test berhasil
TASK: Next
SAYA: [Auto-suggest next priority module, start development]

✅ READY TO USE!
Simpan prompt ini, lalu:

Copy prompt template di atas
Ganti [YOUR_TASK_HERE] dengan task Anda
Paste & send
Saya auto-execute everything!
🎯 FIRST COMMAND (After Demo):
Code
🔧 SIGAP MALUT - AUTO DEVELOPMENT

REFS: ✓ docs/01-kondisi-dinas-pangan.md
✓ docs/02-dokumentasi-sistem.md  
 ✓ master-data/\*.csv

TASK: Audit sistem saat ini

---

Generate full compliance report:

- Database vs docs
- API vs docs
- UI vs docs
- Identify all gaps
- Suggest priority fix order
  Send this after your presentation, and I'll give you complete roadmap!
