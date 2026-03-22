# 31 — Panduan Standar Implementasi & Coding Convention SIGAP-MALUT

**Versi:** 1.0.0  
**Tanggal:** 2026-03-22  
**Status:** 🔴 WAJIB DIPATUHI — Berlaku untuk seluruh tim pengembangan  
**Scope:** Seluruh codebase frontend (`frontend/src/`) dan backend (`backend/`)

---

## ⚠️ PERINGATAN KEPADA SELURUH TIM DEVELOPER

Dokumen ini adalah **syarat teknis yang tidak boleh dilanggar**. Setiap fitur, komponen, atau endpoint baru **wajib mengikuti standar ini**. Pull request yang melanggar panduan ini akan ditolak saat code review.

> Sistem SIGAP-MALUT telah melalui 8 siklus perbaikan Gap Kritis (Gap #1 s/d Gap #8). Semua arsitektur, komponen, dan konvensi yang tertulis di sini adalah hasil konsolidasi tervalidasi. **Jangan membuat ulang sesuatu yang sudah ada.**

---

## 1. ARSITEKTUR SISTEM — WAJIB DIPAHAMI

### 1.1 Stack Teknologi Resmi

| Layer            | Teknologi                    | Versi                                        |
| ---------------- | ---------------------------- | -------------------------------------------- |
| Frontend         | React 18 + Vite              | `^18.x`                                      |
| Routing          | React Router v6              | `^6.x`                                       |
| State Management | Zustand                      | `authStore.js`                               |
| HTTP Client      | Axios (axiosInstance)        | via `api/axiosInstance.js`                   |
| UI Stylesheet    | Tailwind CSS                 | Custom tokens di `tailwind.config.js`        |
| Charts           | Recharts                     | AreaChart, BarChart                          |
| PPTX Export      | pptxgenjs                    | via GeneralPPTXModal                         |
| Real-time        | Socket.IO Client             | via `hooks/useSocket.js`                     |
| Toast Notifikasi | react-hot-toast              | WAJIB, bukan `alert()`                       |
| i18n             | react-i18next                | via `i18n/id.js`                             |
| Backend          | Node.js + Express            | ES Modules (`import/export`)                 |
| Database ORM     | Sequelize                    | via `config/database.js`                     |
| Caching          | Redis (+ fallback in-memory) | via `services/cacheService.js`               |
| WebSocket        | Socket.IO Server             | via `services/socketService.js`              |
| Auth             | JWT Bearer Token             | middleware `protect` di `middleware/auth.js` |

### 1.2 Struktur Folder Frontend — JANGAN DIUBAH

```
frontend/src/
├── api/              # axiosInstance.js SATU-SATUNYA HTTP client
├── components/
│   ├── auth/         # MFASetupModal.jsx
│   ├── analytics/    # SelfServiceAnalytics.jsx
│   ├── design/       # AppSidebar.jsx (komponen sidebar RESMI)
│   ├── kpi/          # KPIDrilldownDrawer.jsx, KPITrendChart.jsx
│   ├── realtime/     # LiveKPIBadge.jsx, AlertsToast.jsx
│   ├── reports/      # GeneralPPTXModal.jsx, MendagriPPTXModal.jsx
│   ├── ui/           # MapLayerPanel.jsx dan komponen UI generik
│   └── wizard/       # ModuleWizard.jsx
├── hooks/            # useIdleLogout.js, useSocket.js, useKPIPolling.js
├── i18n/             # id.js (semua terjemahan Bahasa Indonesia)
├── layouts/          # DashboardLayout.jsx, DashboardInflasiLayout.jsx, dll.
├── pages/            # Satu file per route halaman
├── stores/           # authStore.js (SATU-SATUNYA state global auth)
└── ui/
    └── dashboards/   # DashboardInflasi.jsx, DashboardGubernur.jsx, dll.
```

### 1.3 Struktur Folder Backend — JANGAN DIUBAH

```
backend/
├── config/           # database.js
├── controllers/      # Satu controller per domain
├── middleware/
│   ├── auth.js       # protect() — token validation
│   ├── permissionCheck.js  # RBAC permission middleware
│   ├── fieldMask.js  # Field-level access control
│   └── cacheMiddleware.js  # HTTP cache via Redis/in-memory
├── models/           # Sequelize models
├── routes/
│   ├── mfa.js        # POST /auth/mfa/send-otp, /verify-otp
│   └── ...
├── services/
│   ├── cacheService.js     # Redis + in-memory fallback
│   ├── socketService.js    # Socket.IO instance
│   ├── kpiPollingService.js # Poll KPI tiap 5 menit
│   ├── slaService.js       # SLA tracking + escalation scheduler
│   ├── dailyDigestService.js # Daily digest email scheduler
│   └── notificationService.js
└── server.js         # Entry point utama
```

---

## 2. DESIGN SYSTEM — TOKEN WAJIB

### 2.1 Warna Primary

```css
/* CSS Variable — pakai ini di inline style */
--color-primary: #0b5fff;

/* Tailwind class — pakai ini di className */
bg-primary text-primary border-primary
```

**❌ DILARANG:** `bg-blue-600`, `bg-blue-700`, `#3b82f6`, `#2563eb` — ganti semua dengan `bg-primary` atau `var(--color-primary)`.

### 2.2 Tipografi

```css
/* H1: 28px / Bold 700 */
font-size: 1.75rem;
font-weight: 700;
/* Tailwind: text-h1 */

/* H2: 22px / Semibold 600 */
/* Tailwind: text-h2 */

/* H3: 18px / Semibold 600 */
/* Tailwind: text-h3 */

/* Font Family: Inter */
font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
/* Tailwind: font-sans (sudah jadi default) */
```

> Font **Inter** di-load via Google Fonts di `index.html`. Sudah otomatis aktif.

### 2.3 Grid Layout

```html
<!-- Grid 12 kolom desktop — GUNAKAN INI -->
<div class="grid grid-cols-12 gap-4">
  <div class="col-span-4">...</div>
  <div class="col-span-8">...</div>
</div>

<!-- Atau pakai CSS class utility -->
<div class="grid-12">...</div>
```

### 2.4 Sidebar — WAJIB gunakan AppSidebar

```jsx
import AppSidebar, {
  MAIN_MARGIN_EXPANDED,
  MAIN_MARGIN_COLLAPSED,
} from "../components/design/AppSidebar";

// Props wajib:
<AppSidebar
  open={sidebarOpen}
  onToggle={() => setSidebarOpen(v => !v)}
  isMobile={isMobile}
  navItems={NAV_ITEMS}  // [{ label, path, icon, end? }]
  logo={{ icon: "📊", title: "SIGAP MALUT", subtitle: "Nama Dashboard" }}
/>

// Main content margin:
<div className={`flex-1 ${isMobile ? "ml-0" : sidebarOpen ? MAIN_MARGIN_EXPANDED : MAIN_MARGIN_COLLAPSED}`}>
```

**Token sidebar:**

- Expanded: **280px** (`w-[280px]`)
- Collapsed: **72px** (`w-[72px]`)

**❌ DILARANG:** `w-64` (256px), `w-72` (288px) untuk sidebar. Selalu gunakan `AppSidebar`.

---

## 3. AUTENTIKASI & KEAMANAN — ATURAN MUTLAK

### 3.1 Semua Request API Harus Lewat axiosInstance

```jsx
// ✅ BENAR — selalu import ini
import api from "../api/axiosInstance";

const res = await api.get("/endpoint");
const res = await api.post("/endpoint", payload);
```

**❌ DILARANG:** `fetch()` langsung, `axios.create()` baru, hardcode URL `http://localhost:5000`.

### 3.2 State Auth — Hanya dari authStore

```jsx
import useAuthStore from "../stores/authStore";

const user = useAuthStore((s) => s.user);
const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
const logout = useAuthStore((s) => s.logout);
```

**❌ DILARANG:** localStorage langsung, useState untuk data user, context API duplikat.

### 3.3 Backend — Semua Route Private Wajib Middleware

```js
import { protect } from "../middleware/auth.js";
import { permissionCheck } from "../middleware/permissionCheck.js";
import { applyFieldMask } from "../middleware/fieldMask.js";

// Route pattern standar:
router.get(
  "/data",
  protect, // 1. Validasi JWT
  permissionCheck("MODUL", "READ"), // 2. Cek role/permission
  cacheMiddleware(300), // 3. Cache 5 menit (optional)
  controller.getData,
);
```

**❌ DILARANG:** Endpoint tanpa `protect`, query SQL hardcode tanpa parameterisasi (SQL Injection risk).

### 3.4 Auto-Logout — Sudah Aktif di App.jsx

`useIdleLogout()` dipasang di level `App`. **Jangan pasang duplikat di halaman lain.**  
Timeout: **15 menit** idle → logout otomatis.

### 3.5 MFA — Gunakan Endpoint yang Sudah Ada

```
POST /api/auth/mfa/send-otp   → kirim OTP ke email
POST /api/auth/mfa/verify-otp → verifikasi kode
DELETE /api/auth/mfa/disable  → nonaktifkan 2FA
```

Frontend modal: `components/auth/MFASetupModal.jsx`.

---

## 4. KOMPONEN YANG SUDAH ADA — JANGAN BUAT ULANG

### 4.1 Frontend Components

| Komponen               | Path                                            | Fungsi                                      |
| ---------------------- | ----------------------------------------------- | ------------------------------------------- |
| `AppSidebar`           | `components/design/AppSidebar.jsx`              | Sidebar 280/72px collapsible                |
| `LiveKPIBadge`         | `components/realtime/LiveKPIBadge.jsx`          | Badge real-time KPI                         |
| `AlertsToast`          | `components/realtime/AlertsToast.jsx`           | Toast notif real-time                       |
| `KPIDrilldownDrawer`   | `components/kpi/KPIDrilldownDrawer.jsx`         | Drawer detail klik KPI tile                 |
| `KPITrendChart`        | `components/kpi/KPITrendChart.jsx`              | Area chart tren 6 bulan                     |
| `MapLayerPanel`        | `components/ui/MapLayerPanel.jsx`               | Map layer toggle + date slider + export PNG |
| `MFASetupModal`        | `components/auth/MFASetupModal.jsx`             | 2FA setup wizard                            |
| `GeneralPPTXModal`     | `components/reports/GeneralPPTXModal.jsx`       | Ekspor PPTX generik                         |
| `MendagriPPTXModal`    | `components/reports/MendagriPPTXModal.jsx`      | PPTX khusus rakor Mendagri                  |
| `ModuleWizard`         | `components/wizard/ModuleWizard.jsx`            | Wizard buat modul baru                      |
| `SelfServiceAnalytics` | `components/analytics/SelfServiceAnalytics.jsx` | Filter analytics mandiri                    |

### 4.2 Hooks

| Hook            | Path                     | Fungsi                      |
| --------------- | ------------------------ | --------------------------- |
| `useIdleLogout` | `hooks/useIdleLogout.js` | Auto-logout 15 menit idle   |
| `useSocket`     | `hooks/useSocket.js`     | Socket.IO client connection |
| `useKPIPolling` | `hooks/useKPIPolling.js` | Poll KPI tiap interval      |

### 4.3 Backend Services

| Service               | Path                              | Fungsi                            |
| --------------------- | --------------------------------- | --------------------------------- |
| `cacheService`        | `services/cacheService.js`        | Redis + in-memory fallback        |
| `socketService`       | `services/socketService.js`       | Socket.IO emit/broadcast          |
| `kpiPollingService`   | `services/kpiPollingService.js`   | Auto-poll KPI 5 menit             |
| `slaService`          | `services/slaService.js`          | SLA hitung + escalation scheduler |
| `dailyDigestService`  | `services/dailyDigestService.js`  | Digest email harian + scheduler   |
| `notificationService` | `services/notificationService.js` | Notifikasi berbasis DB            |

---

## 5. i18n — SEMUA STRING UI WAJIB DITRANSLASIKAN

### 5.1 Cara Menambah Terjemahan

**Step 1:** Tambah key di `frontend/src/i18n/id.js`:

```js
// Tambahkan di namespace yang sesuai:
export const id = {
  common: {
    save: "Simpan",
    cancel: "Batal",
    close: "Tutup",
    // tambahkan key baru di sini
    yourKey: "Teks Bahasa Indonesia",
  },
  modul_baru: {
    title: "Judul Modul Baru",
    // ...
  },
};
```

**Step 2:** Gunakan di komponen:

```jsx
import { useTranslation } from "react-i18next";

export default function Komponen() {
  const { t } = useTranslation();
  return <button>{t("common.save")}</button>;
}
```

**❌ DILARANG:** Hardcode teks Indonesia langsung di JSX tanpa `t()`.  
Contoh yang salah: `<button>Simpan</button>`  
Contoh yang benar: `<button>{t("common.save")}</button>`

---

## 6. REAL-TIME & CACHING — ATURAN PENGGUNAAN

### 6.1 Caching Backend

```js
import cacheMiddleware from "../middleware/cacheMiddleware.js";

// TTL dalam detik: 60 = 1 menit, 300 = 5 menit
router.get("/data-publik", cacheMiddleware(300), controller.getData);
```

**Kapan menggunakan cache:**

- ✅ Data yang jarang berubah: master data, KPI agregat, statistik
- ❌ Jangan cache: endpoint yang return data personal user, form submission, mutasi data

### 6.2 Real-time Events

```js
// Backend — emit event:
import { getIO } from "../services/socketService.js";

getIO().emit("kpi:update", { type: "inflasi", value: 3.2 });
getIO().to(`user:${userId}`).emit("notification:new", { ... });
```

```jsx
// Frontend — subscribe event:
import useSocket from "../hooks/useSocket";

const socket = useSocket();
useEffect(() => {
  if (!socket) return;
  socket.on("kpi:update", (data) => { ... });
  return () => socket.off("kpi:update");
}, [socket]);
```

---

## 7. NOTIFIKASI — GUNAKAN TOAST, BUKAN ALERT

| Situasi        | Gunakan               | Contoh                                     |
| -------------- | --------------------- | ------------------------------------------ |
| Sukses operasi | `toast.success()`     | `toast.success("Data berhasil disimpan")`  |
| Error/gagal    | `toast.error()`       | `toast.error("Gagal menyimpan data")`      |
| Peringatan     | `toast()` dengan ikon | `toast("⚠️ Data akan dihapus permanen")`   |
| Loading        | `toast.loading()`     | `const id = toast.loading("Memproses...")` |

**❌ DILARANG KERAS:** `alert()`, `confirm()`, `window.alert()` — akan ditolak saat code review.

---

## 8. RBAC — SETIAP FITUR BARU WAJIB PUNYA PERMISSION

### 8.1 Daftar Role yang Valid (15 role resmi)

```
superadmin | kepala_dinas | sekretaris | kepala_bidang | kepala_uptd
kasubbag | fungsional | pelaksana | staf_teknis | operator
verifikator | admin_modul | viewer_publik | koordinator | auditor
```

### 8.2 Menambah Permission untuk Fitur Baru

**Step 1:** Tambah mapping di `backend/config/roleModuleMapping.json`:

```json
{
  "NAMA_MODUL_BARU": {
    "superadmin": ["CREATE", "READ", "UPDATE", "DELETE"],
    "kepala_dinas": ["READ"],
    "pelaksana": ["CREATE", "READ"]
  }
}
```

**Step 2:** Gunakan middleware di route:

```js
router.post(
  "/",
  protect,
  permissionCheck("NAMA_MODUL_BARU", "CREATE"),
  controller,
);
router.get(
  "/",
  protect,
  permissionCheck("NAMA_MODUL_BARU", "READ"),
  controller,
);
```

### 8.3 Referensi Dokumen RBAC

Lihat `dokumenSistem/09-Role-Module-Matrix.md` dan `dokumenSistem/09-matriks-role-akses-modul.md` untuk pemetaan lengkap role ↔ modul.

---

## 9. DATABASE & MIGRATION — ATURAN

### 9.1 Setiap Tabel Baru Wajib Migration

```js
// File: backend/migrations/YYYYMMDD-nama-migrasi.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("nama_tabel", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    // ... kolom-kolom
    deleted_at: { type: Sequelize.DATE, allowNull: true }, // WAJIB: soft delete
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("nama_tabel");
}
```

### 9.2 Soft Delete Wajib

Semua tabel data operasional **wajib** memiliki kolom `deleted_at`.  
Model Sequelize: gunakan `paranoid: true`.

```js
const Model = sequelize.define("NamaModel", { ... }, {
  paranoid: true,       // ✅ soft delete
  underscored: true,    // ✅ snake_case kolom
});
```

---

## 10. CHECKLIST WAJIB SEBELUM COMMIT

Setiap developer **wajib mencentang semua** sebelum membuat commit/pull request:

```
□ Semua string UI menggunakan t() dari react-i18next
□ Tidak ada penggunaan alert() / confirm() — gunakan toast
□ Tidak ada hardcode URL API — gunakan axiosInstance
□ Setiap route backend sudah ada protect() middleware
□ Setiap route privat sudah ada permissionCheck() middleware
□ Sidebar baru menggunakan AppSidebar komponen (bukan inline aside)
□ Warna primary menggunakan bg-primary / var(--color-primary)
□ Tidak ada w-64 untuk sidebar — gunakan w-[280px] / w-[72px]
□ Tabel baru punya migration file + soft delete (deleted_at)
□ roleModuleMapping.json sudah diupdate untuk fitur baru
□ File baru tidak menduplikasi komponen/hook/service yang sudah ada
□ get_errors tidak menampilkan compile error baru
```

---

## 11. REGULASI DOKUMEN — RELASI DENGAN DOKUMEN LAIN

| Dokumen                                    | Relevansi                              |
| ------------------------------------------ | -------------------------------------- |
| `09-Role-Module-Matrix.md`                 | Acuan RBAC dan permission setiap modul |
| `13-System-Architecture-Document.md`       | Arsitektur sistem dan keamanan         |
| `14-alur-kerja-sekretariat-bidang-uptd.md` | Alur workflow bisnis                   |
| `17-keamanan-informasi-operasional.md`     | Standar keamanan teknis                |
| `20-strategi-testing-dan-quality-gate.md`  | Quality gate dan testing               |
| `03-spesifikasi-uiux-dashboard.md`         | Spec UX/UI yang wajib diikuti          |
| `openapi.yaml`                             | Kontrak API resmi                      |

---

## 12. RIWAYAT IMPLEMENTASI GAP #1–#8

Dokumen ini merupakan konsolidasi dari 8 siklus Gap Kritis yang telah diselesaikan:

| Gap | Domain                   | Hasil Utama                                                                                                  |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| #1  | Package & Utilities      | axiosInstance, authStore, toast menggantikan alert()                                                         |
| #2  | CRUD & Dashboards        | GenericCreatePage/EditPage reusable, 4 dashboard baru                                                        |
| #3  | KPI & RBAC Backend       | 84 API routes, permissionCheck, fieldMask, 15 role                                                           |
| #4  | Task Management          | 14-state machine, Task/TaskComment model, notifikasi DB                                                      |
| #5  | PPTX Mendagri            | 6-slide generator, LaporanMendagriPage                                                                       |
| #6  | Real-time & Performance  | Socket.IO, Redis cache, KPI polling 5 menit                                                                  |
| #7  | Design System            | Primary #0B5FFF, Inter, H1 28px, grid 12-col, AppSidebar                                                     |
| #8  | Fitur Dokumen (11 fitur) | i18n, Drilldown, Trend Chart, MapLayer, Auto-logout, MFA, SLA, Digest, PPTX generik, ModuleWizard, Analytics |

---

> **Dokumen ini diperbarui setiap kali ada perubahan arsitektur atau penambahan komponen inti.**  
> Owner: Tim Arsitektur & Lead Developer SIGAP-MALUT  
> Reviewer wajib: semua anggota tim sebelum onboarding
