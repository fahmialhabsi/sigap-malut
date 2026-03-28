# 22 — Dokumentasi Sistem e-Pelara

## Panduan Integrasi untuk GitHub Copilot & Pengembang

> **Tujuan Dokumen:** Dokumen ini mendokumentasikan seluruh sistem e-Pelara (backend + frontend) secara komprehensif agar GitHub Copilot di VS Code dan seluruh pengembang memahami konteks sistem saat melakukan integrasi ke sigap-malut.
>
> **Sumber Repo:** https://github.com/fahmialhabsi/e-pelara
> **Target Integrasi:** https://github.com/fahmialhabsi/sigap-malut
> **Tanggal Dokumentasi:** 2026-03-20

---

## Daftar Isi

1. [Identitas Sistem](#1-identitas-sistem)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Tech Stack Lengkap](#3-tech-stack-lengkap)
4. [Struktur Direktori](#4-struktur-direktori)
5. [Backend — Server & Konfigurasi](#5-backend--server--konfigurasi)
6. [Backend — Daftar Lengkap API Endpoints](#6-backend--daftar-lengkap-api-endpoints)
7. [Backend — Database & Model](#7-backend--database--model)
8. [Backend — Autentikasi & Role](#8-backend--autentikasi--role)
9. [Frontend — Struktur Aplikasi](#9-frontend--struktur-aplikasi)
10. [Frontend — Modul Perencanaan (Fitur Utama)](#10-frontend--modul-perencanaan-fitur-utama)
11. [Frontend — State Management & Context](#11-frontend--state-management--context)
12. [Frontend — Pola Form (Shared Pattern)](#12-frontend--pola-form-shared-pattern)
13. [Frontend — Routing](#13-frontend--routing)
14. [Perbandingan Stack: e-Pelara vs sigap-malut](#14-perbandingan-stack-e-pelara-vs-sigap-malut)
15. [Strategi Integrasi ke sigap-malut](#15-strategi-integrasi-ke-sigap-malut)
16. [Panduan SSO (Single Sign-On)](#16-panduan-sso-single-sign-on)
17. [Checklist Integrasi untuk Copilot](#17-checklist-integrasi-untuk-copilot)

---

## 1. Identitas Sistem

| Atribut              | Nilai                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Nama Sistem**      | e-Pelara (e-Perencanaan Dinas Pangan Maluku Utara)                                                                                       |
| **Nama Lengkap**     | Elektronik Perencanaan, Penganggaran, dan Evaluasi                                                                                       |
| **Instansi**         | Dinas Pangan Provinsi Maluku Utara                                                                                                       |
| **Fungsi Utama**     | Sistem manajemen dokumen perencanaan pemerintah daerah: RPJMD, Renstra OPD, RKPD, Renja, RKA, DPA, Monev, LAKIP, LK-Dispang, LPK-Dispang |
| **Bahasa**           | Indonesia                                                                                                                                |
| **Mode Deployment**  | Docker Compose (dev)                                                                                                                     |
| **Port Frontend**    | 3001 (via `vite --port 3001`)                                                                                                            |
| **Port Backend**     | Dikonfigurasi via `.env`                                                                                                                 |
| **Database**         | MySQL (`db_epelara`)                                                                                                                     |
| **File SQL Lengkap** | `db_epelara.sql` (281KB) tersedia di root repo                                                                                           |

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│              BROWSER USER (e-Pelara)                     │
└─────────────────────────────────────────────────────────┘
                        │ HTTP/HTTPS
                        ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND — React 18 + Vite                              │
│  Port: 3001                                              │
│  - Ant Design (komponen UI)                              │
│  - react-hook-form + Yup (form & validasi)               │
│  - @tanstack/react-query (server state)                  │
│  - react-bootstrap (layout tambahan)                     │
│  - React Router v6 (routing)                             │
└──────────────────────────┬──────────────────────────────┘
                           │ Axios REST API
                           │ Authorization: Bearer <JWT>
                           ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND — Node.js + Express 5                           │
│  - Sequelize ORM (MySQL)                                 │
│  - JWT Authentication (jsonwebtoken)                     │
│  - bcryptjs (hashing password)                           │
│  - Socket.IO (real-time notifikasi)                      │
│  - Redis / ioredis (caching)                             │
│  - Puppeteer (export PDF)                                │
│  - ExcelJS + XLSX (export Excel)                         │
│  - OpenAI SDK (fitur rekomendasi AI)                     │
└──────────────────────────┬──────────────────────────────┘
                           │ Sequelize ORM
                           ▼
┌─────────────────────────────────────────────────────────┐
│  DATABASE — MySQL                                        │
│  Nama DB: db_epelara                                     │
│  ORM: Sequelize 6                                        │
└─────────────────────────────────────────────────────────┘
```

### Docker Compose (file: `docker-compose.yml`)

Sistem dijalankan dengan Docker Compose yang mengatur:

- Container **frontend** (React/Vite)
- Container **backend** (Node.js/Express)
- Container **MySQL** (database)

---

## 3. Tech Stack Lengkap

### Backend (`backend/package.json`)

```json
{
  "name": "rpjmd-backend",
  "runtime": "Node.js",
  "framework": "Express 5.1.0",
  "orm": "Sequelize 6.37.7",
  "database": "MySQL (mysql2 ^3.15.0)",
  "dependencies": {
    "authentication": "jsonwebtoken ^9.0.2 + bcryptjs ^3.0.2",
    "validation": "express-validator ^7.2.1 + joi ^17.13.3",
    "caching": "redis ^5.7.0 + ioredis ^5.7.0",
    "realtime": "socket.io ^4.8.1",
    "export_pdf": "puppeteer ^24.14.0 + pdfkit ^0.17.0 + pdfmake ^0.2.18",
    "export_excel": "exceljs ^4.4.0 + xlsx ^0.18.5",
    "export_csv": "csv-writer ^1.6.0",
    "export_word": "docx (via frontend)",
    "pdf_signing": "@signpdf/signpdf ^3.2.5 + node-forge ^1.3.1",
    "ai": "openai ^5.3.0",
    "logging": "winston ^3.17.0 + morgan ^1.10.0",
    "rate_limiting": "express-rate-limit ^7.5.0",
    "file_upload": "multer ^1.4.5-lts.2",
    "math": "decimal.js ^10.6.0",
    "misc": "dotenv + cors + cookie-parser + body-parser"
  },
  "devDependencies": {
    "nodemon": "^3.1.9",
    "sequelize-cli": "^6.6.2"
  }
}
```

### Frontend (`frontend/package.json`)

```json
{
  "name": "epenta-frontend",
  "runtime": "React 18.2.0",
  "bundler": "Vite 5.2.8",
  "ui_primary": "Ant Design (antd ^5.27.1 + @ant-design/icons ^5.2.7)",
  "ui_secondary": [
    "react-bootstrap ^2.10.2",
    "@coreui/react ^5.7.1",
    "@mui/material ^7.1.1",
    "@headlessui/react ^2.2.6",
    "@radix-ui/react-dropdown-menu",
    "lucide-react ^0.525.0"
  ],
  "form": "react-hook-form ^7.51.3 + @hookform/resolvers ^3.3.1 + yup ^1.3.3",
  "server_state": "@tanstack/react-query ^5.29.4",
  "routing": "react-router-dom ^6.22.3",
  "http": "axios ^1.7.2",
  "charts": "recharts ^3.1.0 + chart.js ^4.5.0 + @nivo/sankey ^0.99.0",
  "notifications": "react-toastify ^9.1.3 + react-hot-toast ^2.5.2",
  "export": "jspdf + jspdf-autotable + xlsx + docx + file-saver + react-csv + papaparse",
  "realtime": "socket.io-client ^4.8.1",
  "auth": "jwt-decode ^4.0.0 + js-cookie ^3.0.5",
  "css": "tailwindcss ^4.1.8 + bootstrap ^5.3.6",
  "misc": "dayjs + lodash.debounce + decimal.js + html2canvas + dompurify + react-paginate"
}
```

---

## 4. Struktur Direktori

### Root Repo

```
e-pelara/
├── backend/                    # Node.js + Express backend
├── frontend/                   # React + Vite frontend
├── docker-compose.yml          # Konfigurasi Docker
├── db_epelara.sql              # Dump database MySQL lengkap
├── Catatan Aplikasi e-Pelara.txt  # Catatan pengembangan
└── Daftar Nama Tabel Dan Field.xlsx  # Referensi skema database
```

### Backend (`backend/`)

```
backend/
├── server.js                   # Entry point — semua route di-register di sini
├── config/
│   ├── config.json             # Konfigurasi Sequelize (dev/staging/prod)
│   └── database.js             # Koneksi Sequelize
├── models/                     # Sequelize Models
│   ├── index.js                # Auto-load semua model
│   ├── user.js
│   ├── role.js
│   └── renstra_tabelTujuanModel.js  # (dan semua model lainnya)
├── migrations/                 # Sequelize Migrations
├── seeders/                    # Sequelize Seeders
├── routes/                     # Route definitions (semua modul)
├── controllers/                # Business logic
├── middlewares/
│   ├── verifyToken.js          # Middleware validasi JWT
│   └── allowRoles.js           # Middleware RBAC (role-based)
├── validators/                 # Request validators (joi/express-validator)
├── monev/                      # Sub-modul Monev (modular)
│   ├── index.js
│   └── routes/evaluasiRoutes.js
└── uploads/                    # File uploads (static)
```

### Frontend (`frontend/src/`)

```
frontend/src/
├── main.jsx                    # Entry point — QueryClientProvider + BrowserRouter
├── App.jsx                     # Root routing + Provider chain
├── App.css
├── contexts/
│   ├── authContext.js          # AuthContext (createContext)
│   ├── AuthProvider.jsx        # Provider utama auth + token management
│   ├── DokumenContext.jsx      # Context untuk dokumen aktif
│   ├── DokumenProvider.jsx     # Provider dokumen + tahun
│   ├── NotificationProvider.jsx
│   ├── FilterContext.jsx
│   └── PeriodeContext.jsx
├── hooks/
│   ├── useAuth.js              # Hook konsumsi AuthContext
│   ├── useDokumen.js           # Hook konsumsi DokumenContext
│   ├── useAuthStatus.js        # Hook status auth (isAuthenticated, userReady)
│   ├── useApiWithDokThnContext.js  # Hook API dengan dokumen+tahun otomatis
│   ├── useFilteredDokThn.js    # Hook fetch data terfilter
│   ├── usePostDokThnWithContext.js
│   └── templatesUseRenstra/   # Hook templates khusus Renstra
│       ├── useRenstraFormTemplate.js  # Template universal semua form Renstra
│       ├── useTujuanRenstraForm.js
│       ├── useSasaranRenstraForm.js
│       ├── useStrategiRenstraForm.js
│       ├── useKebijakanRenstraForm.js
│       ├── useProgramRenstraForm.js
│       ├── useKegiatanRenstraForm.js
│       └── useSubkegiatanRenstraForm.js
├── features/                   # Feature-based architecture
│   ├── auth/                   # Login, Register, Protected/Guest Route
│   ├── dashboard/              # Export semua dashboard module
│   ├── rpjmd/                  # Modul RPJMD
│   ├── renstra/                # Modul Renstra OPD (terbesar)
│   ├── rkpd/                   # Modul RKPD
│   ├── renja/                  # Modul Renja
│   ├── rka/                    # Modul RKA
│   ├── dpa/                    # Modul DPA
│   ├── monev/                  # Modul Monitoring & Evaluasi
│   ├── pengkeg/                # Modul Pengelolaan Kegiatan
│   ├── lakip/                  # Modul LAKIP
│   ├── lk-dispang/             # Modul LK Dispang
│   ├── lpk-dispang/            # Modul LPK Dispang
│   └── users/                  # Manajemen user
├── shared/
│   └── components/
│       ├── form/               # Shared form components (InputField, SelectWithLabelValue, dll)
│       ├── SidebarGlobal.jsx
│       ├── DashboardLayoutGlobal.jsx
│       ├── GlobalDokumenTahunPickerModal.jsx
│       ├── GlobalDokumenTahunPicker.jsx
│       ├── RequireDokumenType.jsx
│       └── ProtectedRoute.jsx (via features/auth)
├── routes/
│   ├── renstraRoutes.jsx       # Semua route modul Renstra
│   └── (lainnya embedded di config/routes.jsx)
├── config/
│   ├── routes.jsx              # Route RPJMD & umum
│   └── sidebarConfig.jsx       # Konfigurasi sidebar per dokumen
├── services/
│   ├── api.js                  # Axios instance dengan interceptor
│   └── authService.js          # Fungsi login, logout, refreshToken
├── pages/                      # Halaman tambahan (cascading, statistik, dll)
├── admin/                      # Halaman admin
├── utils/                      # Utility functions
├── validations/                # Yup schemas
├── constants/                  # Konstanta
├── layouts/                    # Layout wrappers
├── lib/                        # Library helpers
└── style/                      # CSS modules
```

---

## 5. Backend — Server & Konfigurasi

### Entry Point: `backend/server.js`

Server Express 5 dengan semua route di-register secara eksplisit. Konfigurasi penting:

```javascript
// Middleware chain:
app.use(helmet())           // Security headers
app.use(cors({ ... }))      // CORS — perlu dikonfigurasi untuk sigap-malut
app.use(morgan())           // HTTP logging
app.use(express.json())     // JSON body parser

// Static files:
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Auth routes (tidak butuh token):
app.use("/api/auth", authRoutes)

// Semua route lain BUTUH verifyToken middleware
```

### Konfigurasi Database (`backend/config/database.js`)

```javascript
// Menggunakan environment variables:
DB_NAME = db_epelara;
DB_USER = dari.env;
DB_HOST = dari.env;
DB_PORT = 3306;
DB_PASSWORD = dari.env;
NODE_ENV = development | production;
```

### Konfigurasi Sequelize (`backend/config/config.json`)

```json
{
  "development": {
    "database": "db_epelara",
    "dialect": "mysql",
    "host": "localhost"
  }
}
```

---

## 6. Backend — Daftar Lengkap API Endpoints

Semua endpoint memiliki prefix `/api`. Endpoint dengan tanda `🔒` membutuhkan Bearer Token JWT.

### 6.1 Autentikasi

| Method | Endpoint                  | Deskripsi              |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/auth/login`         | Login user, return JWT |
| POST   | `/api/auth/register`      | Registrasi user baru   |
| POST   | `/api/auth/refresh-token` | Refresh access token   |
| GET    | `/api/auth/me`            | 🔒 Profil user aktif   |

### 6.2 Master Data Pengguna

| Method              | Endpoint                    | Deskripsi                    |
| ------------------- | --------------------------- | ---------------------------- |
| GET/POST/PUT/DELETE | `/api/users`                | 🔒 CRUD Users                |
| GET/POST/PUT/DELETE | `/api/roles`                | 🔒 CRUD Roles                |
| GET/POST/PUT/DELETE | `/api/divisions`            | 🔒 CRUD Divisi/Bidang        |
| GET/POST/PUT/DELETE | `/api/opd-penanggung-jawab` | 🔒 CRUD OPD Penanggung Jawab |

### 6.3 Periode & Dokumen

| Method              | Endpoint               | Deskripsi                           |
| ------------------- | ---------------------- | ----------------------------------- |
| GET/POST/PUT/DELETE | `/api/periode-rpjmd`   | 🔒 CRUD Periode RPJMD               |
| GET                 | `/api/dokumen-options` | 🔒 Opsi dokumen tersedia untuk user |
| POST                | `/api/clone-periode`   | 🔒 Kloning data antar periode       |

### 6.4 Modul RPJMD

| Method              | Endpoint                           | Deskripsi                          |
| ------------------- | ---------------------------------- | ---------------------------------- |
| GET/POST/PUT/DELETE | `/api/visi`                        | 🔒 CRUD Visi RPJMD                 |
| GET/POST/PUT/DELETE | `/api/misi`                        | 🔒 CRUD Misi RPJMD                 |
| GET/POST/PUT/DELETE | `/api/tujuan`                      | 🔒 CRUD Tujuan RPJMD               |
| GET/POST/PUT/DELETE | `/api/sasaran`                     | 🔒 CRUD Sasaran RPJMD              |
| GET/POST/PUT/DELETE | `/api/strategi`                    | 🔒 CRUD Strategi RPJMD             |
| GET/POST/PUT/DELETE | `/api/arah-kebijakan`              | 🔒 CRUD Arah Kebijakan RPJMD       |
| GET/POST/PUT/DELETE | `/api/programs`                    | 🔒 CRUD Program RPJMD              |
| GET/POST/PUT/DELETE | `/api/kegiatan`                    | 🔒 CRUD Kegiatan RPJMD             |
| GET/POST/PUT/DELETE | `/api/sub-kegiatan`                | 🔒 CRUD Sub Kegiatan RPJMD         |
| GET/POST/PUT/DELETE | `/api/rpjmd`                       | 🔒 Data RPJMD induk                |
| GET/POST/PUT/DELETE | `/api/targets`                     | 🔒 Target indikator                |
| GET/POST/PUT/DELETE | `/api/indikators`                  | 🔒 Indikator detail                |
| GET/POST            | `/api/indikator-wizard`            | 🔒 Wizard input indikator          |
| GET/POST/PUT/DELETE | `/api/indikator-misi`              | 🔒 Indikator per Misi              |
| GET/POST/PUT/DELETE | `/api/indikator-tujuans`           | 🔒 Indikator per Tujuan            |
| GET/POST/PUT/DELETE | `/api/indikator-sasaran`           | 🔒 Indikator per Sasaran           |
| GET/POST/PUT/DELETE | `/api/indikator-program`           | 🔒 Indikator per Program           |
| GET/POST/PUT/DELETE | `/api/indikator-kegiatan`          | 🔒 Indikator per Kegiatan          |
| GET                 | `/api/dashboard-rpjmd/perencanaan` | 🔒 Dashboard indikator perencanaan |
| GET                 | `/api/dashboard-rpjmd/pelaksanaan` | 🔒 Dashboard indikator pelaksanaan |
| GET                 | `/api/dashboard-rpjmd/evaluasi`    | 🔒 Dashboard indikator evaluasi    |
| GET/POST/PUT/DELETE | `/api/prioritas-nasional`          | 🔒 Prioritas Nasional              |
| GET/POST/PUT/DELETE | `/api/prioritas-daerah`            | 🔒 Prioritas Daerah                |
| GET/POST/PUT/DELETE | `/api/prioritas-gubernur`          | 🔒 Prioritas Gubernur              |
| GET/POST            | `/api/cascading`                   | 🔒 Cascading RPJMD → Renstra       |
| GET                 | `/api/realisasi-indikator`         | 🔒 Realisasi indikator             |
| GET                 | `/api/evaluasi`                    | 🔒 Data evaluasi                   |
| GET                 | `/api/laporan`                     | 🔒 Laporan umum                    |

### 6.5 Modul Renstra OPD

| Method              | Endpoint                         | Deskripsi                     |
| ------------------- | -------------------------------- | ----------------------------- |
| GET/POST/PUT/DELETE | `/api/renstra-opd`               | 🔒 CRUD Renstra OPD (induk)   |
| GET/POST            | `/api/renstra`                   | 🔒 Bab-bab Renstra            |
| GET/POST/PUT/DELETE | `/api/renstra-tujuan`            | 🔒 Tujuan Renstra             |
| GET/POST/PUT/DELETE | `/api/renstra-sasaran`           | 🔒 Sasaran Renstra            |
| GET/POST/PUT/DELETE | `/api/renstra-strategi`          | 🔒 Strategi Renstra           |
| GET/POST/PUT/DELETE | `/api/renstra-kebijakan`         | 🔒 Kebijakan Renstra          |
| GET/POST/PUT/DELETE | `/api/renstra-program`           | 🔒 Program Renstra            |
| GET/POST/PUT/DELETE | `/api/renstra-kegiatan`          | 🔒 Kegiatan Renstra           |
| GET/POST/PUT/DELETE | `/api/renstra-subkegiatan`       | 🔒 Sub Kegiatan Renstra       |
| GET/POST/PUT/DELETE | `/api/indikator-renstra`         | 🔒 Indikator Renstra          |
| GET/POST/PUT/DELETE | `/api/renstra-target`            | 🔒 Target Renstra             |
| GET                 | `/api/renstra/export`            | 🔒 Export data Renstra        |
| GET/POST/PUT/DELETE | `/api/renstra-tabel-tujuan`      | 🔒 Tabel Tujuan Renstra       |
| GET/POST/PUT/DELETE | `/api/renstra-tabel-sasaran`     | 🔒 Tabel Sasaran Renstra      |
| GET/POST/PUT/DELETE | `/api/renstra-tabel-program`     | 🔒 Tabel Program Renstra      |
| GET/POST/PUT/DELETE | `/api/renstra-tabel-kegiatan`    | 🔒 Tabel Kegiatan Renstra     |
| GET/POST/PUT/DELETE | `/api/renstra-tabel-subkegiatan` | 🔒 Tabel Sub Kegiatan Renstra |

### 6.6 Modul RKPD

| Method              | Endpoint         | Deskripsi            |
| ------------------- | ---------------- | -------------------- |
| GET/POST/PUT/DELETE | `/api/rkpd`      | 🔒 CRUD RKPD         |
| GET/POST            | `/api/rkpd-init` | 🔒 Inisialisasi RKPD |

### 6.7 Modul Renja

| Method              | Endpoint     | Deskripsi         |
| ------------------- | ------------ | ----------------- |
| GET/POST/PUT/DELETE | `/api/renja` | 🔒 CRUD Renja OPD |

### 6.8 Modul RKA & DPA

| Method              | Endpoint   | Deskripsi   |
| ------------------- | ---------- | ----------- |
| GET/POST/PUT/DELETE | `/api/rka` | 🔒 CRUD RKA |
| GET/POST/PUT/DELETE | `/api/dpa` | 🔒 CRUD DPA |

### 6.9 Modul Pelaksanaan & Penatausahaan

| Method              | Endpoint             | Deskripsi               |
| ------------------- | -------------------- | ----------------------- |
| GET/POST/PUT/DELETE | `/api/bmd`           | 🔒 Barang Milik Daerah  |
| GET/POST/PUT/DELETE | `/api/penatausahaan` | 🔒 Penatausahaan        |
| GET/POST/PUT/DELETE | `/api/pengkeg`       | 🔒 Pengelolaan Kegiatan |

### 6.10 Modul Monitoring & Evaluasi (Monev)

| Method              | Endpoint                   | Deskripsi              |
| ------------------- | -------------------------- | ---------------------- |
| GET/POST/PUT/DELETE | `/api/monev`               | 🔒 Data Monev          |
| POST                | `/api/monev/evaluasi`      | 🔒 Input evaluasi      |
| GET                 | `/api/realisasi-indikator` | 🔒 Realisasi indikator |

### 6.11 Modul Pelaporan

| Method              | Endpoint             | Deskripsi            |
| ------------------- | -------------------- | -------------------- |
| GET/POST/PUT/DELETE | `/api/lpk-dispang`   | 🔒 LPK Dinas Pangan  |
| GET/POST/PUT/DELETE | `/api/lakip`         | 🔒 LAKIP             |
| GET                 | `/api/laporan`       | 🔒 Laporan umum      |
| GET                 | `/api/laporan/rpjmd` | 🔒 Laporan RPJMD     |
| GET                 | `/api/notifications` | 🔒 Notifikasi sistem |

### 6.12 Fitur Khusus

| Method   | Endpoint              | Deskripsi                           |
| -------- | --------------------- | ----------------------------------- |
| POST     | `/api/rekomendasi-ai` | 🔒 Rekomendasi berbasis AI (OpenAI) |
| POST     | `/api/sign-pdf`       | 🔒 Tanda tangan digital PDF         |
| GET/POST | `/api/kinerja`        | 🔒 Data kinerja                     |

---

## 7. Backend — Database & Model

### Database: `db_epelara` (MySQL)

**ORM:** Sequelize 6 dengan konfigurasi:

- `underscored: true` (field `created_at`, bukan `createdAt`)
- Auto-load model dari folder `models/`
- Migrations dikelola via `sequelize-cli`

### Tabel Utama yang Diketahui

#### Tabel Pengguna & Akses

| Tabel       | Deskripsi                                                       |
| ----------- | --------------------------------------------------------------- |
| `users`     | User sistem (id, name, email, password, role_id, divisions_id)  |
| `roles`     | Role pengguna (SUPER_ADMIN, ADMINISTRATOR, PENGAWAS, PELAKSANA) |
| `divisions` | Divisi/bidang OPD                                               |

#### Tabel RPJMD

| Tabel            | Deskripsi                                                     |
| ---------------- | ------------------------------------------------------------- |
| `periode_rpjmd`  | Periode dokumen RPJMD (id, tahun_awal, tahun_akhir, is_aktif) |
| `visi`           | Data Visi RPJMD                                               |
| `misi`           | Data Misi RPJMD                                               |
| `tujuan`         | Data Tujuan RPJMD                                             |
| `sasaran`        | Data Sasaran RPJMD                                            |
| `strategi`       | Data Strategi RPJMD                                           |
| `arah_kebijakan` | Arah Kebijakan RPJMD                                          |
| `programs`       | Program RPJMD                                                 |
| `kegiatan`       | Kegiatan RPJMD                                                |
| `sub_kegiatan`   | Sub Kegiatan RPJMD                                            |
| `indikators`     | Indikator pembangunan                                         |
| `targets`        | Target indikator per tahun                                    |

#### Tabel Renstra OPD

| Tabel                       | Deskripsi                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| `renstra_opd`               | Header Renstra OPD (id, opd_id, bidang_opd, tahun_mulai, tahun_akhir, is_aktif, rpjmd_id) |
| `renstra_tujuan`            | Tujuan Renstra OPD                                                                        |
| `renstra_sasaran`           | Sasaran Renstra OPD                                                                       |
| `renstra_strategi`          | Strategi Renstra OPD                                                                      |
| `renstra_kebijakan`         | Kebijakan Renstra OPD                                                                     |
| `renstra_program`           | Program Renstra OPD                                                                       |
| `renstra_kegiatan`          | Kegiatan Renstra OPD                                                                      |
| `renstra_subkegiatan`       | Sub Kegiatan Renstra OPD                                                                  |
| `indikator_renstra`         | Indikator Renstra OPD                                                                     |
| `renstra_target`            | Target Renstra per tahun                                                                  |
| `renstra_tabel_tujuan`      | Tabel tujuan dengan target & pagu 6 tahun                                                 |
| `renstra_tabel_sasaran`     | Tabel sasaran dengan target & pagu 6 tahun                                                |
| `renstra_tabel_program`     | Tabel program dengan target & pagu                                                        |
| `renstra_tabel_kegiatan`    | Tabel kegiatan dengan target & pagu                                                       |
| `renstra_tabel_subkegiatan` | Tabel sub kegiatan dengan target & pagu                                                   |

#### Tabel `renstra_tabel_tujuan` (Contoh Skema Detail)

```sql
id, tujuan_id, indikator_id, renstra_id,
target_tahun_1, target_tahun_2, target_tahun_3, target_tahun_4, target_tahun_5, target_tahun_6,
pagu_tahun_1, pagu_tahun_2, pagu_tahun_3, pagu_tahun_4, pagu_tahun_5, pagu_tahun_6,
lokasi, kode_tujuan, nama_tujuan,
target_akhir_renstra, pagu_akhir_renstra,
created_at, updated_at
```

#### Tabel Dokumen Lainnya

| Tabel           | Deskripsi                  |
| --------------- | -------------------------- |
| `rkpd`          | Data RKPD                  |
| `renja`         | Data Renja OPD             |
| `rka`           | Data RKA                   |
| `dpa`           | Data DPA                   |
| `bmd`           | Barang Milik Daerah        |
| `penatausahaan` | Data Penatausahaan         |
| `pengkeg`       | Pengelolaan Kegiatan       |
| `monev`         | Data Monitoring & Evaluasi |
| `lpk_dispang`   | LPK Dinas Pangan           |
| `lakip`         | Data LAKIP                 |

### Relasi Utama

```
users → roles (role_id → roles.id)
users → divisions (divisions_id → divisions.id)
renstra_opd → opd_penanggung_jawab (opd_id)
renstra_opd → periode_rpjmd (rpjmd_id)
renstra_tujuan → renstra_opd (renstra_id)
renstra_sasaran → renstra_tujuan (tujuan_id)
renstra_strategi → renstra_sasaran (sasaran_id)
renstra_kebijakan → renstra_strategi (strategi_id)
renstra_program → renstra_kebijakan (kebijakan_id? atau program_id dari RPJMD)
renstra_tabel_* → renstra_opd (renstra_id)
```

---

## 8. Backend — Autentikasi & Role

### Sistem JWT

- **Library:** `jsonwebtoken ^9.0.2`
- **Hash Password:** `bcryptjs ^3.0.2`
- **Token Storage (frontend):** `localStorage.getItem("token")`
- **Token Format:** Bearer token dalam header `Authorization: Bearer <token>`
- **Refresh Token:** Tersedia via `/api/auth/refresh-token`
- **Auto Refresh Interval:** Setiap 55 menit (di frontend `AuthProvider.jsx`)

### Payload JWT (Decoded)

```javascript
{
  id: number,         // user ID
  email: string,
  role: string,       // "SUPER_ADMIN" | "ADMINISTRATOR" | "PENGAWAS" | "PELAKSANA"
  jenis_dokumen: string,  // "rpjmd" | "renstra" | "rkpd" | "renja" | "rka" | "dpa" | ...
  tahun: string,      // Tahun dokumen aktif
  periode_id: number, // ID periode aktif
  exp: number         // Unix timestamp expiry
}
```

### Role Hierarchy

| Role            | Level         | Akses                            |
| --------------- | ------------- | -------------------------------- |
| `SUPER_ADMIN`   | 1 (tertinggi) | CRUD semua data + manajemen user |
| `ADMINISTRATOR` | 2             | CRUD data + sebagian manajemen   |
| `PENGAWAS`      | 3             | Read-only semua data             |
| `PELAKSANA`     | 4             | Read-only + input terbatas       |

### Middleware di Backend

```javascript
// backend/middlewares/verifyToken.js
// Memvalidasi Bearer token dari header Authorization

// backend/middlewares/allowRoles.js
// Contoh penggunaan:
router.get(
  "/",
  verifyToken,
  allowRoles(["SUPER_ADMIN", "ADMINISTRATOR", "PENGAWAS", "PELAKSANA"]),
  controller.getAll,
);
router.post(
  "/",
  verifyToken,
  allowRoles(["SUPER_ADMIN", "ADMINISTRATOR"]),
  controller.create,
);
router.delete(
  "/:id",
  verifyToken,
  allowRoles(["SUPER_ADMIN"]),
  controller.delete,
);
```

---

## 9. Frontend — Struktur Aplikasi

### Entry Point: `frontend/src/main.jsx`

```javascript
// Provider hierarchy di main.jsx:
<React.StrictMode>
  <QueryClientProvider client={queryClient}>
    {" "}
    // @tanstack/react-query
    <BrowserRouter>
      <AppRoot />
    </BrowserRouter>
  </QueryClientProvider>
</React.StrictMode>
```

### Root App: `frontend/src/App.jsx`

Provider hierarchy (dari luar ke dalam):

```
DokumenProvider                 ← Context dokumen + tahun aktif
  └── AntdApp (ConfigProvider)  ← Ant Design global config
       └── AuthProvider         ← Context autentikasi JWT
            └── AppContent      ← Guard: cek user + dokumen
                 └── PeriodeAktifProvider
                      └── InnerApp
                           └── Providers (Notification + Filter + Monev)
                                └── Routes
```

### Guard System

```javascript
// ProtectedRoute — redirect ke /login jika belum login
// GuestRoute — redirect ke dashboard jika sudah login
// DokumenTahunGuard — paksa pilih dokumen+tahun jika belum dipilih
// RequireDokumenType — redirect ke / jika dokumen tidak sesuai
```

---

## 10. Frontend — Modul Perencanaan (Fitur Utama)

### 10.1 Modul RPJMD (`features/rpjmd/`)

**Dashboard:** `/dashboard-rpjmd` → `DashboardUtamaRpjmd`

Sub-modul (via `config/routes.jsx`):

```
/rpjmd/visi          → Visi RPJMD (CRUD)
/rpjmd/misi          → Misi RPJMD (CRUD)
/rpjmd/tujuan        → Tujuan RPJMD (CRUD)
/rpjmd/sasaran       → Sasaran RPJMD (CRUD)
/rpjmd/strategi      → Strategi RPJMD (CRUD)
/rpjmd/arah-kebijakan → Arah Kebijakan RPJMD (CRUD)
/rpjmd/program       → Program RPJMD (CRUD)
/rpjmd/kegiatan      → Kegiatan RPJMD (CRUD)
/rpjmd/sub-kegiatan  → Sub Kegiatan RPJMD (CRUD)
/statistik           → Rekap Statistik / Keterkaitan RPJMD
/aktivitas           → Aktivitas Pengguna
/notifikasi          → Notifikasi & Deadline
/admin/users         → Manajemen User
/monev               → Dashboard Monev
/monev/input         → Input Realisasi
/monev/upload        → Upload Excel Realisasi
```

### 10.2 Modul Renstra OPD (`features/renstra/`)

**Dashboard:** `/dashboard-renstra` → `RenstraDashboard`
**Terbesar dan terkompleks** dalam sistem.

Sub-modul (via `routes/renstraRoutes.jsx`):

```
/renstra-opd                    → List Renstra OPD (pemilihan renstra aktif)
/renstra-opd/new                → Form tambah Renstra OPD
/renstra-opd/edit/:id           → Form edit Renstra OPD

-- Hierarki data Renstra --
/renstra/tujuan                 → List Tujuan Renstra
/renstra/tujuan/add             → Tambah Tujuan
/renstra/tujuan/edit/:id        → Edit Tujuan

/renstra/sasaran                → List Sasaran Renstra
/renstra/sasaran/add            → Tambah Sasaran
/renstra/sasaran/edit/:id       → Edit Sasaran

/renstra/strategi               → List Strategi Renstra
/renstra/strategi/add           → Tambah Strategi
/renstra/strategi/edit/:id      → Edit Strategi

/renstra/kebijakan              → List Kebijakan Renstra
/renstra/kebijakan/add          → Tambah Kebijakan
/renstra/kebijakan/edit/:id     → Edit Kebijakan

/renstra/program                → List Program Renstra
/renstra/program/add            → Tambah Program
/renstra/program/edit/:id       → Edit Program

/renstra/kegiatan               → List Kegiatan Renstra
/renstra/kegiatan/add           → Tambah Kegiatan
/renstra/kegiatan/edit/:id      → Edit Kegiatan

/renstra/subkegiatan            → List Sub Kegiatan Renstra
/renstra/subkegiatan/add        → Tambah Sub Kegiatan
/renstra/subkegiatan/edit/:id   → Edit Sub Kegiatan

-- Tabel & Target --
/renstra/tabel-tujuan/add       → Form tabel tujuan dengan target/pagu
/renstra/tabel-sasaran/add      → Form tabel sasaran
/renstra/tabel-program/add      → Form tabel program
/renstra/tabel-kegiatan/add     → Form tabel kegiatan
/renstra/tabel-subkegiatan/add  → Form tabel sub kegiatan

-- Indikator --
/renstra/indikator/tujuan       → Indikator Tujuan Renstra
/renstra/indikator/sasaran      → Indikator Sasaran Renstra
/renstra/indikator/kebijakan    → Indikator Kebijakan Renstra
/renstra/cascading              → Cascading view seluruh struktur
/renstra/:babId                 → Halaman bab dinamis (untuk dokumen formal)
```

### 10.3 Modul RKPD (`features/rkpd/`)

**Dashboard:** `/dashboard-rkpd` → `RkpdDashboard`

```
/dashboard-rkpd       → Dashboard RKPD
/dashboard-rkpd/form  → Form tambah/edit RKPD
```

### 10.4 Modul Renja (`features/renja/`)

**Dashboard:** `/dashboard-renja` → `RenjaDashboard`

### 10.5 Modul RKA (`features/rka/`)

**Dashboard:** `/dashboard-rka` → `RkaDashboard`

### 10.6 Modul DPA (`features/dpa/`)

**Dashboard:** `/dashboard-dpa` → `DpaDashboard`

### 10.7 Modul Monitoring & Evaluasi (`features/monev/`)

**Dashboard:** `/dashboard-monev` → `MonevDashboard`

```
/dashboard-monev        → Dashboard Monev
/monev/input            → Input realisasi
/monev/upload           → Upload Excel
/monev/laporan          → Laporan Monev
```

### 10.8 Modul Pelaporan

```
/dashboard-pengelolaan → PengkegDashboard (Pengelolaan Kegiatan)
/dashboard-lpk-dispang → LpkDispangDashboard
/dashboard-lk-dispang  → LkDashboard
/dashboard-lakip       → LakipDashboard
/clone-periode         → CloningData (kloning antar periode)
/clone-periode/hasil   → ClonedDataTable
```

### 10.9 Sidebar Global (`config/sidebarConfig.jsx`)

Sidebar dikonfigurasi berdasarkan `jenis_dokumen` yang aktif. Struktur grup:

- 📘 RPJMD / Renstra / RKPD (sesuai dokumen aktif)
- 📋 Data Perencanaan (Visi, Misi, Tujuan, Sasaran, Strategi, Kebijakan, Program, Kegiatan, Sub Kegiatan)
- 📊 Monitoring & Evaluasi (Dashboard Monev, Input Realisasi, Upload Excel)
- 📄 Pelaporan (LAKIP, LK, LPK, DPA, Pengelolaan Kegiatan)

---

## 11. Frontend — State Management & Context

### 11.1 AuthContext (`contexts/authContext.js` + `contexts/AuthProvider.jsx`)

**State yang dikelola:**

```javascript
{
  user: {
    id, name, email, role,
    jenis_dokumen,  // dokumen aktif user
    tahun,          // tahun dokumen aktif
    periode_id,     // ID periode aktif
    token           // JWT token
  },
  loading: boolean,     // true saat inisialisasi
  userReady: boolean,   // true setelah user di-set
}
```

**Fungsi yang disediakan:**

```javascript
login(userData); // Set user state + simpan token ke localStorage
logout(); // Hapus token + reset state
checkAuthStatus(); // Cek apakah token masih valid (exported utility)
setUser(); // Update user state
```

**Lifecycle:**

1. Saat mount: baca `token` dari `localStorage`, decode JWT, set user state
2. Jika token valid: coba `refreshToken()` untuk extend sesi
3. Jika token expired/invalid: `logout()` otomatis
4. Auto-refresh interval: setiap 55 menit selama user login

**PENTING untuk integrasi sigap-malut:**

- `AuthProvider` **WAJIB** berada di dalam `DokumenProvider`
- Memanggil `useDokumen()` secara internal — akan crash jika DokumenProvider tidak ada

### 11.2 DokumenContext (`contexts/DokumenContext.jsx` + `contexts/DokumenProvider.jsx`)

**State yang dikelola:**

```javascript
{
  dokumen: string,  // "rpjmd" | "renstra" | "rkpd" | "renja" | "rka" | "dpa" | "monev" | dll
  tahun: string,    // Tahun dokumen aktif, e.g. "2025"
}
```

**Storage:**

```javascript
// Read priority: sessionStorage > localStorage
sessionStorage.getItem("dokumenTujuan"); // dokumen
sessionStorage.getItem("tahun"); // tahun
localStorage.getItem("dokumen");
localStorage.getItem("tahun");
```

**Fungsi:**

```javascript
setDokumen(value); // Set dokumen + update storage
setTahun(value); // Set tahun + update storage
resetDokumen(); // Clear semua
```

### 11.3 @tanstack/react-query (Server State)

Semua fetch data ke API menggunakan `useQuery` dan `useMutation`:

```javascript
// Pattern standar di setiap komponen form:
const { data, isLoading } = useQuery({
  queryKey: ["nama-data", dependencyId],
  queryFn: async () => {
    const res = await api.get("/endpoint");
    return res.data;
  },
  enabled: !!dependencyId,
});

const mutation = useMutation({
  mutationFn: (payload) => api.post("/endpoint", payload),
  onSuccess: () => {
    queryClient.invalidateQueries(["nama-data"]);
    message.success("Berhasil disimpan");
  },
});
```

**QueryClient** di-setup di `main.jsx` dan di-wrap seluruh aplikasi.

### 11.4 Axios Instance (`services/api.js`)

```javascript
// Axios instance dengan:
// - baseURL dari import.meta.env.VITE_API_URL
// - interceptor: otomatis tambahkan Authorization header dari localStorage
// - interceptor response: handle 401 (redirect ke login)
```

---

## 12. Frontend — Pola Form (Shared Pattern)

### 12.1 Hook Template Universal: `useRenstraFormTemplate`

Semua form di modul Renstra menggunakan hook ini sebagai template. Fiturnya:

- Setup `useForm` (react-hook-form) dengan `yupResolver`
- Setup `useMutation` (@tanstack/react-query) untuk submit
- Auto-reset form saat `initialData` berubah
- Auto-navigate setelah sukses
- Error handling terpusat via `message` (Ant Design)

```javascript
// Cara pakai:
const { form, methods, isLoading, isSubmitting } = useRenstraFormTemplate({
  initialData,           // Data untuk mode edit
  renstraAktif,          // Renstra OPD yang aktif
  endpoint: "/renstra-tujuan",
  schema: yupSchema,     // Bisa function atau object
  defaultValues: { ... },
  generatePayload: (data) => ({ ... }),  // Transform data sebelum submit
  queryKeys: ["renstra-tujuan"],         // Keys untuk invalidasi cache
  redirectPath: "/renstra/tujuan",
  onSuccess: () => { ... },             // Optional callback
  onError: (err) => { ... }             // Optional callback
});
```

### 12.2 Shared Form Components (`shared/components/form/`)

Komponen reusable yang menggunakan Ant Design + react-hook-form `Controller`:

| Komponen               | Deskripsi                                          |
| ---------------------- | -------------------------------------------------- |
| `InputField`           | `antd Input` yang ter-wrapping dengan `Controller` |
| `TextAreaField`        | `antd Input.TextArea` dengan Controller            |
| `SelectWithLabelValue` | `antd Select` dengan opsi `{ label, value }`       |

**Cara pakai:**

```jsx
// Semua komponen ini membutuhkan:
// - control: dari useForm()
// - name: nama field
// - errors: dari formState.errors

<InputField name="nama_tujuan" label="Nama Tujuan" control={form.control} errors={form.formState.errors} />
<SelectWithLabelValue name="tujuan_id" label="Tujuan" control={form.control} options={tujuanOptions} errors={form.formState.errors} />
```

### 12.3 Validasi: Yup Schema Pattern

```javascript
const schema = Yup.object().shape({
  tujuan_id: Yup.string().required("Tujuan Renstra wajib dipilih"),
  rpjmd_tujuan_id: Yup.number().typeError("...").required("..."),
  nomor: Yup.string().nullable(),
  renstra_id: Yup.number().required("Renstra wajib dipilih"),
});
```

---

## 13. Frontend — Routing

### Konfigurasi Route Utama (`App.jsx`)

```
/login          → <Login /> (GuestRoute)
/register       → <Register /> (GuestRoute)
/               → <DashboardLayoutGlobal /> (ProtectedRoute)
  ├── index     → <DashboardHome />
  ├── dashboard-rpjmd   → <DashboardUtamaRpjmd />
  ├── dashboard-renstra → <DashboardLayout><RenstraDashboard /></DashboardLayout>
  ├── dashboard-rkpd    → <RkpdDashboard />
  ├── dashboard-renja   → <RenjaDashboard />
  ├── dashboard-rka     → <RkaDashboard />
  ├── dashboard-dpa     → <DpaDashboard />
  ├── dashboard-monev   → <MonevDashboard />
  ├── dashboard-pengelolaan → <PengkegDashboard />
  ├── dashboard-lpk-dispang → <LpkDispangDashboard />
  ├── dashboard-lk-dispang  → <LkDashboard />
  ├── dashboard-lakip       → <LakipDashboard />
  ├── clone-periode         → <CloningData />
  ├── clone-periode/hasil   → <ClonedDataTable />
  ├── ...rpjmdRoutes        → (dari config/routes.jsx)
  └── ...renstraRoutes      → (dari routes/renstraRoutes.jsx)
```

### Guard `RequireDokumenType`

Setiap dashboard dilindungi:

```jsx
<RequireDokumenType dokType="renstra">
  <RenstraDashboard />
</RequireDokumenType>
```

Jika `dokumen !== "renstra"`, redirect ke `/`.

### Guard `DokumenTahunGuard`

Jika user belum memilih dokumen+tahun, tampilkan modal paksa `GlobalDokumenTahunPickerModal`.

### Lazy Loading

Semua halaman menggunakan `React.lazy()` untuk code-splitting:

```javascript
const ListRenstraOPD = React.lazy(
  () => import("../features/renstra/pages/ListRenstraOPD"),
);
```

---

## 14. Perbandingan Stack: e-Pelara vs sigap-malut

| Aspek                | e-Pelara                            | sigap-malut                      | Kompatibel?                     |
| -------------------- | ----------------------------------- | -------------------------------- | ------------------------------- |
| **React Version**    | 18.2.0                              | 19.2.0                           | ⚠️ Berbeda minor                |
| **Build Tool**       | Vite 5.2.8                          | Vite 7.3.1                       | ✅ Kompatibel                   |
| **Router**           | react-router-dom v6                 | react-router-dom v7              | ⚠️ API berubah                  |
| **HTTP Client**      | axios                               | axios                            | ✅ Sama                         |
| **State Management** | Context API + @tanstack/react-query | Zustand + Context API            | ❌ Berbeda                      |
| **CSS Framework**    | Tailwind + Bootstrap                | Tailwind                         | ⚠️ Bootstrap perlu ditambah     |
| **UI Components**    | Ant Design 5                        | Tidak ada AntD                   | ❌ Berbeda                      |
| **Form Library**     | react-hook-form + Yup               | Tidak ada                        | ❌ Perlu install                |
| **Charting**         | Recharts + Chart.js                 | Chart.js + Recharts              | ✅ Sama                         |
| **Backend Runtime**  | Node.js + Express 5                 | Node.js + Express 4              | ⚠️ Minor                        |
| **ORM**              | Sequelize (MySQL)                   | Sequelize (SQLite/PostgreSQL)    | ⚠️ Dialect berbeda              |
| **Auth Method**      | JWT (jsonwebtoken)                  | JWT (jsonwebtoken)               | ✅ Sama                         |
| **Token Storage**    | localStorage (`token`)              | localStorage (`token`, `access`) | ✅ Kompatibel                   |
| **Real-time**        | Socket.IO                           | Tidak ada                        | ❌ Perlu install di sigap-malut |

### Library yang Perlu Diinstall di sigap-malut jika Transplant

```bash
cd frontend
npm install antd @ant-design/icons react-hook-form @hookform/resolvers yup \
  @tanstack/react-query react-bootstrap bootstrap \
  react-toastify react-hot-toast \
  socket.io-client jwt-decode \
  recharts dayjs nprogress \
  react-bootstrap-icons react-icons
```

---

## 15. Strategi Integrasi ke sigap-malut

### Strategi yang Direkomendasikan: Iframe Embed + Token Bridge

Pendekatan ini mempertahankan kedua sistem berjalan mandiri, lalu meng-embed e-pelara ke dalam sigap-malut melalui `<iframe>` dengan mekanisme SSO (Single Sign-On) berbasis `postMessage`.

#### File yang Perlu Dibuat di sigap-malut

**1. Halaman wrapper embed (`frontend/src/pages/PerencanaanPage.jsx`):**

```jsx
import React, { useRef, useEffect } from "react";
import useAuthStore from "../stores/authStore";

export default function PerencanaanPage() {
  const token = useAuthStore((state) => state.token);
  const iframeRef = useRef(null);
  const ePelaraUrl =
    import.meta.env.VITE_EPELARA_URL || "http://localhost:3001";

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !token) return;

    const handleLoad = () => {
      iframe.contentWindow.postMessage(
        { type: "SSO_TOKEN", token },
        ePelaraUrl,
      );
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [token, ePelaraUrl]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      <div className="flex-none px-4 py-2 bg-green-800 text-white text-sm font-medium">
        📋 Modul Perencanaan — e-Pelara (RPJMD · Renstra · RKPD · Renja · Monev)
      </div>
      <iframe
        ref={iframeRef}
        src={ePelaraUrl}
        className="flex-1 w-full border-0"
        title="Sistem Perencanaan e-Pelara"
      />
    </div>
  );
}
```

**2. Route di `frontend/src/App.jsx` sigap-malut:**

```jsx
import PerencanaanPage from "./pages/PerencanaanPage";
// Di dalam <Routes>:
<Route path="/perencanaan/*" element={<PerencanaanPage />} />;
```

**3. Menu di layout sidebar sigap-malut:**

```javascript
// Tambahkan di array menu sidebar yang relevan:
{
  label: "Perencanaan",
  path: "/perencanaan",
  icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
  description: "RPJMD, Renstra, RKPD, Renja, Monev"
}
```

**4. Variabel environment (`frontend/.env`):**

```env
VITE_EPELARA_URL=http://localhost:3001
```

#### Konfigurasi CORS di e-Pelara (`backend/server.js`):

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173", // sigap-malut dev
      "https://sigap-malut.go.id", // sigap-malut production
    ],
    credentials: true,
  }),
);
```

---

## 16. Panduan SSO (Single Sign-On)

### Opsi A: Shared JWT Secret (Direkomendasikan)

Samakan `JWT_SECRET` di kedua backend:

```env
# e-pelara/backend/.env
JWT_SECRET=kunci_rahasia_bersama_sigap_epelara_2026

# sigap-malut/backend/.env
JWT_SECRET=kunci_rahasia_bersama_sigap_epelara_2026
```

**Cara kerjanya:**

1. User login di sigap-malut → dapat JWT dengan secret bersama
2. Token dikirim ke e-pelara via `postMessage`
3. e-pelara mem-verifikasi token menggunakan secret yang sama → valid
4. User otomatis ter-autentikasi di e-pelara

### Opsi B: Token Receiver di e-Pelara

Tambahkan listener di `main.jsx` atau `AuthProvider.jsx` e-pelara:

```javascript
// Di frontend/src/main.jsx e-pelara:
window.addEventListener("message", (event) => {
  // Validasi origin — hanya terima dari sigap-malut
  const allowedOrigins = ["http://localhost:5173", "https://sigap-malut.go.id"];
  if (!allowedOrigins.includes(event.origin)) return;

  if (event.data?.type === "SSO_TOKEN" && event.data?.token) {
    localStorage.setItem("token", event.data.token);
    // Trigger refresh halaman untuk inisialisasi ulang auth
    window.location.reload();
  }
});
```

### Mapping Role: sigap-malut → e-Pelara

| Role sigap-malut         | Role e-Pelara   | Keterangan             |
| ------------------------ | --------------- | ---------------------- |
| `super_admin`            | `SUPER_ADMIN`   | Full akses perencanaan |
| `kadis` / `kepala_dinas` | `PENGAWAS`      | Read-only              |
| `sekretaris`             | `ADMINISTRATOR` | CRUD perencanaan       |
| `kepala_bidang_*`        | `ADMINISTRATOR` | CRUD bidangnya         |
| Lainnya                  | `PELAKSANA`     | Read + input terbatas  |

---

## 17. Checklist Integrasi untuk Copilot

> **Instruksi untuk GitHub Copilot:** Gunakan checklist ini sebagai panduan saat melakukan integrasi e-pelara ke sigap-malut. Setiap item harus diselesaikan secara berurutan.

### Fase 1 — Persiapan (Backend)

- [ ] **1.1** Samakan `JWT_SECRET` di `e-pelara/backend/.env` dan `sigap-malut/backend/.env`
- [ ] **1.2** Tambahkan origin sigap-malut ke konfigurasi CORS di `e-pelara/backend/server.js`
- [ ] **1.3** Pastikan e-pelara backend berjalan di port yang tidak konflik dengan sigap-malut
- [ ] **1.4** Verifikasi endpoint `/api/auth/refresh-token` e-pelara dapat diakses

### Fase 2 — Frontend sigap-malut

- [ ] **2.1** Buat file `frontend/src/pages/PerencanaanPage.jsx` (lihat contoh di Bagian 15)
- [ ] **2.2** Tambahkan route `/perencanaan/*` di `frontend/src/App.jsx`
- [ ] **2.3** Tambahkan menu "Perencanaan" di layout sidebar yang relevan (DashboardSekretariatLayout, dll)
- [ ] **2.4** Tambahkan `VITE_EPELARA_URL` ke `frontend/.env` dan `frontend/.env.production`
- [ ] **2.5** Implementasikan `postMessage` token bridge (lihat Bagian 16)

### Fase 3 — Frontend e-Pelara

- [ ] **3.1** Tambahkan `window.addEventListener("message", ...)` untuk menerima SSO token
- [ ] **3.2** Validasi origin hanya dari sigap-malut
- [ ] **3.3** Pastikan `AuthProvider` dapat menerima token dari external

### Fase 4 — Testing & QA

- [ ] **4.1** Test SSO: login di sigap-malut → e-pelara otomatis ter-login
- [ ] **4.2** Test logout terpadu: logout di sigap-malut → e-pelara juga logout
- [ ] **4.3** Test akses menu Perencanaan dari berbagai role sigap-malut
- [ ] **4.4** Verifikasi semua modul e-pelara dapat diakses via iframe

### Fase 5 — Production

- [ ] **5.1** Konfigurasi Nginx reverse proxy untuk kedua aplikasi
- [ ] **5.2** Set `VITE_EPELARA_URL` ke URL production e-pelara
- [ ] **5.3** Update CORS origin di e-pelara backend ke URL production sigap-malut
- [ ] **5.4** Test end-to-end di environment production

---

## Referensi File Kunci e-Pelara

| File                                                                                                                                                                                      | Deskripsi                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| [`backend/server.js`](https://github.com/fahmialhabsi/e-pelara/blob/main/backend/server.js)                                                                                               | Entry point backend — semua route    |
| [`backend/package.json`](https://github.com/fahmialhabsi/e-pelara/blob/main/backend/package.json)                                                                                         | Dependencies backend                 |
| [`frontend/src/main.jsx`](https://github.com/fahmialhabsi/e-pelara/blob/main/frontend/src/main.jsx)                                                                                       | Entry point frontend                 |
| [`frontend/src/App.jsx`](https://github.com/fahmialhabsi/e-pelara/blob/main/frontend/src/App.jsx)                                                                                         | Root routing + Provider chain        |
| [`frontend/src/contexts/AuthProvider.jsx`](https://github.com/fahmialhabsi/e-pelara/blob/main/frontend/src/contexts/AuthProvider.jsx)                                                     | Autentikasi JWT + auto-refresh       |
| [`frontend/src/contexts/DokumenProvider.jsx`](https://github.com/fahmialhabsi/e-pelara/blob/main/frontend/src/contexts/DokumenProvider.jsx)                                               | State dokumen + tahun aktif          |
| [`frontend/src/hooks/templatesUseRenstra/useRenstraFormTemplate.js`](https://github.com/fahmialhabsi/e-pelara/blob/main/frontend/src/hooks/templatesUseRenstra/useRenstraFormTemplate.js) | Template hook universal form Renstra |
| [`frontend/src/routes/renstraRoutes.jsx`](https://github.com/fahmialhabsi/e-pelara/blob/main/frontend/src/routes/renstraRoutes.jsx)                                                       | Semua route modul Renstra            |
| [`frontend/src/config/routes.jsx`](https://github.com/fahmialhabsi/e-pelara/blob/main/frontend/src/config/routes.jsx)                                                                     | Route RPJMD & umum                   |
| [`frontend/src/services/api.js`](https://github.com/fahmialhabsi/e-pelara/blob/main/frontend/src/services/api.js)                                                                         | Axios instance dengan interceptor    |
| [`frontend/package.json`](https://github.com/fahmialhabsi/e-pelara/blob/main/frontend/package.json)                                                                                       | Dependencies frontend                |
| [`db_epelara.sql`](https://github.com/fahmialhabsi/e-pelara/blob/main/db_epelara.sql)                                                                                                     | Dump database MySQL lengkap          |
| [`docker-compose.yml`](https://github.com/fahmialhabsi/e-pelara/blob/main/docker-compose.yml)                                                                                             | Konfigurasi Docker deployment        |

---

_Dokumen ini dihasilkan secara otomatis berdasarkan analisis kode sumber e-pelara pada 2026-03-20._
_Untuk update, jalankan ulang analisis terhadap repo: https://github.com/fahmialhabsi/e-pelara_
