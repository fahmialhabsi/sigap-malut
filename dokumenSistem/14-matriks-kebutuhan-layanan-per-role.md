---
judul: "Role-Based Service Requirements & Access Matrix"
versi: "2.0"
tanggal: "20 Maret 2026"
penyusun: "Sekretaris Dinas Pangan Provinsi Maluku Utara"
status: "Production Standard"
evidence: true
---

# 14 - Role-Based Service Requirements & Compliance Matrix

**Dokumen Standar Akses, Layanan, dan Persyaratan untuk Setiap Role dalam SIGAP Malut**

---

## PENDAHULUAN

Dokumen ini mendefinisikan standar layanan, akses kontrol, requirement fungsional, dan hal yang **wajib diperbaiki** untuk setiap role/aktor dalam sistem SIGAP Malut:

1. **Super Admin**
2. **Kepala Dinas / Gubernur**
3. **Sekretariat**
4. **Bidang Ketersediaan Pangan**
5. **Bidang Distribusi Pangan**
6. **Bidang Konsumsi & Keamanan Pangan**
7. **UPTD Balai Pengawasan Mutu Pangan**
8. **Masyarakat / Peneliti / Publik (Portal Terbuka)**

Setiap role memiliki:

- ✅ **Hal yang Sudah Sesuai** (compliance pass)
- 🟨 **Hal yang Perlu Dikonfirmasi** (partial implementation)
- ❌ **Hal yang Harus Diperbaiki** (blocking issue)
- 📋 **Standar Persyaratan & Dashboard Template**

---

---

## 1. ROLE: SUPER ADMIN

### 1.1 Deskripsi & Tanggung Jawab

| Item                | Deskripsi                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| **Nama Role**       | Super Admin / Administrator Sistem                                                                 |
| **Unit Kerja**      | IT/System Center (lingkup seluruh Dinas)                                                           |
| **Wewenang Utama**  | Manage users, roles, permissions, system settings, master data, audit trail, compliance monitoring |
| **Dashboard Utama** | Admin Dashboard (System Control Center)                                                            |
| **Akses Data**      | ALL (semua modul, semua bidang, semua unit) dengan audit tracking                                  |

### 1.2 Modul & Layanan yang Dapat Diakses

| Modul                      | Create | Read | Update | Delete | Approve | Finalize | Keterangan                                            |
| -------------------------- | ------ | ---- | ------ | ------ | ------- | -------- | ----------------------------------------------------- |
| **User & Role Management** | ✅     | ✅   | ✅     | ✅     | —       | —        | Kelola user, role, permission                         |
| **System Configuration**   | ✅     | ✅   | ✅     | ✅     | —       | —        | Setting sistem, environment, database                 |
| **Master Data (Semua)**    | ✅     | ✅   | ✅     | ✅     | ✅      | ✅       | Kelola data master (pegawai, komoditas, bidang, dst.) |
| **Audit Log & Compliance** | —      | ✅   | —      | —      | —       | —        | Akses read-only, tidak boleh edit/delete              |
| **Backup & Recovery**      | ✅     | ✅   | —      | —      | —       | ✅       | Kelola backup system                                  |
| **API Key & Integration**  | ✅     | ✅   | ✅     | ✅     | —       | ✅       | Manage API credentials untuk integrasi eksternal      |
| **Dashboard Monitoring**   | —      | ✅   | ✅     | —      | —       | —        | Monitor system health, performance, alerts            |
| **Module Generator**       | ✅     | ✅   | ✅     | ✅     | —       | ✅       | Generate modul baru dynamically                       |
| **Data Import/Export**     | ✅     | ✅   | —      | —      | —       | ✅       | CSV bulk import, data export                          |

### 1.3 Dashboard Requirements (Super Admin)

**MustHave Components:**

- System Control Panel (CPU, memory, disk usage real-time)
- User Activity Log (login, akses modul, aksi CRUD per user)
- Audit Trail Dashboard (all actions, approval chain tracking)
- System Alerts (failed jobs, overdue approvals, data anomalies >5% variance)
- Master Data Integrity Monitor (referential integrity checks, orphan records detection)
- API Health Status (response time, error rate, rate limit usage)
- Database Backup Status (last backup time, size, retention)
- Compliance Scorecard (audit readiness, SPBE alignment %)

**Data Freshness:** Real-time (Web Socket) untuk alerts; 5-minute refresh untuk aggregate metrics

**Export Requirements:** PDF (System Report), Excel (Audit Trail), JSON (API responses)

### 1.4 Akses Kontrol & Keamanan

| Kontrol                     | Implementasi                                                 | Status                                                   |
| --------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| **Authentication**          | JWT token (7 hari expiry)                                    | ✅ Sudah                                                 |
| **Authorization**           | Role-based access control (RBAC)                             | ✅ Sudah                                                 |
| **MFA (Multi-Factor Auth)** | 2FA via SMS/email                                            | ❌ **WAJIB DIPERBAIKI**                                  |
| **IP Whitelisting**         | Pembatasan akses dari IP tertentu (kantor)                   | 🟨 Partial (ada tapi tidak enforced)                     |
| **Session Timeout**         | Auto-logout jika idle > 15 menit                             | ❌ **WAJIB DIPERBAIKI**                                  |
| **Data Encryption**         | All sensitive data: password hash + salt, encryption at rest | ⚠️ Password hash ada, encryption at rest belum           |
| **Audit Logging**           | Semua aksi tercatat (who, what, when, where, why)            | ✅ Sudah                                                 |
| **API Rate Limit**          | Max 1000 req/hour per user                                   | 🟨 Partial (limit ada, tidak enforced di semua endpoint) |

### 1.5 Data & Functional Requirements

**Modul Master Data yang WAJIB ada:**

- ✅ Master Pegawai (NIP, nama, jabatan, unit, role)
- ✅ Master Komoditas (nama, jenis, satuan, harga standar)
- ✅ Master Bidang/Unit (struktur organisasi)
- ✅ Master Role (role definition, permission mapping)
- ✅ Master Layanan (51 layanan Menpan RB per dokumen)
- ✅ Master KPI (definisi KPI per layanan)

**Workflow Requirement:**

- ✅ Approval workflow untuk perubahan master data (create/update/delete)
- ✅ Audit trail untuk setiap operasi

### 1.6 Hal yang Sudah Sesuai ✅

1. ✅ Backend auth middleware (`protect`) bekerja
2. ✅ RBAC guard di route level (enforce role checks)
3. ✅ Audit logging untuk CRUD operations
4. ✅ User management API endpoints ada
5. ✅ Master data seeder terintegrasi
6. ✅ OpenAPI spec (partial) untuk dokumentasi

### 1.7 Hal yang Perlu Diperbaiki ❌

| No  | Issue                             | Severity | Root Cause                                             | Solution                                                           | Timeline |
| --- | --------------------------------- | -------- | ------------------------------------------------------ | ------------------------------------------------------------------ | -------- |
| 1   | MFA tidak implemented             | KRITIS   | Not in scope fase-1                                    | Implement 2FA via SMS/email, store recovery codes                  | Week 5-6 |
| 2   | Session timeout tidak enforced    | KRITIS   | Frontend tidak handle token expiry                     | Add session tracker, auto-logout, show warning 2 min before expiry | Week 2-3 |
| 3   | IP whitelisting tidak enforced    | TINGGI   | Middleware ada tapi tidak di-apply                     | Check req.ip, enforce whitelist di auth middleware                 | Week 3-4 |
| 4   | API rate limiting partial         | TINGGI   | Middleware ada tapi skip beberapa endpoint             | Apply rate limiter ke semua public API endpoints                   | Week 3   |
| 5   | User audit trail incomplete       | SEDANG   | Beberapa action tidak log (login attempt, failed auth) | Add logAudit untuk login/logout/failed attempts                    | Week 2   |
| 6   | Master data export format limited | SEDANG   | Hanya CSV, perlu PDF rekapitulasi                      | Add PDF export via pdf-lib atau similar                            | Week 4   |
| 7   | System health dashboard missing   | SEDANG   | Tidak ada dashboard PM/monitoring                      | Build admin dashboard dengan real-time metrics                     | Week 5-7 |

---

---

## 2. ROLE: KEPALA DINAS / GUBERNUR

### 2.1 Deskripsi & Tanggung Jawab

| Item                | Deskripsi                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **Nama Role**       | Kepala Dinas Pangan / Gubernur Maluku Utara (Executive)                                                   |
| **Unit Kerja**      | Kantor Dinas Pangan (Kepala)                                                                              |
| **Wewenang Utama**  | Approve policy decisions, finalize strategic docs, sign off compliance, view KPI/SLA, executive reporting |
| **Dashboard Utama** | Executive Dashboard (KPI, Compliance, Strategic Overview)                                                 |
| **Akses Data**      | All modul (read-heavy), approve certain workflows, view audit trail aggregate                             |

### 2.2 Modul & Layanan yang Dapat Diakses

| Modul                         | Create | Read | Update | Delete | Approve | Finalize | Keterangan                                        |
| ----------------------------- | ------ | ---- | ------ | ------ | ------- | -------- | ------------------------------------------------- |
| **Semua Modul Sekretariat**   | —      | ✅   | —      | —      | ✅      | ✅       | Read-only+ approve/finalize                       |
| **Semua Bidang (KT, DS, KS)** | —      | ✅   | —      | —      | ✅      | ✅       | Read-only+ approve/finalize strategis             |
| **UPTD Reports**              | —      | ✅   | —      | —      | —       | —        | Lihat hasil lab, monitoring UPTD                  |
| **KPI & Dashboard**           | —      | ✅   | ✅     | —      | —       | —        | Edit dashboard layout, target KPI                 |
| **Laporan & Analytics**       | —      | ✅   | —      | —      | —       | —        | Export laporan, custom analytics                  |
| **Compliance Monitoring**     | —      | ✅   | —      | —      | —       | ✅       | Lihat audit readiness, sign off compliance        |
| **Approval Chain**            | —      | ✅   | —      | —      | ✅      | —        | Review pending approvals (role: Approver level-3) |

### 2.3 Dashboard Requirements (Kepala Dinas / Gubernur)

**MustHave Components:**

- **Executive Summary** (KPI hero tiles: Compliance %, SLA achievement, Cost efficiency, Staffing status)
- **Service SLA Dashboard** (per layanan: on-time %, backlog status, trend)
- **Compliance Scorecard** (SPBE alignment, audit readiness, risk score)
- **Approval Inbox** (pending approvals awaiting signature, deadline alerts)
- **Monthly KPI Report** (trending, vs. target, drill-down to bidang/uptd)
- **Budget Tracking** (realisasi vs. DPA, spending rate per bidang)
- **Strategic Initiatives Status** (program/project progress, milestone tracking)
- **Risk & Anomaly Alert** (data variance >10%, SLA breaches, compliance gaps)

**Data Freshness:** Daily refresh (overnight batch) for KPI; real-time for approvals inbox

**Export Requirements:** Executive Report (PDF), Monthly Briefing (PPTX with slides), Data Extract (Excel)

### 2.4 Akses Kontrol & Keamanan

| Kontrol                       | Implementasi                                                           | Status                                                  |
| ----------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| **Authentication**            | JWT token (7 hari) + optional PIN for high-stakes approval             | 🟨 JWT ada, PIN belum                                   |
| **Authorization**             | Can read ALL modul; approve selected workflow; finalize strategic docs | ✅ Sudah                                                |
| **Audit Logging**             | Semua aksi approve/finalize tercatat dengan timestamp, reason          | ✅ Sudah                                                |
| **Approval Workflow**         | Multi-level: Sekretaris → Kepala Dinas → Gubernur (jika needed)        | 🟨 Backend workflow ada, UI approval flow belum lengkap |
| **Dashboard Personalization** | Savekan dashboard layout preference                                    | ❌ **WAJIB DIPERBAIKI**                                 |

### 2.5 Data & Functional Requirements

**KPI Utama yang HARUS Real-time:**

- ✅ Service Turnaround Time (rata-rata)
- ✅ SLA Compliance % (on-time completion)
- ✅ Cost per Service (budget efficiency)
- ✅ Staffing Status (pegawai per bid dan, vacancy rate)
- ✅ Data Quality Score (integrity %, completeness %)
- ⚠️ Strategic Initiative Progress (belum ada tracking modul khusus)

**Dashboard Customization:**

- ⚠️ Pilih KPI mana saja yang ingin di-display
- ⚠️ Save preferred layout
- ⚠️ Set KPI targets annually

### 2.6 Hal yang Sudah Sesuai ✅

1. ✅ Kepala Dinas role defined di seeder
2. ✅ Dashboard sekretariat partially built (hero KPI ada)
3. ✅ Approval workflow logic di backend (approve endpoint)
4. ✅ Audit trail tracking untuk approvals
5. ✅ Read access to all modul melalui RBAC

### 2.7 Hal yang Perlu Diperbaiki ❌

| No  | Issue                                   | Severity | Root Cause                                 | Solution                                                                    | Timeline |
| --- | --------------------------------------- | -------- | ------------------------------------------ | --------------------------------------------------------------------------- | -------- |
| 1   | Dashboard layout tidak customizable     | TINGGI   | No persistence untuk user prefs            | Add dashboard_layout table, persist via API                                 | Week 4-5 |
| 2   | Historical KPI trend missing            | TINGGI   | No aggregate table untuk daily/monthly KPI | Create kpi_history table, backfill dengan existing data, daily job          | Week 3-4 |
| 3   | Compliance scorecard belum auto-compute | TINGGI   | Manual input saja                          | Build compliance_score trigger dari audit_log count, data validation result | Week 5   |
| 4   | Budget tracking tidak terintegrasi      | SEDANG   | Keuangan modul belum fully implemented     | Integrate finance API, join dengan DPA master data, compute realisasi %     | Week 6   |
| 5   | Risk/Anomaly alert tidak real-time      | SEDANG   | No alert engine untuk variance detection   | Build alert rule engine, check nightly, trigger notification via email/SMS  | Week 6-7 |
| 6   | Monthly report auto-generation missing  | SEDANG   | Manual export only                         | Build report generator (PDF/PPTX template), schedule monthly                | Week 7   |
| 7   | Strategic initiative tracking tidak ada | SEDANG   | Modul baru belum di-scope                  | Add program/project tracking modul (future phase)                           | Week 8+  |

---

---

## 3. ROLE: SEKRETARIAT

### 3.1 Deskripsi & Tanggung Jawab

| Item                | Deskripsi                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------- |
| **Nama Role**       | Sekretaris Dinas Pangan + Staf Sekretariat                                                   |
| **Unit Kerja**      | Sekretariat Dinas Pangan                                                                     |
| **Wewenang Utama**  | Manage pers umum, kepegawaian, keuangan, aset, rumah tangga, protokol, koordinasi, pelaporan |
| **Dashboard Utama** | Sekretariat Dashboard (12 modul, 51 layanan)                                                 |
| **Akses Data**      | All 12 Sekretariat modul; approve workflow sekretariat; read bidang reports                  |

### 3.2 Modul & Layanan yang Dapat Diakses

**12 Modul Sekretariat (343 fields, 51 layanan Menpan RB):**

| #         | Modul                          | Fields         | Layanan        | CRUD | Approve |
| --------- | ------------------------------ | -------------- | -------------- | ---- | ------- |
| 1         | Administrasi Umum & Persuratan | 21             | 6              | Y    | Y       |
| 2         | Kepegawaian                    | 34             | 8              | Y    | Y       |
| 3         | Keuangan & Anggaran            | 32             | 7              | Y    | Y       |
| 4         | Aset & BMD                     | 30             | 7              | Y    | Y       |
| 5         | Rumah Tangga & Umum            | 33             | 6              | Y    | Y       |
| 6         | Protokol & Kehumasan           | 28             | 5              | Y    | Y       |
| 7         | Perencanaan & Evaluasi         | 32             | 6              | Y    | Y       |
| 8         | Kebijakan & Koordinasi         | 22             | 2              | Y    | Y       |
| 9         | Laporan Ketersediaan           | 23             | 1              | —    | Y       |
| 10        | Laporan Distribusi             | 30             | 1              | —    | Y       |
| 11        | Laporan Konsumsi               | 30             | 1              | —    | Y       |
| 12        | Laporan UPTD                   | 28             | 1              | —    | Y       |
| **TOTAL** | **12 modul**                   | **343 fields** | **51 layanan** | —    | —       |

**Staf Sekretariat** (non-Sekretaris) access:

- Can Create/Read/Update (tidak Delete, tidak Approve, tidak Finalize)
- Role: Staf / Operator

### 3.3 Dashboard Requirements (Sekretariat)

**MustHave Components:**

- **Master List** (12 modul cards, link ke detail)
- **Active Tasks** (draft records needing action, approval pending, overdue)
- **KPI Section** (modul health: % complete, % on-time, % quality pass)
- **Approval Workflow** (pending approvals, approve/reject buttons)
- **RecentActivity** (audit trail of last 7 days CRUD actions on moduls)
- **Quick Stats** (total record per modul, % SLA achievement)
- **Laporan Agregasi** (consolidate reports dari 3 bidang + UPTD)

**Data Freshness:** Real-time untuk draft/active; 1-hour refresh untuk aggregates

**Export Requirements:** Full data export (Excel per modul), Consolidated Report (PDF)

### 3.4 Akses Kontrol & Keamanan

| Kontrol            | Implementasi                                         | Status                              |
| ------------------ | ---------------------------------------------------- | ----------------------------------- |
| **Authentication** | JWT token                                            | ✅ Sudah                            |
| **Authorization**  | UPTD Pilot Guard (unit_kerja="Sekretariat")          | ✅ Sudah                            |
| **Workflow Role**  | Can approve as Reviewer (role: REVIEWER)             | ✅ Sudah                            |
| **Audit Logging**  | All CRUD tercatat                                    | ✅ Sudah                            |
| **Data Masking**   | Tidak boleh lihat salary info (private to Bendahara) | 🟨 Partial (no masking implemented) |

### 3.5 Data & Functional Requirements

**Critical Workflow:**

- ✅ KGB (Kenaikan Gaji Berkala) tracking & approval
- ✅ SPJ (Surat Pertanggungjawaban) submission & verification
- ✅ Cuti (Leave) request & approval
- ✅ Aset disposition & approval

**Data Validation Rules:**

- ✅ Field validation (mandatory, format, range)
- ✅ Business logic (e.g., cuti tidak boleh > 30 hari/tahun)
- 🟨 Cross-modul validation (e.g., SPJ amount vs budget) — partial

### 3.6 Hal yang Sudah Sesuai ✅

1. ✅ 12 modul defined in master-data
2. ✅ 51 layanan mapped
3. ✅ 343 fields strukturisasi di FIELDS_SEKRETARIAT/\*.csv
4. ✅ Dashboard skeleton built (DashboardLayout.jsx)
5. ✅ UPTD Pilot Guard prevents non-sekretariat access
6. ✅ Approval workflow logic (draft → submitted → approved → finalized)
7. ✅ Audit logging untuk semua aksi

### 3.7 Hal yang Perlu Diperbaiki ❌

| No  | Issue                                                       | Severity | Root Cause                                       | Solution                                                                | Timeline |
| --- | ----------------------------------------------------------- | -------- | ------------------------------------------------ | ----------------------------------------------------------------------- | -------- |
| 1   | Dashboard tidak menampilkan 12 modul lengkap                | KRITIS   | DashboardLayout belum fully wired ke master-data | Map 12 modul ke UI cards, add module detail links                       | Week 2   |
| 2   | BaseTable fallback dummy data (bukan real Sekretariat data) | KRITIS   | API endpoint ada tapi BaseTable tidak fetch      | Bind BaseTable ke /api/sekretariat/\* endpoint, schema-driven rendering | Week 2-3 |
| 3   | Field mapping path mismatch (FIELDS_SEKRETARIAT/SEK-\*.csv) | TINGGI   | fieldMapping.js expect /FIELDS/FIELDS\_\*.csv    | Fix path construction, scan FIELDS_SEKRETARIAT folder                   | Week 2   |
| 4   | Cross-modul validation rules missing                        | TINGGI   | No SQL constraint/app logic                      | Define validation rules matrix, implement checks di controller          | Week 3-4 |
| 5   | Data masking untuk salary belum ada                         | TINGGI   | No role-based field visibility                   | Add field-level permission, hide salary dari non-Bendahara              | Week 3   |
| 6   | Approval workflow UI incomplete (no approve/reject buttons) | TINGGI   | DashboardLayout tidak show approval actions      | Add ActionBar component, wire approve/reject endpoints                  | Week 2-3 |
| 7   | KGB tracking SLA alerts missing                             | SEDANG   | No alert rule untuk KGB delay                    | Build SLA monitor, alert jika pending >2 bulan                          | Week 4-5 |
| 8   | Laporan agregasi 3 bidang tidak auto-generate               | SEDANG   | Manual export only                               | Build aggregation query, schedule monthly report job                    | Week 5-6 |

---

---

## 4. ROLE: BIDANG KETERSEDIAAN PANGAN

### 4.1 Deskripsi & Tanggung Jawab

| Item                | Deskripsi                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| **Nama Role**       | Kepala Bidang Ketersediaan + Staf                                                                  |
| **Unit Kerja**      | Bidang Ketersediaan Pangan                                                                         |
| **Wewenang Utama**  | Manage 26 layanan ketersediaan, monitor stok pangan, analisis kerawanan, fasilitasi dan intervensi |
| **Dashboard Utama** | Bidang Ketersediaan Dashboard (6 modul, 26 layanan)                                                |
| **Akses Data**      | 6 Bidang Ketersediaan modul; read Sekretariat reports; approve internal workflow                   |

### 4.2 Modul & Layanan yang Dapat Diakses

**6 Modul Bidang Ketersediaan (249 fields, 26 layanan Menpan RB):**

| #         | Modul                     | Fields         | Layanan        | CRUD | Approve |
| --------- | ------------------------- | -------------- | -------------- | ---- | ------- |
| 1         | Kebijakan & Analisis      | 36             | 5              | Y    | Y       |
| 2         | Pengendalian & Monitoring | 47             | 5              | Y    | Y       |
| 3         | Kerawanan Pangan          | 56             | 4              | Y    | Y       |
| 4         | Fasilitasi & Intervensi   | 30             | 1              | Y    | Y       |
| 5         | Bimbingan & Pendampingan  | 38             | 5              | Y    | Y       |
| 6         | Monitoring Evaluasi       | 42             | 6              | Y    | Y       |
| **TOTAL** | **6 modul**               | **249 fields** | **26 layanan** | —    | —       |

**Staf Bidang Ketersediaan:**

- Can Create/Read/Update (tidak Delete, tidak Approve/Finalize)

### 4.3 Dashboard Requirements (Bidang Ketersediaan)

**MustHave Components:**

- **Stok Monitoring Map** (visualisasi stok per kabupaten, color-coded alert)
- **Kerawanan Index** (real-time kerawanan score per wilayah, trend)
- **Intervention Status** (program/intervention tracking, target vs. realisasi)
- **Active Tasks** (modul yang ada draft/pending approval)
- **Quick Stats** (modul health, SLA %, quality score)
- **Trending Report** (kerawanan trend line, stok trend)
- **AlertList** (low stok alerts, kerawanan spike, missing data)

**Data Freshness:** Real-time untuk stok; daily untuk kerawanan index; 1-hour untuk aggregates

**Geographic Visualization:** Map dengan kabupaten (7 di Maluku Utara), color overlay untuk kerawanan

**Export Requirements:** Stok report (Excel), Kerawanan analysis (PDF), Intervention summary (PPTX)

### 4.4 Akses Kontrol & Keamanan

| Kontrol            | Implementasi                                     | Status                                       |
| ------------------ | ------------------------------------------------ | -------------------------------------------- |
| **Authentication** | JWT token                                        | ✅ Sudah                                     |
| **Authorization**  | unit_kerja = "Bidang Ketersediaan"               | 🟨 Pilot guard ada, belum enforce per bidang |
| **Data Scope**     | Hanya data Bidang Ketersediaan (filter di query) | 🟨 PARTIAL                                   |
| **Workflow Role**  | Can approve as Reviewer (bidang-level)           | 🟨 Backend logic ada, UI belum               |
| **Audit Logging**  | All CRUD tercatat                                | ✅ Sudah                                     |

### 4.5 Data & Functional Requirements

**Critical Data Sources:**

- ✅ Stok monitoring (real-time atau daily update dari UPTD)
- ✅ Kerawanan pangan data (survey-based atau statistical model)
- ⚠️ Geographic data (kabupaten/kecamatan boundaries) — not yet integrated
- ⚠️ Population & commodity price data — external integration needed

**Key Calculations:**

- ⚠️ Kerawanan index = f(stok, harga, demand, supply) — formula belum documented
- ⚠️ Intervention effectiveness = f(program cost, household reached, stok improvement) — belum ada metric

### 4.6 Hal yang Sudah Sesuai ✅

1. ✅ 6 modul defined
2. ✅ 26 layanan mapped
3. ✅ 249 fields strukturisasi (FIELDS_BIDANG_KETERSEDIAAN/\*.csv)
4. ✅ Backend model/controller untuk modul exist
5. ✅ Audit logging

### 4.7 Hal yang Perlu Diperbaiki ❌

| No  | Issue                                                                           | Severity | Root Cause                                   | Solution                                                             | Timeline |
| --- | ------------------------------------------------------------------------------- | -------- | -------------------------------------------- | -------------------------------------------------------------------- | -------- |
| 1   | Dashboard tidak terpasang (no route /module/:moduleId untuk modul Ketersediaan) | KRITIS   | Modul routing orphaned                       | Add /bidang/ketersediaan/:id route, wire to ModulePage               | Week 2-3 |
| 2   | Stok monitoring tidak real-time                                                 | KRITIS   | No integration dgn UPTD data feed            | Build UPTD-to-Bidang API sync, websocket untuk updates               | Week 4-5 |
| 3   | Kerawanan index formula tidak dokumentasi                                       | TINGGI   | Belum ada spesifikasi formula                | Define kerawanan formula, implement calculation query                | Week 3   |
| 4   | Geographic visualization (map) missing                                          | TINGGI   | No mapping library integrated                | Add leaflet/mapbox, kabupaten geojson data, color overlay            | Week 5-6 |
| 5   | Bidang-level data scope not enforced                                            | TINGGI   | Filter tidak otomatis di query               | Add WHERE bidang_id = auth.bidang_id di all queries                  | Week 2   |
| 6   | Intervention tracking modul belum di-scope                                      | SEDANG   | No tracking table untuk program/intervention | Add intervention_programs table, status tracking, target metrics     | Week 6-7 |
| 7   | Population & price data integration missing                                     | SEDANG   | External data source belum di-connect        | Define data partnership, build integration API, scheduler untuk sync | Week 7+  |

---

---

## 5. ROLE: BIDANG DISTRIBUSI PANGAN

### 5.1 Deskripsi & Tanggung Jawab

| Item                | Deskripsi                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Nama Role**       | Kepala Bidang Distribusi + Staf                                                                                |
| **Unit Kerja**      | Bidang Distribusi Pangan                                                                                       |
| **Wewenang Utama**  | Manage 30 layanan distribusi, monitor distribusi komoditas, pricing, CPPD coordination, bimbingan & monitoring |
| **Dashboard Utama** | Bidang Distribusi Dashboard (7 modul, 30 layanan)                                                              |
| **Akses Data**      | 7 Bidang Distribusi modul; read Sekretariat+Ketersediaan reports; approve internal workflow                    |

### 5.2 Modul & Layanan yang Dapat Diakses

**7 Modul Bidang Distribusi (316 fields, 30 layanan Menpan RB):**

| #         | Modul                    | Fields         | Layanan        | CRUD | Approve |
| --------- | ------------------------ | -------------- | -------------- | ---- | ------- |
| 1         | Kebijakan Distribusi     | 41             | 5              | Y    | Y       |
| 2         | Monitoring Distribusi    | 48             | 5              | Y    | Y       |
| 3         | Harga & Stabilisasi      | 56             | 5              | Y    | Y       |
| 4         | CPPD (Gerai Beras)       | 61             | 5              | Y    | Y       |
| 5         | Bimbingan & Pendampingan | 36             | 5              | Y    | Y       |
| 6         | Evaluasi & Monitoring    | 43             | 4              | Y    | Y       |
| 7         | Pelaporan Kinerja        | 31             | 1              | —    | Y       |
| **TOTAL** | **7 modul**              | **316 fields** | **30 layanan** | —    | —       |

### 5.3 Dashboard Requirements (Bidang Distribusi)

**MustHave Components:**

- **Distribusi Monitor** (realtime tracking distribusi ke kabupaten, status tiap shipment)
- **Harga Pangan** (current price vs standar, price trend, alert jika > threshold)
- **CPPD Status** (gerai operational status, stok level, sales trend)
- **Monitoring Effectiveness** (target vs realisasi distribusi, kabupaten kerjasama rate)
- **Active Tasks** (modul draft/pending, approval queue)
- **Quick Stats** (% on-time distribusi, price stability %, CPPD operational %)
- **Alert Panel** (low stok CPPD, price spike, tardy shipment)

**Geographic Visualization:** Map dengan distribusi route tracking

**Data Freshness:** Near real-time untuk distribusi status; daily untuk harga; 1-hour untuk aggregates

**Export Requirements:** Distribution report (Excel), Price analysis (PDF), Performance summary (PPTX)

### 5.4 Akses Kontrol & Keamanan

| Kontrol            | Implementasi                                                        | Status                                           |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------ |
| **Authentication** | JWT token                                                           | ✅ Sudah                                         |
| **Authorization**  | unit_kerja = "Bidang Distribusi"                                    | 🟨 Pilot guard ada, tidak per-bidang enforcement |
| **Data Scope**     | Hanya data Bidang Distribusi                                        | 🟨 PARTIAL                                       |
| **Real-time Sync** | Distribusi status sync dari field partners (truck GPS, stok sensor) | ❌ MISSING                                       |
| **Workflow Role**  | Can approve as Reviewer                                             | 🟨 Backend ada, UI belum                         |
| **Audit Logging**  | All CRUD tercatat                                                   | ✅ Sudah                                         |

### 5.5 Data & Functional Requirements

**Critical Data Sources:**

- ⚠️ Truck/shipment tracking (GPS real-time)
- ⚠️ Harga komoditas (daily market price data)
- ⚠️ CPPD stok & sales (point-of-sale system integration)
- ⚠️ Kabupaten readiness/kerjasama data

**Key Calculations:**

- ⚠️ Distribusi effectiveness = (actual ton / target ton) % per periode
- ⚠️ Price stability index = volatility of price last 30 days
- ⚠️ CPPD performance = f(sales, stok turnover, customer satisfaction)

### 5.6 Hal yang Sudah Sesuai ✅

1. ✅ 7 modul defined
2. ✅ 30 layanan mapped
3. ✅ 316 fields strukturisasi
4. ✅ Backend model/controller exist
5. ✅ Audit logging

### 5.7 Hal yang Perlu Diperbaiki ❌

| No  | Issue                                     | Severity | Root Cause                                     | Solution                                                         | Timeline |
| --- | ----------------------------------------- | -------- | ---------------------------------------------- | ---------------------------------------------------------------- | -------- |
| 1   | Dashboard routing orphaned                | KRITIS   | No /bidang/distribusi/:id route                | Add route, wire to ModulePage                                    | Week 2-3 |
| 2   | Real-time shipment tracking missing       | KRITIS   | No GPS/IoT integration                         | Define data partner (fleet mgmt system), build sync API          | Week 5-7 |
| 3   | Daily harga feed belum otomatis           | TINGGI   | Manual input atau integr eksternal belum jelas | Define price data source (market, stat center), build import job | Week 4-5 |
| 4   | CPPD system integration missing           | TINGGI   | CPPD (gerai) punya POS sendiri, sync belum ada | Define CPPD data contract, build API connector, test sync        | Week 6-7 |
| 5   | Geographic route visualization missing    | TINGGI   | Map belum ada                                  | Add map visualization, route optimization library                | Week 5-6 |
| 6   | Distribution effectiveness metric unclear | SEDANG   | Formula belum dokumentasi                      | Define KPI formula, implement calculated field                   | Week 3   |
| 7   | Price stability formula belum implement   | SEDANG   | Statistical calculation belum ada              | Add price history table, compute volatility nightly              | Week 4   |

---

---

## 6. ROLE: BIDANG KONSUMSI & KEAMANAN PANGAN

### 6.1 Deskripsi & Tanggung Jawab

| Item                | Deskripsi                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Nama Role**       | Kepala Bidang Konsumsi & Keamanan Pangan + Staf                                                                    |
| **Unit Kerja**      | Bidang Konsumsi & Keamanan Pangan                                                                                  |
| **Wewenang Utama**  | Manage 28 layanan konsumsi, survei konsumsi pangan, edukasi masyarakat, keamanan pangan monitoring, pemenuhan gizi |
| **Dashboard Utama** | Bidang Konsumsi Dashboard (6 modul, 28 layanan)                                                                    |
| **Akses Data**      | 6 Bidang Konsumsi modul; read Sekretariat+Ketersediaan+Distribusi reports; approve internal workflow               |

### 6.2 Modul & Layanan yang Dapat Diakses

**6 Modul Bidang Konsumsi (estimasi 280+ fields, 28 layanan Menpan RB):**

| #         | Modul                         | Estimasi Fields | Layanan        | CRUD | Approve |
| --------- | ----------------------------- | --------------- | -------------- | ---- | ------- |
| 1         | Kebijakan & Edukasi Konsumsi  | ~40             | 5              | Y    | Y       |
| 2         | Survei Konsumsi & Gizi        | ~50             | 5              | Y    | Y       |
| 3         | Keamanan Pangan & Kontaminasi | ~45             | 5              | Y    | Y       |
| 4         | Advokasi & Kampanye           | ~35             | 4              | Y    | Y       |
| 5         | Monitoring Keaslian & Halal   | ~42             | 4              | Y    | Y       |
| 6         | Evaluasi & Dampak             | ~38             | 5              | Y    | Y       |
| **TOTAL** | **6 modul**                   | **250 fields**  | **28 layanan** | —    | —       |

### 6.3 Dashboard Requirements (Bidang Konsumsi)

**MustHave Components:**

- **Konsumsi Score** (gizi adequacy rate per wilayah, trend)
- **Keamanan Pangan Index** (incident rate, compliance %, hazard level)
- **Education Campaign Status** (program running, target audience reached, engagement %)
- **Survei Results** (nutrisi status, konsumsi pattern, satisfaction score)
- **Active Tasks** (modul draft, pending approval, overdue actions)
- **Alert Panel** (malnutrition hotspot, food safety incident, outbreak risk)
- **Trend Analysis** (konsumsi pattern shift, seasonal variation)

**Data Freshness:** Survey results = quarterly; monitoring = 1-hour; incidents = real-time

**Export Requirements:** Konsumsi report (PDF), Keamanan pangan analysis (Excel), Campaign summary (PPTX)

### 6.4 Akses Kontrol & Keamanan

| Kontrol                | Implementasi                                     | Status                            |
| ---------------------- | ------------------------------------------------ | --------------------------------- |
| **Authentication**     | JWT token                                        | ✅ Sudah                          |
| **Authorization**      | unit_kerja = "Bidang Konsumsi"                   | 🟨 Partial                        |
| **Data Scope**         | Bidang Konsumsi data only                        | 🟨 PARTIAL                        |
| **Survey Sensitivity** | Personal health data → privacy policy compliance | ❌ MISSING (GDPR-like protection) |
| **Workflow Role**      | Can approve as Reviewer                          | 🟨 Backend ada, UI belum          |
| **Audit Logging**      | All CRUD tercatat                                | ✅ Sudah                          |

### 6.5 Data & Functional Requirements

**Critical Data Attributes:**

- ⚠️ Demographics (household, family size, age, health status)
- ⚠️ Konsumsi pola (daily food intake, macronutrient, micronutrient level)
- ⚠️ Keamanan pangan incident (hazard type, location, severity, remedy)
- ⚠️ Halal/authenticity certification status

**Privacy Requirement (CRITICAL):**

- Data must be immediately anonymized after survey (remove nama, alamat detail)
- Personal identifiable info encrypted at rest
- Only aggregated/statistical data shown in dashboard

### 6.6 Hal yang Sudah Sesuai ✅

1. ✅ Modul struktur (belum lengkap, tapi scope ada)
2. ✅ Backend model framework (partial)
3. ✅ Audit logging infrastructure

### 6.7 Hal yang Perlu Diperbaiki ❌

| No  | Issue                                               | Severity | Root Cause                                                                | Solution                                                                     | Timeline |
| --- | --------------------------------------------------- | -------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------- |
| 1   | Dashboard tidak ada (modul belum fully implemented) | KRITIS   | Bidang Konsumsi phase-2 modul                                             | Build dashboard layout, wire to modul endpoints                              | Phase-2  |
| 2   | Data privacy/GDPR compliance missing                | KRITIS   | No encryption, no anonymization logic                                     | Implement field-level encryption, anonymization on import, privacy audit     | Week 6-8 |
| 3   | Survey data model underspecified                    | TINGGI   | Belum clear apa yang dicatat (dietary 24hr recall vs FFQ vs simple count) | Define survey methodology, data schema, validation rules                     | Week 3-4 |
| 4   | Konsumsi & gizi scoring formula undocumented        | TINGGI   | Belum ada algoritma                                                       | Define nutrition adequacy metric (e.g., FAO standard), implement calculation | Week 4-5 |
| 5   | Keamanan pangan incident tracking belum ada         | TINGGI   | No incident modul/table                                                   | Build incident report form, tracking, categorization, alert rules            | Week 5-6 |
| 6   | Halal certification integration missing             | SEDANG   | Belum ada data source                                                     | Define halal cert authority data, build lookup/import                        | Week 5-6 |
| 7   | Campaign tracking & engagement metric missing       | SEDANG   | No campaign modul                                                         | Add campaign master, participant tracking, engagement scoring                | Phase-2  |

---

---

## 7. ROLE: UPTD BALAI PENGAWASAN MUTU PANGAN

### 7.1 Deskripsi & Tanggung Jawab

| Item                | Deskripsi                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------- |
| **Nama Role**       | Kepala UPTD Balai / Staf Laboratorium                                                    |
| **Unit Kerja**      | Unit Pelaksana Teknis Dinas Balai Pengawasan Mutu Pangan                                 |
| **Wewenang Utama**  | Manage lab testing, quality certification, hasil uji, sertifikat GMP/GFP, audit internal |
| **Dashboard Utama** | UPTD Dashboard (7 modul, 41 layanan)                                                     |
| **Akses Data**      | 7 UPTD modul; read Sekretariat reports; submit hasil ke bidang lain                      |

### 7.2 Modul & Layanan yang Dapat Diakses

**7 Modul UPTD (282 fields, 41 layanan Menpan RB):**

| #         | Modul                  | Fields         | Layanan        | CRUD | Approve |
| --------- | ---------------------- | -------------- | -------------- | ---- | ------- |
| 1         | Administrasi Lab       | ~35            | 4              | Y    | Y       |
| 2         | Aset & Peralatan Lab   | ~28            | 3              | Y    | Y       |
| 3         | Inspeksi & Sampling    | ~42            | 6              | Y    | Y       |
| 4         | Pengujian & Analisis   | ~48            | 7              | Y    | Y       |
| 5         | Sertifikasi GMP/GFP    | ~38            | 5              | Y    | Y       |
| 6         | Audit Mutu             | ~38            | 8              | Y    | Y       |
| 7         | Pelaporan & Monitoring | ~35            | 8              | Y    | Y       |
| **TOTAL** | **7 modul**            | **282 fields** | **41 layanan** | —    | —       |

### 7.3 Dashboard Requirements (UPTD)

**MustHave Components:**

- **Workload Monitor** (sample queue, testing in-progress count, completion %)
- **Test Result Summary** (pass rate %, fail rate %, trend)
- **Certification Status** (GMP cert count, expiry date tracking, alert jika mendekati expiry)
- **Lab Equipment Status** (calibration status, maintenance schedule, downtime alert)
- **Active Tasks** (sample intake, test assignment, result publish, approval queue)
- **KPI Tiles** (turnaround time, accuracy %, audit pass rate)
- **Audit Trail** (setiap test, setiap result, setiap approval tercatat)

**Data Freshness:** Real-time untuk sample queue; 1-hour untuk KPI aggregates; daily untuk trend

**Export Requirements:** Test report (PDF per sample), Monthly performance (Excel), Certification list (PDF)

### 7.4 Akses Kontrol & Keamanan

| Kontrol                     | Implementasi                                            | Status                              |
| --------------------------- | ------------------------------------------------------- | ----------------------------------- |
| **Authentication**          | JWT token                                               | ✅ Sudah                            |
| **Authorization**           | unit_kerja = "UPTD"; kepala_uptd can approve            | ✅ Sudah (UPTD Pilot Guard)         |
| **Data Scope**              | Only UPTD data (filter by unit_kerja)                   | ✅ Sudah                            |
| **Workflow Role**           | kepala_uptd: full approval; staf: submit only           | ✅ Sudah                            |
| **Test Result Sensitivity** | Hasil uji bisa sensitive → access control per cert type | 🟨 PARTIAL (no field-level control) |
| **Audit Logging**           | All test, result, approval tercatat                     | ✅ Sudah                            |

### 7.5 Data & Functional Requirements

**Critical Workflow:**

- ✅ Sample intake (tracking, labeling, chain of custody)
- ✅ Test assignment (assign ke teknisi, track progress)
- ✅ Result recording (lab parameter, test method, hasil numerik)
- ✅ Result approval (verifikasi, sign-off oleh supervisor)
- ✅ Certification (auto-generate cert doc jika pass)
- ✅ Monitoring (trend analisis hasil test per komoditas/supplier)

**Data Quality Rules:**

- ✅ Hasil uji wajib ada evidence (procedure doc, calibration cert, control sample result)
- ✅ Chain of custody lengkap (intake → storage → test → result)
- 🟨 SOP compliance check (test SOP vs actual procedure log) — partial

### 7.6 Hal yang Sudah Sesuai ✅

1. ✅ 7 modul UPTD defined
2. ✅ 41 layanan mapped
3. ✅ 282 fields strukturisasi (FIELDS_UPTD/\*.csv)
4. ✅ Backend model/controller untuk UPTD exist (UPT-\*.js)
5. ✅ UPTD Pilot Guard enforce unit_kerja filtering
6. ✅ Workflow approval logic untuk UPTD (approve/reject)
7. ✅ Audit logging untuk semua UPTD aksi
8. ✅ Master-data CSV sync verified (SHA-256)

### 7.7 Hal yang Perlu Diperbaiki ❌

| No  | Issue                                                           | Severity | Root Cause                                                                  | Solution                                                           | Timeline |
| --- | --------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------- |
| 1   | Dashboard sidebar route orphaned (/uptd/:id not in router)      | KRITIS   | App.jsx not have /uptd/:id route                                            | Add route to App.jsx, wire to ModulePage                           | Week 1-2 |
| 2   | Frontend endpoint mismatch (/sertifikasi_prima vs /api/upt-tkn) | KRITIS   | M068-M080 pages call semantic endpoint, backend has /api/upt-\*             | Consolidate taxonomy OR build adapter layer, test end-to-end       | Week 2-3 |
| 3   | BaseTable fallback dummy data (not real UPTD test result)       | KRITIS   | API exists but UI fetch dummy fallback                                      | Rewrite BaseTable to real API fetch, schema-driven from CSV        | Week 2-3 |
| 4   | Profile endpoint mismatch (/auth/profile vs /api/auth/me)       | KRITIS   | DashboardUPTDLayout call wrong endpoint                                     | Change to /api/auth/me, test in browser                            | Week 1   |
| 5   | Role routing missing (kepala_uptd → /dashboard/uptd not in map) | KRITIS   | authController.js missing kepala_uptd entry                                 | Add KEPALA_UPTD: "/dashboard/uptd" to roleToDashboard              | Week 1   |
| 6   | Master-data layanan count internal mismatch                     | TINGGI   | UPT-ADM 9 vs mapping 10, UPT-AST 6 vs 5, etc. (4 modul)                     | Recount & reconcile mapping CSV counts                             | Week 1   |
| 7   | Field mapping path convention (FIELDS_UPTD/ vs FIELDS/)         | TINGGI   | fieldMapping.js look for /FIELDS/FIELDS\__.csv, actual in FIELDS_UPTD/_.csv | Fix path construction or reorganize files                          | Week 2   |
| 8   | OpenAPI spec tidak cover UPTD endpoint                          | TINGGI   | openapi.yaml only have /api/dashboard/sekretaris/summary                    | Add 7 UPTD endpoint schemas, request/response spec                 | Week 3-4 |
| 9   | Chain of custody tracking belum implemented                     | SEDANG   | No tracking table untuk sample movement                                     | Add tracking_log table, record every movement, validation          | Week 4-5 |
| 10  | Certification auto-generation missing                           | SEDANG   | Manual cert creation, belum otomatis generate doc                           | Build cert template (PDF), auto-generate on pass result            | Week 5-6 |
| 11  | SOP compliance check missing                                    | SEDANG   | No validation rule untuk procedure adherence                                | Define SOP checklist, implement validation form, track             | Week 5-6 |
| 12  | Equipment maintenance schedule not tracked                      | SEDANG   | Belum ada modul untuk maintenance                                           | Add equipment_maintenance table, schedule tracking, alert jika due | Week 4-5 |

---

---

## 8. ROLE: MASYARAKAT / PENELITI / PUBLIK

### 8.1 Deskripsi & Tanggung Jawab

| Item                | Deskripsi                                                                     |
| ------------------- | ----------------------------------------------------------------------------- |
| **Nama Role**       | Public / Masyarakat / Peneliti / NGO                                          |
| **Unit Kerja**      | External (tidak ada unit internal)                                            |
| **Wewenang Utama**  | Browse open data, access public portal, download dataset, view public reports |
| **Dashboard Utama** | Public Data Portal / OpenData Dashboard                                       |
| **Akses Data**      | Published/public dataset only; no Create/Update/Delete; anonymized data       |

### 8.2 Modul & Data yang Dapat Diakses

**Public-Facing Services:**

| Layanan                     | Data                                                         | Upd Freq  | Format                 |
| --------------------------- | ------------------------------------------------------------ | --------- | ---------------------- |
| **Stok Pangan & Kerawanan** | Stok komoditas, kerawanan index per kabupaten                | Daily     | CSV, JSON, API         |
| **Harga Pangan**            | Historical prices, current price vs standar                  | Daily     | CSV, Excel, API        |
| **Distribusi Monitoring**   | Distribusi volume per kabupaten, trend                       | Weekly    | CSV, visulization      |
| **Konsumsi & Gizi**         | Aggregated gizi status, konsumsi pattern (anonymized)        | Quarterly | PDF report, API        |
| **Keamanan Pangan**         | Food safety incident alert, pass rate, trend                 | Monthly   | JSON feed, email alert |
| **UPTD Test Result**        | Public komoditas test result (pass/fail aggregate per month) | Monthly   | CSV, public report     |
| **Kebijakan & Regulasi**    | Download regulation docs, SK, policy brief                   | On-update | PDF, searchable        |

### 8.3 Portal Requirements (Public Facing)

**MustHave Components:**

- **Data Search** (filter by komoditas, date range, kabupaten, test result)
- **API Documentation** (OpenAPI spec, Swagger UI, code examples)
- **Download Center** (bulk export CSV/Excel, historical archive)
- **Data Visualization** (chart, map, trend line)
- **Feedback** (survey, suggestion, data request form → route to admin)
- **FAQ & Documentation** (how to interpret data, methodology, license)
- **Alert Subscription** (email/SMS subscription untuk harga spike, kerawanan alert)
- **Privacy Policy & Terms** (data usage, anonymization practice)

**Data Freshness:** Public data lag-1 day behind operational system (privacy quarantine)

**API Rate Limit:** 100 req/hour per IP (public), 1000 req/hour per user dengan API key

**Export Formats:** CSV, Excel, JSON, PDF, XML (untuk integrasi 3rd party)

### 8.4 Akses Kontrol & Keamanan

| Kontrol                | Implementasi                                                    | Status                              |
| ---------------------- | --------------------------------------------------------------- | ----------------------------------- |
| **Authentication**     | No auth required (public); optional login untuk preference save | ❌ MISSING                          |
| **Authorization**      | Public data only; no sensitive info                             | 🟨 PARTIAL (no data classification) |
| **API Key**            | Optional untuk power user, rate-limited                         | ❌ MISSING                          |
| **Data Anonymization** | Personal health data anonymized immediately                     | ❌ MISSING (GDPR compliance)        |
| **HTTPS/TLS**          | All API calls encrypted                                         | ✅ Assume production setup          |
| **CORS Policy**        | Strict CORS untuk JS clients                                    | 🟨 PARTIAL                          |
| **Audit Logging**      | Log public API calls (not user-specific)                        | ❌ MISSING                          |

### 8.5 Data & Functional Requirements

**Public Data Gateway:**

- ✅ Data catalog (searchable list of available datasets)
- ⚠️ Aggregated statistics (no individual but summary per region)
- ⚠️ Historical archive (monthly snapshots)
- 🟨 Real-time feed (some data updated real-time, some batch)

**Data Classification (MUST IMPLEMENT):**

- **Level 1 - Open**: Stok, harga, distribusi aggregate, public incident → public portal
- **Level 2 - Restricted**: Test result detail per supplier (only to government) → API dgn auth
- **Level 3 - Confidential**: Personal health data, incident root cause → internal only

### 8.6 Hal yang Sudah Sesuai ✅

1. ✅ Public API endpoint structure (could be used)
2. ✅ OpenAPI spec framework (partial)

### 8.7 Hal yang Perlu Diperbaiki ❌

| No  | Issue                                                    | Severity | Root Cause                                     | Solution                                                         | Timeline            |
| --- | -------------------------------------------------------- | -------- | ---------------------------------------------- | ---------------------------------------------------------------- | ------------------- |
| 1   | Public portal tidak ada                                  | KRITIS   | belum dibangun                                 | Build landing page, data catalog, visualization, download center | Phase-2 (Week 8-12) |
| 2   | Data classification policy tidak ada                     | KRITIS   | No clear public vs restricted data boundary    | Define classification scheme, implement field-level masking      | Week 4-5            |
| 3   | API key management missing                               | TINGGI   | No userless API auth                           | Build API key generation/revocation, rate limiter per key        | Week 5-6            |
| 4   | Data anonymization pipeline missing                      | TINGGI   | No automatic PII removal                       | Build anonymization rule engine, run on export                   | Week 5-6            |
| 5   | Public API rate limiting missing                         | TINGGI   | Belum ada rate limit enforcement               | Implement rate limiter middleware                                | Week 4              |
| 6   | OpenAPI spec incomplete (not cover public data endpoint) | TINGGI   | Hanya punya partial spec                       | Extend spec untuk public API, publish via Swagger UI             | Week 4-5            |
| 7   | Feedback/data request form missing                       | SEDANG   | No way untuk publik request data               | Build feedback form, route to admin, track response              | Week 6-7            |
| 8   | Alert subscription service missing                       | SEDANG   | No email/SMS notification untuk price/incident | Build subscription manager, email/SMS service integration        | Week 7-8            |
| 9   | Data visualization library missing                       | SEDANG   | No chart/map rendering                         | Add chart library (Chart.js/D3), leaflet untuk map               | Week 6-7            |
| 10  | Historical archive & versioning missing                  | SEDANG   | No time-series data tracking                   | Build data versioning, archive storage, query historical         | Phase-2             |

---

---

## RINGKASAN COMPLIANCE MATRIX

### Per Role - Completion Status

| Role                    | Dashboard  | Auth       | CRUD Workflow | Master Data | Audit      | Compliance |
| ----------------------- | ---------- | ---------- | ------------- | ----------- | ---------- | ---------- |
| **Super Admin**         | 🟨 60%     | ✅ 90%     | ✅ 95%        | ✅ 95%      | ✅ 100%    | 🟨 70%     |
| **Kepala Dinas**        | 🟨 40%     | ✅ 85%     | ✅ 90%        | ✅ 95%      | ✅ 100%    | 🟨 60%     |
| **Sekretariat**         | 🟨 50%     | ✅ 90%     | ✅ 95%        | ✅ 90%      | ✅ 100%    | ✅ 85%     |
| **Bidang Ketersediaan** | ❌ 20%     | 🟨 70%     | 🟨 60%        | 🟨 70%      | ✅ 95%     | 🟨 40%     |
| **Bidang Distribusi**   | ❌ 15%     | 🟨 70%     | 🟨 50%        | 🟨 60%      | ✅ 95%     | 🟨 35%     |
| **Bidang Konsumsi**     | ❌ 10%     | 🟨 60%     | 🟨 40%        | 🟨 50%      | ✅ 90%     | 🟨 25%     |
| **UPTD**                | 🟨 50%     | ✅ 85%     | ✅ 90%        | ✅ 85%      | ✅ 100%    | ✅ 80%     |
| **Public Portal**       | ❌ 5%      | 🟨 30%     | ❌ 0%         | 🟨 40%      | 🟨 50%     | 🟨 20%     |
| **AVERAGE**             | **❌ 31%** | **✅ 78%** | **✅ 78%**    | **🟨 69%**  | **✅ 93%** | **🟨 62%** |

---

### Verifikasi Struktur Dokumentasi Semua Role (Wajib Dipatuhi)

| Role                               | Deskripsi & Tanggung Jawab | Modul & Layanan | Dashboard Requirements | Akses Kontrol & Keamanan | Data & Functional Requirements | Hal yang Sudah Sesuai | Hal yang Perlu Diperbaiki | Status Dokumentasi |
| ---------------------------------- | -------------------------- | --------------- | ---------------------- | ------------------------ | ------------------------------ | --------------------- | ------------------------- | ------------------ |
| **Super Admin**                    | ✅                         | ✅              | ✅                     | ✅                       | ✅                             | ✅                    | ✅                        | **Lengkap**        |
| **Kepala Dinas / Gubernur**        | ✅                         | ✅              | ✅                     | ✅                       | ✅                             | ✅                    | ✅                        | **Lengkap**        |
| **Sekretariat**                    | ✅                         | ✅              | ✅                     | ✅                       | ✅                             | ✅                    | ✅                        | **Lengkap**        |
| **Bidang Ketersediaan**            | ✅                         | ✅              | ✅                     | ✅                       | ✅                             | ✅                    | ✅                        | **Lengkap**        |
| **Bidang Distribusi**              | ✅                         | ✅              | ✅                     | ✅                       | ✅                             | ✅                    | ✅                        | **Lengkap**        |
| **Bidang Konsumsi**                | ✅                         | ✅              | ✅                     | ✅                       | ✅                             | ✅                    | ✅                        | **Lengkap**        |
| **UPTD**                           | ✅                         | ✅              | ✅                     | ✅                       | ✅                             | ✅                    | ✅                        | **Lengkap**        |
| **Masyarakat / Peneliti / Publik** | ✅                         | ✅              | ✅                     | ✅                       | ✅                             | ✅                    | ✅                        | **Lengkap**        |

Catatan: Seluruh role sudah memiliki struktur dokumentasi yang seragam dan dapat dijadikan acuan kepatuhan implementasi.

---

### Per Severity - Validated Issue Count (Single Source of Truth)

| Severity   | Total  |
| ---------- | ------ |
| **KRITIS** | **17** |
| **TINGGI** | **25** |
| **SEDANG** | **23** |
| **TOTAL**  | **65** |

Catatan validasi: total di atas dihitung langsung dari tabel issue per role dan dijadikan acuan tunggal untuk perencanaan eksekusi.

---

## PHASE-WISE REMEDIATION ROADMAP

### PHASE 1: CRITICAL (Week 1-4) — FIX BLOCKING ISSUES

**Focus:** Super Admin + UPTD + Sekretariat + partial Bidang routing

**Deliverables:**

- ✅ Fix 17 KRITIS issue
- ✅ UPTD dashboard fully functional (route, auth, real data)
- ✅ Sekretariat dashboard 70%+ operational
- ✅ Super Admin dashboard 60%+
- ✅ Master-data consistency, field mapping fix

**Timeline:** 4 minggu
**Dependency:** None (parallel track)
**Resource:** 4-5 engineer (FE + BE), 1 QA, 1 BA

---

### PHASE 2: HIGH (Week 5-8) — COMPLETE CORE FUNCTIONALITY

**Focus:** Bidang Ketersediaan + Distribusi + UPTD advanced features

**Deliverables:**

- ✅ Bidang Ketersediaan dashboard operasional
- ✅ Bidang Distribusi dashboard + real-time tracking (basic)
- ✅ Kepala Dinas KPI dashboard
- ✅ UPTD advanced features (chain of custody, cert auto-generation)
- ✅ 25 TINGGI issue resolved
- ✅ OpenAPI spec complete untuk internal API

**Timeline:** 4 minggu
**Dependency:** Phase-1 complete
**Resource:** 5-6 engineer, 2 QA, 1 BA

---

### PHASE 3: MEDIUM (Week 9-16) — PUBLIC & ADVANCED FEATURES

**Focus:** Public portal + Bidang Konsumsi + Advanced analytics

**Deliverables:**

- ✅ Public Data Portal (landing page, catalog, download, API)
- ✅ Bidang Konsumsi dashboard (privacy-hardened)
- ✅ Real-time notification system (email/SMS alerts)
- ✅ Advanced analytics (pivot, custom dashboard, AI/ML anomaly)
- ✅ Geographic visualization (map-based monitoring)
- ✅ 23 SEDANG issue resolved
- ✅ Full compliance certification (SPBE/SPIP audit-ready)

**Timeline:** 8 minggu
**Dependency:** Phase-2 complete
**Resource:** 6-8 engineer, 2-3 QA, 2 BA

---

## KESIMPULAN & VERDICT FINAL

**VERDICT: SISTEM AKAN MENCAPAI STABILITAS OPERASIONAL TETAPI PARTIAL DALAM MENJAWAB PERMASALAHAN**

Sistem SIGAP Malut menunjukkan kemajuan stabilitas operasional lintas role, namun penuntasan permasalahan masih bersifat parsial pada kondisi saat ini, khususnya di Bidang Ketersediaan, Bidang Distribusi, Bidang Konsumsi, dan layanan publik.

Koreksi atas narasi lama:

- Bukan 20 masalah, melainkan **65 issue** total.
- Bukan horizon 10-12 minggu, melainkan **Phase 1-3 selama 16 minggu**.
- Cakupan verdict tidak boleh hanya UPTD; harus mencakup **8 role utama** dengan prioritas implementasi bertahap.

### 1. Pemetaan Kesiapan Semua Role (Kondisi Saat Ini)

| Role                        | Compliance Saat Ini | Status Kesiapan Operasional | Catatan Implementasi Saat Ini                                                                      |
| --------------------------- | ------------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| **Super Admin**             | **70%**             | Siap bersyarat              | Perlu penyelesaian kontrol KRITIS pada keamanan dan enforcement                                    |
| **Kepala Dinas / Gubernur** | **60%**             | Siap terbatas               | Fungsi KPI strategis dan scorecard kepatuhan perlu diperdalam                                      |
| **Sekretariat**             | **85%**             | Siap operasional inti       | Fondasi operasional paling matang, namun dashboard dan validasi lintas-modul masih perlu penguatan |
| **Bidang Ketersediaan**     | **40%**             | Belum siap                  | Routing, data scope, formula, dan dashboard operasional belum tuntas                               |
| **Bidang Distribusi**       | **35%**             | Belum siap                  | Integrasi distribusi, harga, dan pemantauan real-time belum tuntas                                 |
| **Bidang Konsumsi**         | **25%**             | Belum siap (kritis privasi) | Dashboard belum penuh, perlindungan data sensitif belum memadai                                    |
| **UPTD**                    | **80%**             | Siap operasional terbatas   | Kuat di workflow inti, tetapi masih ada gap routing, endpoint, OpenAPI, dan fitur lanjutan         |
| **Public Portal**           | **20%**             | Belum siap                  | Klasifikasi data, anonymization, API key, dan layanan publik belum lengkap                         |

### 2. Pemetaan Permasalahan Operasional Dinas vs Role Penanggung Jawab

| Area Permasalahan Operasional                                | Role Utama                             | Kondisi Saat Ini                                          | Status Penyelesaian                                       |
| ------------------------------------------------------------ | -------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| **Koordinasi tata kelola internal dan layanan administrasi** | Sekretariat, Super Admin, Kepala Dinas | Struktur modul dan workflow sudah ada                     | **Parsial kuat** (siap di Phase 1 untuk operasional inti) |
| **Ketersediaan pangan dan monitoring kerawanan**             | Bidang Ketersediaan                    | Komponen dashboard dan integrasi data belum matang        | **Parsial rendah** (target Phase 2)                       |
| **Distribusi, harga, dan stabilisasi**                       | Bidang Distribusi                      | Integrasi data lapangan dan visualisasi rute belum matang | **Parsial rendah** (target Phase 2)                       |
| **Konsumsi, gizi, dan keamanan pangan sensitif**             | Bidang Konsumsi                        | Privacy control dan model survei belum final              | **Belum siap** (target Phase 3)                           |
| **Pengujian mutu, sertifikasi, dan pelaporan laboratorium**  | UPTD                                   | Workflow inti berjalan, namun ada gap teknis prioritas    | **Parsial kuat** (penguatan Phase 1-2)                    |
| **Transparansi data publik dan layanan open data**           | Public Portal, Super Admin             | Portal publik belum lengkap end-to-end                    | **Belum siap** (target Phase 3)                           |

### 3. Analisis Stabilitas Sistem Berbasis Metrik Matrix

| Dimensi Stabilitas            | Nilai Saat Ini | Interpretasi                                                           |
| ----------------------------- | -------------- | ---------------------------------------------------------------------- |
| **Dashboard Readiness**       | **31%**        | Titik terlemah, perlu prioritas implementasi UI lintas-bidang          |
| **Auth & Access Control**     | **78%**        | Cukup stabil, namun enforcement belum merata di semua skenario         |
| **CRUD Workflow**             | **78%**        | Relatif stabil untuk operasi inti, masih perlu perluasan coverage role |
| **Master Data & Consistency** | **69%**        | Menengah, risiko inkonsistensi masih ada pada beberapa modul           |
| **Audit Traceability**        | **93%**        | Sangat kuat, menjadi fondasi kepatuhan dan forensik operasional        |
| **Overall Compliance**        | **62%**        | Belum layak untuk go-live serentak lintas role                         |

Kesimpulan dimensi:

- Sistem sudah memiliki fondasi kuat pada audit dan kontrol proses.
- Stabilitas layanan lintas-role masih tertahan oleh kesiapan dashboard, integrasi data, dan kontrol privasi.

### 4. Verdict Final Khusus 5 Role Operasional Utama

Role operasional yang dimaksud: **Sekretariat, Bidang Ketersediaan, Bidang Distribusi, Bidang Konsumsi, UPTD**.

| Role                    | Compliance Saat Ini | Verdict Final                                     |
| ----------------------- | ------------------- | ------------------------------------------------- |
| **Sekretariat**         | **85%**             | Siap operasional inti pada akhir Phase 1          |
| **UPTD**                | **80%**             | Siap operasional terbatas pada akhir Phase 1      |
| **Bidang Ketersediaan** | **40%**             | Belum siap; target operasional pada akhir Phase 2 |
| **Bidang Distribusi**   | **35%**             | Belum siap; target operasional pada akhir Phase 2 |
| **Bidang Konsumsi**     | **25%**             | Belum siap; target operasional pada akhir Phase 3 |

Kesimpulan 5 role operasional:

- Jika dipaksakan live serentak saat ini, sistem belum stabil penuh.
- Jika mengikuti fase resmi, stabilitas akan tercapai bertahap dan terukur.

### 5. Go-Live Gate Final Per Fase

| Gate       | Akhir Fase        | Ruang Lingkup Go-Live                               | Syarat Minimal                                                              |
| ---------- | ----------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| **Gate 1** | Week 4 (Phase 1)  | Super Admin (bersyarat), Sekretariat, UPTD terbatas | Semua KRITIS lintas role prioritas harus ditutup                            |
| **Gate 2** | Week 8 (Phase 2)  | Tambahan Bidang Ketersediaan dan Bidang Distribusi  | Isu TINGGI pada dashboard, integrasi, dan data scope harus terkendali       |
| **Gate 3** | Week 16 (Phase 3) | Bidang Konsumsi + Public Portal + advanced features | Privacy-hardening, data classification, dan kesiapan publik harus lulus uji |

### 6. Pernyataan Kepatuhan Final

- Dokumen ini telah mendokumentasikan **8 role utama** dengan struktur seragam dan dapat diaudit.
- Total backlog perbaikan adalah **65 issue**: **17 KRITIS**, **25 TINGGI**, **23 SEDANG**.
- Target kepatuhan pasca-remediasi adalah **78-85%** setelah eksekusi **Phase 1-3 (16 minggu)**.
- Go-live penuh lintas-role dinyatakan sah hanya jika kriteria Gate 1, Gate 2, dan Gate 3 tercapai.

---

**Dokumen ini WAJIB direvisi setiap quarter untuk mencerminkan perubahan requirement, hasil audit, dan feedback operasional.**

**Status: Production Standard v2.0 (20 Maret 2026)**
