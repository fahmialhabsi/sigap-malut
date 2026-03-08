MODE: SYSTEM GENESIS BUILD
BAHASA: INDONESIA TEKNIS FORMAL
TARGET: SISTEM HIDUP BERBASIS BLUEPRINT
STACK: EXPRESS + SEQUELIZE + POSTGRESQL + REACT + VITE
ZERO ASSUMPTION POLICY
NO GENERIC OUTPUT
PRODUCTION-READY ONLY

==================================================
SUMBER WAJIB ANALISIS
==================================================

Dokumen yang WAJIB dibaca dan divalidasi:

01-kondisi-dinas-pangan.md
02-dokumentasi-sistem.md
03-dashboard-uiux.md
04-Dokumen Integrasi Sistem & Mapping Modul SIGAP-MALUT.md
05-Dashboard-Template-Standar.md
06-Master-Data-Layanan.md
07-Data-Dictionary.md
08-Workflow-Specification.md
09-Role-Module-Matrix.md
10-ERD-Logical-Model.md
11-KPI-Definition-Sheet.md
12-IT-Governance-SPBE-SPIP-Alignment.md
13-System-Architecture-Document.md

Jika ada konflik antar dokumen → WAJIB normalisasi.
Jika ada kekosongan → WAJIB lengkapi.

==================================================
TUJUAN ENGINE
==================================================

1. Mengukur konsistensi blueprint.
2. Menyatukan seluruh struktur layanan.
3. Menghasilkan arsitektur sistem final.
4. Menghasilkan skeleton backend & frontend.
5. Menghasilkan generator CRUD berbasis layanan.
6. Menghasilkan centralized RBAC.
7. Menghasilkan workflow engine dasar.
8. Menghasilkan auth system stabil.
9. Menghasilkan dashboard skeleton berbasis KPI.

==================================================
TAHAP 1 – BLUEPRINT CONSOLIDATION
==================================================

Sistem WAJIB:

- Validasi konsistensi:
  - Layanan ↔ Data Dictionary
  - Layanan ↔ Workflow
  - Layanan ↔ Role Matrix
  - Layanan ↔ KPI
  - Layanan ↔ Integrasi
- Validasi FK antar entitas.
- Validasi naming convention.
- Validasi tidak ada duplikasi entitas.

Jika ditemukan inkonsistensi →
Buat revisi dokumen FULL CONTENT dan pisahkan per file.

==================================================
TAHAP 2 – SERVICE REGISTRY GENERATOR
==================================================

Buat file:

/config/serviceRegistry.json

Isi harus memuat:

- kode_layanan
- nama_layanan
- bidang
- workflow
- roles
- SLA
- KPI reference

Semua modul sistem WAJIB membaca dari registry ini.

==================================================
TAHAP 3 – BACKEND SKELETON GENERATION
==================================================

Struktur folder wajib:

backend/
config/
models/
controllers/
services/
routes/
middleware/
utils/
generators/

WAJIB dibuat:

1. auth controller (login stabil JWT)
2. centralized RBAC middleware
3. roleModuleMapping.json
4. baseService.js (generic CRUD)
5. workflowEngine.js
6. auditLogger.js
7. errorHandler.js
8. rateLimiter.js

Jika belum ada → WAJIB tulis FULL file.
Pisahkan setiap file agar bisa copy–paste.

==================================================
TAHAP 4 – CRUD GENERATOR BERBASIS LAYANAN
==================================================

Buat file:

backend/generators/serviceCrudGenerator.js

Fungsi:

- Membaca serviceRegistry.json
- Membuat:
  - Model Sequelize
  - Controller
  - Service
  - Route
- Auto attach RBAC middleware
- Auto attach audit logger
- Auto attach workflow status field

Generator harus bisa dijalankan 1x untuk generate semua layanan.

==================================================
TAHAP 5 – WORKFLOW ENGINE
==================================================

File:

backend/services/workflowEngine.js

Fungsi:

- Validasi transisi status
- Validasi role sesuai workflow
- Log approval_log
- Update status otomatis

==================================================
TAHAP 6 – AUTH STABILIZATION
==================================================

WAJIB:

- JWT access token
- Refresh token
- Password hashing bcrypt
- Role-based claim di JWT
- Middleware protectRoute
- Middleware authorizeByPermission()

Tidak boleh ada:

if (role === "sekretaris")

Semua berbasis permission mapping.

==================================================
TAHAP 7 – FRONTEND SKELETON
==================================================

Struktur wajib:

frontend/
src/
pages/
components/
services/
hooks/
routes/
layouts/
utils/

WAJIB:

- AuthContext
- ProtectedRoute
- PermissionGuard
- Dynamic form generator berbasis data dictionary
- Dashboard skeleton berbasis KPI sheet
- API service terpusat

==================================================
TAHAP 8 – AUTO GAP DETECTION
==================================================

Jika sistem menemukan:

- Login belum stabil
- CRUD belum ada
- Workflow belum sinkron
- Role matrix tidak konsisten
- KPI belum bisa dihitung

WAJIB:

1. Buat file perbaikan FULL
2. Atau buat Generator Auto-Fix
3. Pisahkan file
4. Sebutkan folder dan nama file

==================================================
OUTPUT WAJIB
==================================================

A. Ringkasan Konsolidasi Blueprint
B. Daftar Konflik & Normalisasi
C. Revisi Dokumen (FULL PER FILE jika ada)
D. Struktur Final Arsitektur
E. Backend Skeleton Files
F. CRUD Generator File
G. Workflow Engine File
H. RBAC Mapping File
I. Frontend Skeleton
J. Status Sistem:

- BELUM HIDUP
- STABIL MINIMUM
- SIAP PENGEMBANGAN LANJUT

==================================================
TARGET AKHIR FASE INI
==================================================

✔ Login berjalan stabil
✔ Semua layanan bisa digenerate CRUD
✔ Workflow aktif
✔ RBAC terpusat
✔ Dashboard minimal hidup
✔ Blueprint konsisten
✔ Siap naik ke Compliance Hardening
