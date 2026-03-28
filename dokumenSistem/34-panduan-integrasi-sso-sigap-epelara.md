# 34 — Panduan Integrasi SSO & API: SIGAP-MALUT ↔ e-Pelara

Versi: 1.0  
Tanggal: 23 Maret 2026  
Status: **FINAL — Siap Implementasi**  
Penulis: Tim SIGAP Malut  
Tujuan: Dokumen pedoman lengkap bagi tim pengembang untuk mengimplementasikan integrasi Single Sign-On (SSO) dan konsumsi data antara SIGAP-MALUT dan e-Pelara, berdasarkan keputusan arsitektur P22–P24 dan Q1–Q3.

---

## Daftar Isi

1. [Latar Belakang & Tujuan](#1-latar-belakang--tujuan)
2. [Keputusan Arsitektur yang Terkunci](#2-keputusan-arsitektur-yang-terkunci)
3. [Arsitektur Runtime: Dua Server, Satu Token](#3-arsitektur-runtime-dua-server-satu-token)
4. [Peta File yang Diubah](#4-peta-file-yang-diubah)
5. [P22 — JWT_SECRET: Penggantian Wajib](#5-p22--jwt_secret-penggantian-wajib)
6. [P24 — Transparent Role Translation](#6-p24--transparent-role-translation)
7. [P23 — Periode/Tahun: Manual Picker](#7-p23--periodetahun-manual-picker)
8. [Q1 — SSO Opsi A: Mekanisme Token Sharing](#8-q1--sso-opsi-a-mekanisme-token-sharing)
9. [Q2 — Database Tetap Beda: Integrasi via API](#9-q2--database-tetap-beda-integrasi-via-api)
10. [Q3 — Data e-Pelara yang Dikonsumsi SIGAP](#10-q3--data-e-pelara-yang-dikonsumsi-sigap)
11. [Checklist Implementasi Berurutan](#11-checklist-implementasi-berurutan)
12. [Panduan Keamanan Wajib](#12-panduan-keamanan-wajib)

---

## 1. Latar Belakang & Tujuan

**SIGAP-MALUT** adalah sistem operasional pemerintahan (task management, absensi, kepegawaian, SKP, KGB) yang digunakan oleh 15 role pegawai Dinas Pangan Provinsi Maluku Utara.

**e-Pelara** adalah sistem perencanaan dokumen (RPJMD, Renstra, Renja, RKA, DPA, Monev, LAKIP) yang digunakan untuk siklus perencanaan program pemerintah daerah.

**Tujuan integrasi:**
- User cukup login sekali di SIGAP → token berlaku di e-Pelara (SSO)
- SIGAP dapat mengkonsumsi data perencanaan dari e-Pelara (visi/misi, program prioritas, target kegiatan, realisasi Monev)
- Tidak ada perubahan masif di kedua sistem — **minimal disruption, maksimal manfaat**

---

## 2. Keputusan Arsitektur yang Terkunci

| ID | Keputusan | Detail |
|---|---|---|
| **P22** | JWT_SECRET wajib diganti | Secret lama (`rahasia_RPJMD_aman`) sudah bocor ke GitHub publik — ganti sebelum coding apapun |
| **P23** | Periode/tahun dipilih manual | Tidak ada periode di JWT SIGAP; e-Pelara menampilkan `GlobalDokumenTahunPickerModal` otomatis saat user pertama kali masuk |
| **P24** | Transparent role translation | `verifyToken.js` e-Pelara menerjemahkan 15 role SIGAP → 4 role e-Pelara sebelum diteruskan ke route handler. **72 route file e-Pelara tidak disentuh sama sekali.** |
| **Q1** | SSO Opsi A — JWT shared secret | User login di SIGAP → 1 JWT → berlaku di e-Pelara via secret yang sama |
| **Q2** | Database tetap beda | MySQL (e-Pelara) dan PostgreSQL (SIGAP) tidak digabung; integrasi hanya lewat REST API |
| **Q3** | Data e-Pelara dikonsumsi SIGAP | Visi, Misi, Program Prioritas, Renstra→SubKegiatan (hierarki lengkap), Monev realisasi, LAKIP |

---

## 3. Arsitektur Runtime: Dua Server, Satu Token

```
[BROWSER USER]
     │
     │ Login → POST /api/auth/login
     ▼
┌─────────────────────────────────────┐
│  SIGAP-MALUT BACKEND                │
│  Port: 5000   DB: PostgreSQL        │
│  JWT_SECRET = [shared_secret_baru]  │
│                                     │
│  Payload JWT yang dibuat SIGAP:     │
│  {                                  │
│    id, email,                       │
│    role: "KEPALA_DINAS",  ← 15 role │
│    unit_kerja, nama                 │
│  }                                  │
└──────────────┬──────────────────────┘
               │  Bearer Token (JWT)
               │  dikirim ke e-Pelara
               ▼
┌─────────────────────────────────────┐
│  e-PELARA BACKEND                   │
│  Port: 3000   DB: MySQL             │
│  JWT_SECRET = [shared_secret_baru]  │  ← SAMA dengan SIGAP
│                                     │
│  verifyToken.js:                    │
│  1. Verifikasi tanda tangan JWT     │
│  2. Translate role SIGAP→e-Pelara   │
│     "KEPALA_DINAS" → "ADMINISTRATOR"│
│  3. req.user.role = "ADMINISTRATOR" │
│     (dipakai seluruh route e-Pelara)│
│  4. req.user.role_original tersedia │
│     (untuk audit trail jika perlu)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  e-PELARA FRONTEND (Vite port 3001) │
│  GlobalDokumenTahunPickerModal      │
│  tampil otomatis saat dokumen       │
│  belum dipilih (P23)                │
└─────────────────────────────────────┘
```

**Infrastruktur yang berjalan secara paralel:**

| Komponen | Port Dev | Port Prod | Catatan |
|---|---|---|---|
| SIGAP Frontend (Vite) | 5173 | 80/443 via Nginx | |
| SIGAP Backend (Express) | 5000 | 5000 | |
| e-Pelara Frontend (Vite) | 3001 | 80/443 via Nginx | |
| e-Pelara Backend (Express) | 3000 | 3000 | |
| PostgreSQL (SIGAP) | 5432 | 5432 | |
| MySQL (e-Pelara) | 3306 | 3306 | |

---

## 4. Peta File yang Diubah

### File yang DIUBAH (total 5 file saja)

| Sistem | File | Jenis Perubahan |
|---|---|---|
| e-Pelara | `backend/.env` | Ganti `JWT_SECRET` dan `JWT_REFRESH_SECRET` |
| e-Pelara | `backend/middlewares/verifyToken.js` | Tambah role translation mapping |
| e-Pelara | `backend/middlewares/allowRoles.js` | Perbaiki bug cookie vs header |
| SIGAP | `backend/.env` | Ganti `JWT_SECRET` (nilai SAMA dengan e-Pelara) |
| SIGAP | `frontend/src/` | Tambah komponen `BukaEPelaraButton.jsx` |

### File BARU yang ditambah di SIGAP (untuk Q3 — consume data perencanaan)

| File | Fungsi |
|---|---|
| `backend/services/ePelaraService.js` | Axios client ke API e-Pelara |
| `backend/controllers/ePelaraController.js` | Handler endpoint proxy |
| `backend/routes/ePelaraRoutes.js` | Route `/api/epelara/...` di SIGAP |
| `frontend/src/features/perencanaan/` | Halaman tampil data perencanaan dari e-Pelara |
| `frontend/src/shared/components/BukaEPelaraButton.jsx` | Tombol SSO ke e-Pelara |

### File yang TIDAK DISENTUH sama sekali

- Semua 72 route files e-Pelara ✅
- Semua 66 model files e-Pelara ✅
- Seluruh frontend e-Pelara ✅
- Seluruh logic auth SIGAP yang sudah ada ✅

---

## 5. P22 — JWT_SECRET: Penggantian Wajib

### Mengapa ini darurat

File `e-pelara/backend/.env` masuk ke Git commit history dengan:
```
JWT_SECRET=rahasia_RPJMD_aman   ← SUDAH BOCOR ke GitHub publik
```
Siapapun bisa membuat token palsu dengan secret ini dan mendapat akses penuh ke sistem.

### Cara generate secret yang aman

```bash
# Jalankan di terminal Node.js:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Atau via PowerShell:
[System.BitConverter]::ToString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64)).Replace('-','').ToLower()
```

### Update file .env

**`e-pelara/backend/.env`** — ubah:
```env
JWT_SECRET=<hasil_generate_128_karakter_hex>
JWT_REFRESH_SECRET=<generate_terpisah_128_karakter_hex>
```

**`sigap-malut/backend/.env`** — tambah/update:
```env
JWT_SECRET=<NILAI_SAMA_PERSIS_dengan_e-Pelara>
```

### Pastikan .gitignore melindungi .env

```gitignore
# Wajib ada di kedua repo:
.env
.env.local
.env.production
node_modules/
uploads/
```

---

## 6. P24 — Transparent Role Translation

### Filosofi desain

> e-Pelara menggunakan 4 role generik yang sesuai untuk sistem dokumen perencanaan. SIGAP menggunakan 15 role yang spesifik untuk operasional kepegawaian. **Kedua hierarki ini benar dalam konteksnya masing-masing** — yang diperlukan hanyalah translator di boundary.

### Tabel mapping final (sumber kebenaran tunggal)

| Role SIGAP (15) | → Role e-Pelara (4) | Alasan Bisnis |
|---|---|---|
| `SUPER_ADMIN` | `SUPER_ADMIN` | Identik — akses penuh |
| `KEPALA_DINAS` | `ADMINISTRATOR` | Approve & input dokumen perencanaan |
| `GUBERNUR` | `PENGAWAS` | Read-only semua dokumen |
| `SEKRETARIS` | `ADMINISTRATOR` | Input & koordinasi dokumen perencanaan |
| `KASUBAG_UMUM_KEPEGAWAIAN` | `PELAKSANA` | Input terbatas (RKA/DPA/Renja sekretariat) |
| `PEJABAT_FUNGSIONAL` | `PELAKSANA` | Input data teknis bidang |
| `BENDAHARA` | `PELAKSANA` | Fokus RKA/DPA/Penatausahaan |
| `PELAKSANA` | `PELAKSANA` | Input terbatas sesuai unit |
| `KEPALA_BIDANG_KETERSEDIAAN` | `ADMINISTRATOR` | Input Renstra/Renja bidang ketersediaan |
| `KEPALA_BIDANG_DISTRIBUSI` | `ADMINISTRATOR` | Input Renstra/Renja bidang distribusi |
| `KEPALA_BIDANG_KONSUMSI` | `ADMINISTRATOR` | Input Renstra/Renja bidang konsumsi |
| `KEPALA_UPTD` | `ADMINISTRATOR` | Input data perencanaan UPTD |
| `KASUBAG_UPTD` | `PELAKSANA` | Input terbatas lingkup UPTD |
| `KEPALA_SEKSI_UPTD` | `PELAKSANA` | Input terbatas lingkup seksi UPTD |
| `VIEWER` | `PENGAWAS` | Read-only semua dokumen |

### Implementasi di `verifyToken.js` e-Pelara

Perubahan minimal: hanya menambahkan blok mapping setelah `jwt.verify()`:

```js
// Tambahkan di atas fungsi verifyToken:
const SIGAP_TO_EPELARA_ROLE = {
  SUPER_ADMIN:                  'SUPER_ADMIN',
  KEPALA_DINAS:                 'ADMINISTRATOR',
  GUBERNUR:                     'PENGAWAS',
  SEKRETARIS:                   'ADMINISTRATOR',
  KASUBAG_UMUM_KEPEGAWAIAN:     'PELAKSANA',
  PEJABAT_FUNGSIONAL:           'PELAKSANA',
  BENDAHARA:                    'PELAKSANA',
  PELAKSANA:                    'PELAKSANA',
  KEPALA_BIDANG_KETERSEDIAAN:   'ADMINISTRATOR',
  KEPALA_BIDANG_DISTRIBUSI:     'ADMINISTRATOR',
  KEPALA_BIDANG_KONSUMSI:       'ADMINISTRATOR',
  KEPALA_UPTD:                  'ADMINISTRATOR',
  KASUBAG_UPTD:                 'PELAKSANA',
  KEPALA_SEKSI_UPTD:            'PELAKSANA',
  VIEWER:                       'PENGAWAS',
};

// Di dalam try{} setelah jwt.verify():
const rawRole = (decoded.role || '').trim().toUpperCase();
const translatedRole = SIGAP_TO_EPELARA_ROLE[rawRole] || rawRole;

req.user = {
  id: decoded.id,
  username: decoded.username || decoded.nama || decoded.email,
  email: decoded.email,
  role: translatedRole,        // ← dipakai seluruh sistem e-Pelara
  role_original: rawRole,      // ← role asli SIGAP, tersimpan untuk audit
  role_id: decoded.role_id,
  divisions_id: decoded.divisions_id,
  opd: decoded.opd,
  tahun: decoded.tahun,
  periode_id: decoded.periode_id,
};
```

### Perbaikan bug di `allowRoles.js` e-Pelara

Bug: `allowRoles` hanya baca dari header `Authorization: Bearer`, **tidak mendukung cookie**. Padahal `verifyToken` mendukung keduanya — inkonsistensi ini menyebabkan request via cookie gagal di route dengan `allowRoles`.

```js
// Ganti bagian pembacaan token di dalam closure allowRoles:
// SEBELUM (hanya header):
const authHeader = req.header('Authorization');
if (!authHeader || !authHeader.startsWith('Bearer ')) { ... }
const token = authHeader.replace('Bearer ', '');

// SESUDAH (cookie + header):
const token =
  req.cookies?.token ||
  (req.header('Authorization')?.startsWith('Bearer ')
    ? req.header('Authorization').replace('Bearer ', '')
    : null);
if (!token) {
  return res.status(401).json({ message: 'Token tidak ditemukan atau salah format.' });
}
```

---

## 7. P23 — Periode/Tahun: Manual Picker

### Tidak ada perubahan kode di e-Pelara

`GlobalDokumenTahunPickerModal` **sudah berfungsi** dengan logika:
```
show = forceOpen || !dokumen || !tahun
```

Artinya: saat user dari SIGAP masuk ke e-Pelara dengan token yang valid tetapi belum punya context dokumen, modal picker **otomatis muncul**.

### Alur yang terjadi saat SSO pertama kali

```
1. User klik "Buka e-Pelara" di SIGAP
2. Browser buka tab baru e-Pelara dengan token di URL: ?token=<jwt>
3. AuthProvider e-Pelara decode JWT → set user (tapi dokumen/tahun null)
4. GlobalDokumenTahunPickerModal show = true (karena !dokumen || !tahun)
5. User pilih: jenis_dokumen = "renstra", tahun = "2026"
6. DokumenContext tersimpan di sessionStorage
7. Navigate ke /dashboard-renstra
8. Semua API call e-Pelara menggunakan context { dokumen: "renstra", tahun: "2026" }
```

### Yang perlu diverifikasi saat testing

- [ ] `user.token` tersedia di `localStorage` setelah redirect dari SIGAP
- [ ] `AuthProvider` e-Pelara berhasil decode JWT SIGAP (secret sama)
- [ ] Picker modal muncul otomatis jika dokumen belum dipilih
- [ ] Setelah pilih dokumen, navigasi ke dashboard yang sesuai berjalan normal

---

## 8. Q1 — SSO Opsi A: Mekanisme Token Sharing

### Alur lengkap

```
1. User login di SIGAP
   POST /api/auth/login → { token, user }
   localStorage.setItem('token', token)

2. User klik tombol "Buka e-Pelara" di SIGAP frontend

3. SIGAP buka tab baru e-Pelara dengan token:
   const EPELARA_URL = import.meta.env.VITE_EPELARA_URL
   window.open(`${EPELARA_URL}?token=${token}`, '_blank', 'noopener,noreferrer')

4. e-Pelara frontend (App.jsx atau AuthProvider) baca token dari URL:
   const urlToken = new URLSearchParams(window.location.search).get('token')
   if (urlToken) {
     localStorage.setItem('token', urlToken)
     // Bersihkan URL setelah menyimpan token
     window.history.replaceState({}, '', window.location.pathname)
   }

5. AuthProvider e-Pelara decode JWT:
   - Jika valid → set user context → DokumenContext kosong → picker modal muncul
   - Jika tidak valid → redirect ke /login e-Pelara

6. User pilih dokumen + tahun → masuk dashboard e-Pelara
```

### Komponen baru di SIGAP frontend

```jsx
// frontend/src/shared/components/BukaEPelaraButton.jsx
import { useAuthStore } from '../../store/authStore';

export default function BukaEPelaraButton({ className }) {
  const token = useAuthStore((s) => s.token);
  const EPELARA_URL = import.meta.env.VITE_EPELARA_URL || 'http://localhost:3001';

  if (!token) return null;

  const handleClick = () => {
    // ⚠️ Token via URL hanya aman di localhost atau HTTPS
    // Untuk production: gunakan short-lived exchange token (lihat Bagian 12)
    window.open(
      `${EPELARA_URL}?token=${token}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <button onClick={handleClick} className={className}>
      📋 Buka e-Pelara
    </button>
  );
}
```

### Environment variable frontend SIGAP

```env
# sigap-malut/frontend/.env
VITE_EPELARA_URL=http://localhost:3001
# Production:
# VITE_EPELARA_URL=https://epelara.malukuutara.go.id
```

---

## 9. Q2 — Database Tetap Beda: Integrasi via API

### Prinsip arsitektur

```
SIGAP FRONTEND
    │  fetch /api/epelara/visi
    ▼
SIGAP BACKEND (PostgreSQL)
    │  axios GET http://localhost:3000/api/visi
    │  Header: Authorization: Bearer <token>
    ▼
e-PELARA BACKEND (MySQL db_epelara)
    │  Sequelize query
    ▼
Data visi RPJMD
```

**SIGAP tidak pernah terhubung langsung ke MySQL e-Pelara.**

### Service layer di SIGAP backend

```js
// backend/services/ePelaraService.js
import axios from 'axios';

const client = axios.create({
  baseURL: process.env.EPELARA_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

export const fetchFromEPelara = async (endpoint, token) => {
  const { data } = await client.get(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
```

### Environment variable backend SIGAP

```env
# sigap-malut/backend/.env — tambahkan:
EPELARA_API_URL=http://localhost:3000
# Production:
# EPELARA_API_URL=http://epelara-backend:3000
```

---

## 10. Q3 — Data e-Pelara yang Dikonsumsi SIGAP

### Daftar endpoint yang dikonsumsi SIGAP

| Data | Endpoint e-Pelara | Digunakan di SIGAP untuk |
|---|---|---|
| **Visi RPJMD** | `GET /api/visi` | Menampilkan visi gubernur di dashboard KPI |
| **Misi RPJMD** | `GET /api/misi` | Keselarasan kinerja dengan misi |
| **Prioritas Gubernur** | `GET /api/prioritas-gubernur` | Panel program prioritas gubernur |
| **Prioritas Nasional** | `GET /api/prioritas-nasional` | Panel program prioritas nasional/presiden |
| **Prioritas Daerah** | `GET /api/prioritas-daerah` | Panel program prioritas daerah |
| **Program RPJMD** | `GET /api/programs` | Mapping tugas/kegiatan SIGAP ke program |
| **Kegiatan RPJMD** | `GET /api/kegiatan` | Konteks kegiatan untuk KPI |
| **Sub-Kegiatan RPJMD** | `GET /api/sub-kegiatan` | Target KPI per sub-kegiatan |
| **Renstra OPD** | `GET /api/renstra-opd` | Header periode Renstra per bidang |
| **Renstra Tujuan** | `GET /api/renstra-tujuan` | Tujuan bidang |
| **Renstra Sasaran** | `GET /api/renstra-sasaran` | Sasaran per bidang |
| **Renstra Program** | `GET /api/renstra-program` | Program per bidang |
| **Renstra Kegiatan** | `GET /api/renstra-kegiatan` | Kegiatan per bidang |
| **Renstra SubKegiatan** | `GET /api/renstra-subkegiatan` | SubKegiatan per bidang |
| **Target Renstra** | `GET /api/renstra-target` | Target tahunan per sub-kegiatan |
| **Renja OPD** | `GET /api/renja` | Rencana kerja tahun berjalan |
| **RKA** | `GET /api/rka` | Anggaran per kegiatan |
| **DPA** | `GET /api/dpa` | DPA yang sudah disahkan |
| **Realisasi Monev** | `GET /api/realisasi-indikator` | Persentase realisasi untuk KPI widget |
| **Monev** | `GET /api/monev` | Data monitoring & evaluasi |
| **LAKIP** | `GET /api/lakip` | Laporan akuntabilitas kinerja |

### Proxy endpoint di SIGAP backend

```
Pattern: /api/epelara/<nama-resource>
→ SIGAP backend proxy ke e-Pelara
→ Bisa cache, filter, atau aggregate sebelum dikirim ke frontend SIGAP
```

Contoh:
```
GET /api/epelara/visi            → proxy ke e-Pelara /api/visi
GET /api/epelara/renstra-program → proxy ke e-Pelara /api/renstra-program
GET /api/epelara/kpi-summary     → aggregate dari /api/visi + /api/prioritas-gubernur + /api/renstra-target
```

---

## 11. Checklist Implementasi Berurutan

### FASE 1 — KEAMANAN *(wajib sebelum apapun)*

```
□ 1.1  Generate JWT_SECRET baru (128 karakter hex)
□ 1.2  Update e-pelara/backend/.env → JWT_SECRET + JWT_REFRESH_SECRET
□ 1.3  Update sigap-malut/backend/.env → JWT_SECRET (nilai identik dengan e-Pelara)
□ 1.4  Pastikan .gitignore melindungi .env di kedua repo
□ 1.5  Restart kedua backend (semua token lama otomatis invalid)
```

### FASE 2 — PERBAIKAN e-PELARA *(minimal, 2 file)*

```
□ 2.1  Edit e-pelara/backend/middlewares/verifyToken.js
       → Tambah SIGAP_TO_EPELARA_ROLE constant
       → Tambah translasi req.user.role setelah jwt.verify()
□ 2.2  Edit e-pelara/backend/middlewares/allowRoles.js
       → Perbaiki baca token dari cookie JUGA (bukan hanya header)
```

### FASE 3 — SSO TOKEN SHARING *(Q1)*

```
□ 3.1  Edit e-pelara/frontend/src/contexts/AuthProvider.jsx
       → Tambah baca token dari URL ?token=<jwt>
       → Bersihkan URL setelah token tersimpan
□ 3.2  Buat sigap-malut/frontend/src/shared/components/BukaEPelaraButton.jsx
□ 3.3  Tambah VITE_EPELARA_URL di sigap-malut/frontend/.env
□ 3.4  Pasang <BukaEPelaraButton> di sidebar/header SIGAP
□ 3.5  Test: login SIGAP → klik tombol → e-Pelara terbuka dengan picker
```

### FASE 4 — SERVICE LAYER SIGAP *(Q2+Q3)*

```
□ 4.1  Buat sigap-malut/backend/services/ePelaraService.js
□ 4.2  Buat sigap-malut/backend/controllers/ePelaraController.js
□ 4.3  Buat sigap-malut/backend/routes/ePelaraRoutes.js
□ 4.4  Tambah EPELARA_API_URL di sigap-malut/backend/.env
□ 4.5  Daftarkan route di server.js SIGAP:
       app.use('/api/epelara', ePelaraRoutes)
```

### FASE 5 — FRONTEND SIGAP: TAMPILKAN DATA PERENCANAAN *(Q3)*

```
□ 5.1  Buat hook: frontend/src/features/perencanaan/useEPelaraData.js
□ 5.2  Widget Visi/Misi di dashboard Kepala Dinas & Sekretaris
□ 5.3  Panel Program Prioritas Gubernur/Nasional
□ 5.4  Halaman KPI Monitoring: target Renstra vs realisasi Monev
□ 5.5  Test E2E: data e-Pelara tampil benar di SIGAP
```

### FASE 6 — PRODUCTION HARDENING

```
□ 6.1  Konfigurasi Nginx reverse proxy (routing SIGAP + e-Pelara)
□ 6.2  CORS: whitelist domain production di kedua backend
□ 6.3  Rate limiting di /api/epelara/ endpoint
□ 6.4  Cache layer untuk data perencanaan (berubah jarang)
□ 6.5  Ganti token-via-URL dengan exchange token endpoint (lihat Bagian 12)
□ 6.6  Monitoring: log setiap cross-system API call
```

---

## 12. Panduan Keamanan Wajib

### JWT_SECRET
- Minimal 64 karakter, **direkomendasikan 128 karakter hex**
- Nilai **berbeda** antara development dan production
- **TIDAK PERNAH** di-commit ke version control
- Rotasi setiap 6 bulan atau segera setelah insiden keamanan
- Jika bocor: ganti immediately + invalidate semua sesi

### Token via URL Parameter — Risiko & Mitigasi

| Risiko | Kondisi | Mitigasi |
|---|---|---|
| Token muncul di server log | Production | Gunakan exchange token |
| Token muncul di browser history | Development | Hapus URL setelah simpan (`replaceState`) |
| Token dicuri via Referrer header | Jika ada link eksternal | Tambah `rel="noopener noreferrer"` |

**Untuk production — exchange token endpoint:**
```
POST /api/auth/exchange-token
Body: { token: <sigap_jwt> }
Response: { exchange_code: <random_32_char>, expires_in: 30 }

e-Pelara kemudian:
POST /api/auth/redeem-exchange
Body: { code: <exchange_code> }
Response: { token: <epelara_jwt> }
```
Exchange code berlaku hanya 30 detik dan hanya bisa digunakan 1x.

### CORS di kedua backend

```js
// e-pelara/backend/server.js
app.use(cors({
  origin: [
    'http://localhost:5173',               // SIGAP dev
    'https://sigap.malukuutara.go.id',    // SIGAP production
  ],
  credentials: true,
}));

// sigap-malut/backend/server.js
app.use(cors({
  origin: [
    'http://localhost:3001',               // e-Pelara dev
    'https://epelara.malukuutara.go.id',  // e-Pelara production
  ],
  credentials: true,
}));
```

### Validasi payload JWT di verifyToken e-Pelara

```js
// Setelah jwt.verify(), sebelum req.user = {...}
if (!decoded.id || !decoded.role) {
  return res.status(403).json({ message: 'Token payload tidak valid.' });
}
```

---

*Dokumen ini adalah sumber kebenaran tunggal untuk integrasi SIGAP-MALUT ↔ e-Pelara.*  
*Wajib diperbarui setiap kali ada perubahan pada mekanisme auth, role mapping, atau endpoint yang dikonsumsi.*

## Daftar Isi

1. [Ringkasan Keputusan Arsitektur](#1-ringkasan-keputusan-arsitektur)
2. [Arsitektur Integrasi Keseluruhan](#2-arsitektur-integrasi-keseluruhan)
3. [P22 — JWT Secret: Keamanan](#3-p22--jwt-secret-keamanan)
4. [P23 — Periode & Tahun: Picker Manual](#4-p23--periode--tahun-picker-manual)
5. [P24 — Role Translation: Transparent Mapping](#5-p24--role-translation-transparent-mapping)
6. [Q1 — SSO: Opsi A (JWT Shared)](#6-q1--sso-opsi-a-jwt-shared)
7. [Q2 — Database: Tetap Terpisah, Integrasi via API](#7-q2--database-tetap-terpisah-integrasi-via-api)
8. [Q3 — Data yang Dikonsumsi SIGAP dari e-Pelara](#8-q3--data-yang-dikonsumsi-sigap-dari-e-pelara)
9. [File yang Diubah: Matriks Lengkap](#9-file-yang-diubah-matriks-lengkap)
10. [Urutan Implementasi (Checklist Developer)](#10-urutan-implementasi-checklist-developer)
11. [Testing & Verifikasi](#11-testing--verifikasi)

---

## 1. Ringkasan Keputusan Arsitektur

| ID | Keputusan | Status |
|----|-----------|--------|
| P22 | JWT_SECRET lama bocor ke GitHub publik → wajib diganti dengan string kuat ≥64 karakter sebelum semua coding dimulai | ✅ LOCKED |
| P23 | `tahun` dan `periode_id` e-Pelara TIDAK dimasukkan ke JWT SIGAP — user memilih manual via `GlobalDokumenTahunPickerModal` yang sudah ada di e-Pelara | ✅ LOCKED |
| P24 | Role 15 SIGAP diterjemahkan ke 4 role e-Pelara secara transparan di `verifyToken.js` e-Pelara — 72 route file dan 66 controller file e-Pelara TIDAK disentuh | ✅ LOCKED |
| Q1 | SSO Opsi A: satu login di SIGAP → JWT berlaku di e-Pelara (JWT shared secret) | ✅ LOCKED |
| Q2 | Database tetap terpisah (PostgreSQL SIGAP, MySQL e-Pelara) — integrasi hanya via REST API | ✅ LOCKED |
| Q3 | Data yang dikonsumsi SIGAP dari e-Pelara: visi/misi gubernur, program prioritas (nasional/daerah/gubernur), seluruh hierarki perencanaan (RPJMD → Renstra → Renja → RKA → DPA → SubKegiatan), realisasi Monev, LAKIP | ✅ LOCKED |

---

## 2. Arsitektur Integrasi Keseluruhan

```
┌──────────────────────────────────────────────────────────────────┐
│  USER (Browser)                                                   │
└──────────────────┬───────────────────────────────────────────────┘
                   │ 1. Login sekali di SIGAP
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│  SIGAP-MALUT BACKEND (Node.js/Express — PostgreSQL)              │
│  Port: 5000                                                       │
│  Buat JWT dengan:                                                 │
│    { id, email, role: "KEPALA_DINAS", unit_kerja, ... }          │
│  JWT_SECRET = [SHARED_SECRET — sama di kedua sistem]             │
└──────────┬───────────────────────────────────┬───────────────────┘
           │ 2. Token dikirim ke browser        │ 5. SIGAP query API
           │                                    │    e-Pelara untuk
           ▼                                    │    data perencanaan
┌──────────────────────┐                        ▼
│  SIGAP FRONTEND      │          ┌─────────────────────────────────┐
│  (React/Vite 7)      │          │  e-Pelara BACKEND               │
│  Port: 5173          │          │  (Node.js/Express — MySQL)      │
│                      │          │  Port: 3000                     │
│  Tombol "Buka        │          │                                 │
│  e-Pelara" →         │          │  verifyToken.js:                │
│  kirim JWT ke        │          │  1. Verifikasi JWT              │
│  e-Pelara frontend   │          │  2. Translate role SIGAP →      │
│                      │──────────│     role e-Pelara               │
└──────────────────────┘          │  3. Inject req.user             │
           │ 3. Redirect          │                                 │
           │    dengan token      │  72 route files: TIDAK BERUBAH  │
           ▼                      └─────────────────────────────────┘
┌──────────────────────┐
│  e-Pelara FRONTEND   │
│  (React/Vite)        │
│  Port: 3001          │
│                      │
│  GlobalDokumenTahun  │
│  PickerModal muncul  │
│  → user pilih tahun  │
│    & jenis dokumen   │
└──────────────────────┘
```

**Prinsip utama:**
- User login SEKALI di SIGAP
- Token SIGAP berlaku di e-Pelara karena JWT_SECRET sama
- e-Pelara tidak perlu modifikasi route/controller — cukup middleware
- Database tidak pernah saling akses langsung

---

## 3. P22 — JWT Secret: Keamanan

### Masalah
File `e-pelara/backend/.env` telah di-commit ke GitHub publik dengan nilai:
```
JWT_SECRET=rahasia_RPJMD_aman
```
Nilai ini lemah (hanya 20 karakter) dan sudah bocor ke publik.

### Solusi

**Generate secret baru yang kuat (min. 64 karakter):**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**File yang diubah — e-Pelara:**
```
e-pelara/backend/.env
```
```env
JWT_SECRET=<hasil_generate_64_bytes_hex_diatas>
JWT_REFRESH_SECRET=<generate_baru_juga>
```

**File yang diubah — SIGAP:**
```
backend/.env  (atau sesuai path env SIGAP)
```
```env
JWT_SECRET=<nilai_SAMA_persis_dengan_e-Pelara>
```

### Aturan Wajib
- ✅ Kedua sistem **HARUS** menggunakan `JWT_SECRET` yang SAMA persis
- ✅ Nilai baru WAJIB di-gitignore dan TIDAK boleh di-commit
- ✅ `.gitignore` di e-Pelara dan SIGAP harus mengandung `*.env` atau `.env`
- ✅ Setelah ganti secret, semua user yang sedang login akan ter-logout otomatis (token lama invalid) — ini **normal dan diharapkan**

### File .gitignore
Pastikan `.gitignore` di kedua repo mengandung:
```
.env
.env.local
.env.production
```

---

## 4. P23 — Periode & Tahun: Picker Manual

### Keputusan
JWT dari SIGAP **tidak perlu** menyertakan `tahun` dan `periode_id`. e-Pelara sudah memiliki mekanisme picker bawaan yang bekerja via `DokumenContext` (sessionStorage/localStorage), bukan dari JWT.

### Alur yang Terjadi
```
1. User login di SIGAP → dapat JWT { role: "KEPALA_DINAS", ... }
2. User klik "Buka e-Pelara" di SIGAP
3. SIGAP redirect ke: http://localhost:3001?token=<JWT>
4. e-Pelara frontend baca token dari URL param, simpan ke localStorage
5. DokumenContext cek: dokumen & tahun belum dipilih?
6. GlobalDokumenTahunPickerModal OTOMATIS tampil
7. User pilih jenis dokumen (rpjmd/renstra/dll) + tahun
8. DokumenContext tersimpan → semua API query pakai context ini
```

### Komponen e-Pelara yang Sudah Tersedia (TIDAK DIUBAH)
- `frontend/src/shared/components/GlobalDokumenTahunPickerModal.jsx` ✅
- `frontend/src/contexts/DokumenContext.jsx` ✅
- `frontend/src/contexts/DokumenProvider.jsx` ✅

### Yang PERLU DITAMBAH di SIGAP Frontend
File baru: `frontend/src/components/EpPelaraLauncher.jsx`
- Tombol "Buka e-Pelara" yang redirect dengan token SIGAP
- Muncul di navbar/dashboard SIGAP untuk role yang punya akses e-Pelara

---

## 5. P24 — Role Translation: Transparent Mapping

### Prinsip
Role 15 SIGAP diterjemahkan ke role e-Pelara **di dalam `verifyToken.js`**, sebelum `req.user` di-set. Seluruh kode e-Pelara yang ada (72 route files, 66 model files, semua controller) **tidak perlu tahu** tentang role SIGAP.

### Tabel Mapping Resmi

| Role SIGAP (15) | → Role e-Pelara (4) | Akses di e-Pelara |
|---|---|---|
| `SUPER_ADMIN` | `SUPER_ADMIN` | Full CRUD + manajemen user |
| `KEPALA_DINAS` | `ADMINISTRATOR` | CRUD data + sebagian manajemen |
| `GUBERNUR` | `PENGAWAS` | Read-only semua dokumen |
| `SEKRETARIS` | `ADMINISTRATOR` | CRUD data + koordinasi |
| `KASUBAG_UMUM_KEPEGAWAIAN` | `PELAKSANA` | Input terbatas |
| `PEJABAT_FUNGSIONAL` | `PELAKSANA` | Input data teknis |
| `BENDAHARA` | `PELAKSANA` | Input RKA/DPA/keuangan |
| `PELAKSANA` | `PELAKSANA` | Input terbatas |
| `KEPALA_BIDANG_KETERSEDIAAN` | `ADMINISTRATOR` | CRUD Renstra/Renja bidangnya |
| `KEPALA_BIDANG_DISTRIBUSI` | `ADMINISTRATOR` | CRUD Renstra/Renja bidangnya |
| `KEPALA_BIDANG_KONSUMSI` | `ADMINISTRATOR` | CRUD Renstra/Renja bidangnya |
| `KEPALA_UPTD` | `ADMINISTRATOR` | CRUD data UPTD |
| `KASUBAG_UPTD` | `PELAKSANA` | Input terbatas |
| `KEPALA_SEKSI_UPTD` | `PELAKSANA` | Input terbatas |
| `VIEWER` | `PENGAWAS` | Read-only semua dokumen |

### File yang Diubah di e-Pelara

**`e-pelara/backend/middlewares/verifyToken.js`** — tambah mapping + perbaiki bug allowRoles:

```js
// Ditambahkan di bagian atas file:
const SIGAP_TO_EPELARA_ROLE = {
  SUPER_ADMIN:                'SUPER_ADMIN',
  KEPALA_DINAS:               'ADMINISTRATOR',
  GUBERNUR:                   'PENGAWAS',
  SEKRETARIS:                 'ADMINISTRATOR',
  KASUBAG_UMUM_KEPEGAWAIAN:   'PELAKSANA',
  PEJABAT_FUNGSIONAL:         'PELAKSANA',
  BENDAHARA:                  'PELAKSANA',
  PELAKSANA:                  'PELAKSANA',
  KEPALA_BIDANG_KETERSEDIAAN: 'ADMINISTRATOR',
  KEPALA_BIDANG_DISTRIBUSI:   'ADMINISTRATOR',
  KEPALA_BIDANG_KONSUMSI:     'ADMINISTRATOR',
  KEPALA_UPTD:                'ADMINISTRATOR',
  KASUBAG_UPTD:               'PELAKSANA',
  KEPALA_SEKSI_UPTD:          'PELAKSANA',
  VIEWER:                     'PENGAWAS',
};

// Di dalam verifyToken, sesudah jwt.verify():
const rawRole = decoded.role?.toUpperCase().trim();
const translatedRole = SIGAP_TO_EPELARA_ROLE[rawRole] || rawRole;
req.user.role = translatedRole;
```

**`e-pelara/backend/middlewares/allowRoles.js`** — perbaiki bug: tambah dukungan cookie:

```js
// Bug: saat ini hanya baca dari header Authorization
// Fix: baca dari cookie ATAU header (konsisten dengan verifyToken.js)
const token =
  req.cookies?.token ||
  (req.header("Authorization")?.replace("Bearer ", ""));
```

---

## 6. Q1 — SSO: Opsi A (JWT Shared)

### Implementasi di SIGAP Frontend

**File baru:** `frontend/src/components/EpelaraLauncher.jsx`

```jsx
// Tombol/link untuk membuka e-Pelara dengan JWT SIGAP
// Cara kerja:
// 1. Ambil token dari Zustand store (user.token)
// 2. Redirect ke URL e-Pelara dengan token sebagai query param
// 3. e-Pelara frontend simpan token dan proses auth

const EPELARA_URL = import.meta.env.VITE_EPELARA_URL || 'http://localhost:3001';

export function EpelaraLauncher() {
  const token = useAuthStore(s => s.token);
  
  const handleOpen = () => {
    if (!token) return;
    // Kirim token via URL param (e-Pelara baca di AuthProvider)
    window.open(`${EPELARA_URL}/sso?token=${token}`, '_blank');
  };
  
  return <button onClick={handleOpen}>Buka e-Pelara</button>;
}
```

**File baru di e-Pelara Frontend:** `frontend/src/pages/SsoEntryPage.jsx`

```jsx
// Halaman entry point untuk SSO
// Baca token dari URL, simpan ke localStorage, redirect ke dashboard
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  if (token) {
    localStorage.setItem('token', token);
    // AuthProvider akan baca token ini otomatis
    navigate('/'); // redirect ke root → picker modal akan muncul
  }
}, []);
```

### Environment Variables yang Diperlukan

**SIGAP `.env`:**
```env
JWT_SECRET=<shared_secret_64_chars>
VITE_EPELARA_URL=http://localhost:3001
```

**e-Pelara `backend/.env`:**
```env
JWT_SECRET=<shared_secret_64_chars_SAMA>
EPELARA_ALLOWED_SSO_ORIGINS=http://localhost:5173,https://sigap.malutprov.go.id
```

---

## 7. Q2 — Database: Tetap Terpisah, Integrasi via API

### Prinsip
- SIGAP backend **TIDAK** pernah query langsung ke MySQL e-Pelara
- SIGAP backend memanggil API e-Pelara menggunakan service layer internal
- e-Pelara **TIDAK** query ke PostgreSQL SIGAP

### File Baru di SIGAP Backend

```
backend/
  services/
    ePelaraService.js       ← semua axios calls ke e-Pelara API
  controllers/
    ePelaraController.js    ← handler untuk route SIGAP
  routes/
    ePelaraRoutes.js        ← endpoint SIGAP yang proxy/agregasi data e-Pelara
```

### Pola Service Layer

```js
// backend/services/ePelaraService.js
// SIGAP backend bertindak sebagai proxy yang authenticated,
// meneruskan token user ke e-Pelara API
class EPelaraService {
  async getVisiMisi(token, periodeId) { ... }
  async getPrioritasGubernur(token) { ... }
  async getRenstraByBidang(token, bidangId, tahun) { ... }
  async getRealisasiMonev(token, periodeId, tahun) { ... }
  // dst untuk semua data Q3
}
```

---

## 8. Q3 — Data yang Dikonsumsi SIGAP dari e-Pelara

### Daftar Lengkap Endpoint e-Pelara yang Dikonsumsi SIGAP

| Domain | Endpoint e-Pelara | Digunakan di SIGAP untuk |
|---|---|---|
| Visi & Misi | `GET /api/visi` | Widget KPI Dashboard — "Visi Gubernur" |
| Visi & Misi | `GET /api/misi` | Widget KPI Dashboard — "Misi Gubernur" |
| Prioritas Nasional | `GET /api/prioritas-nasional` | Referensi perencanaan |
| Prioritas Daerah | `GET /api/prioritas-daerah` | Referensi perencanaan |
| Prioritas Gubernur | `GET /api/prioritas-gubernur` | Widget "Program Prioritas Gubernur" |
| RPJMD | `GET /api/rpjmd` | Hierarki dokumen perencanaan |
| Tujuan RPJMD | `GET /api/tujuan` | Cascading ke Renstra |
| Sasaran RPJMD | `GET /api/sasaran` | Cascading ke Renstra |
| Program | `GET /api/programs` | Mapping ke kegiatan SIGAP |
| Kegiatan | `GET /api/kegiatan` | Mapping ke sub-kegiatan |
| Sub Kegiatan | `GET /api/sub-kegiatan` | Referensi target KPI per unit |
| Renstra OPD | `GET /api/renstra-opd` | Renstra per bidang |
| Renstra Program | `GET /api/renstra-program` | Program per bidang |
| Renstra Kegiatan | `GET /api/renstra-kegiatan` | Kegiatan per bidang |
| Renstra SubKegiatan | `GET /api/renstra-subkegiatan` | SubKegiatan per bidang |
| Renja | `GET /api/renja` | Rencana Kerja tahunan |
| RKA | `GET /api/rka` | Rencana Kerja & Anggaran |
| DPA | `GET /api/dpa` | Dokumen Pelaksanaan Anggaran |
| Monev | `GET /api/monev` | Realisasi untuk KPI monitoring |
| Realisasi Indikator | `GET /api/realisasi-indikator` | Capaian KPI per indikator |
| LAKIP | `GET /api/lakip` | Laporan Akuntabilitas Kinerja |

### Caching Strategy

Data e-Pelara yang jarang berubah (visi/misi, prioritas, RPJMD) **harus di-cache** di SIGAP:
- Cache duration: **24 jam** untuk data master perencanaan
- Cache duration: **1 jam** untuk data Monev/realisasi
- Implementasi: Redis (sudah ada di SIGAP backend)

---

## 9. File yang Diubah: Matriks Lengkap

### e-Pelara (Perubahan Minimal)

| File | Jenis | Perubahan |
|---|---|---|
| `backend/.env` | Konfigurasi | Ganti `JWT_SECRET` + `JWT_REFRESH_SECRET` |
| `backend/middlewares/verifyToken.js` | Middleware | Tambah SIGAP→ePelara role translation |
| `backend/middlewares/allowRoles.js` | Middleware | Perbaiki bug: tambah dukungan cookie |
| `frontend/src/pages/SsoEntryPage.jsx` | **FILE BARU** | Entry point SSO dari SIGAP |
| `frontend/src/App.jsx` atau router | Routing | Tambah route `/sso` → `SsoEntryPage` |

**Total: 5 file** (3 diubah, 2 baru)

### SIGAP-MALUT (Service Layer Baru)

| File | Jenis | Perubahan |
|---|---|---|
| `backend/.env` | Konfigurasi | Tambah `JWT_SECRET` (shared) + `EPELARA_BASE_URL` |
| `backend/services/ePelaraService.js` | **FILE BARU** | Service layer semua API calls ke e-Pelara |
| `backend/controllers/ePelaraController.js` | **FILE BARU** | Controller proxy/agregasi data |
| `backend/routes/ePelaraRoutes.js` | **FILE BARU** | Route definitions |
| `backend/server.js` | Entry point | Register `ePelaraRoutes` |
| `frontend/src/components/EpelaraLauncher.jsx` | **FILE BARU** | Tombol SSO ke e-Pelara |
| `frontend/.env` | Konfigurasi | Tambah `VITE_EPELARA_URL` |

**Total: 7 file** (3 diubah, 4 baru)

---

## 10. Urutan Implementasi (Checklist Developer)

### Fase 0 — Security (WAJIB PERTAMA)
- [ ] Generate `JWT_SECRET` baru: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Update `e-pelara/backend/.env` — ganti `JWT_SECRET` dan `JWT_REFRESH_SECRET`
- [ ] Update `sigap-malut/backend/.env` — tambah `JWT_SECRET` (nilai **sama persis**)
- [ ] Verifikasi `.gitignore` di kedua repo mengandung `.env`
- [ ] Commit `.gitignore` saja (TIDAK commit `.env`)

### Fase 1 — Perbaiki e-Pelara Middleware
- [ ] Update `e-pelara/backend/middlewares/allowRoles.js` — perbaiki bug cookie
- [ ] Update `e-pelara/backend/middlewares/verifyToken.js` — tambah role translation

### Fase 2 — SSO Entry Point di e-Pelara Frontend
- [ ] Buat `e-pelara/frontend/src/pages/SsoEntryPage.jsx`
- [ ] Daftarkan route `/sso` di router e-Pelara

### Fase 3 — SIGAP Service Layer
- [ ] Buat `backend/services/ePelaraService.js`
- [ ] Buat `backend/controllers/ePelaraController.js`
- [ ] Buat `backend/routes/ePelaraRoutes.js`
- [ ] Register route di `backend/server.js`

### Fase 4 — SIGAP Frontend Launcher
- [ ] Buat `frontend/src/components/EpelaraLauncher.jsx`
- [ ] Tambahkan launcher ke navbar/sidebar SIGAP

### Fase 5 — Testing
- [ ] Jalankan kedua backend (SIGAP: port 5000, e-Pelara: port 3000)
- [ ] Jalankan kedua frontend (SIGAP: port 5173, e-Pelara: port 3001)
- [ ] Test login SIGAP → klik buka e-Pelara → picker muncul → data tampil
- [ ] Test role mapping: KEPALA_DINAS bisa CRUD di e-Pelara, VIEWER read-only

---

## 11. Testing & Verifikasi

### Test Case Utama

| Test | Langkah | Expected Result |
|---|---|---|
| TC-01: Login SSO | Login SIGAP → klik "Buka e-Pelara" | e-Pelara terbuka, picker modal muncul |
| TC-02: Role ADMINISTRATOR | Login sebagai KEPALA_DINAS → buka e-Pelara | Bisa create/edit dokumen Renstra |
| TC-03: Role PENGAWAS | Login sebagai GUBERNUR → buka e-Pelara | Read-only, tombol create hidden/disabled |
| TC-04: Token Expired | Token SIGAP expired → buka e-Pelara | Redirect ke halaman login SIGAP |
| TC-05: Data API | SIGAP dashboard → widget visi/misi | Data tampil dari e-Pelara via proxy |
| TC-06: Cache | Request 2x dalam 24 jam | Request ke-2 lebih cepat (dari Redis cache) |
| TC-07: Token Mismatch | JWT_SECRET berbeda | e-Pelara tolak dengan 403 |

### Smoke Test Command (setelah implementasi)
```bash
# Test verifyToken e-Pelara menerima JWT dari SIGAP
curl -H "Authorization: Bearer <jwt_dari_sigap>" http://localhost:3000/api/visi

# Expected: 200 OK dengan data visi
# Jika 403: JWT_SECRET belum sama
# Jika 401: format token salah
```

---

## Catatan Penting untuk Tim Developer

> **JANGAN** langsung push perubahan `.env` ke repository manapun.

> **SELALU** test di lokal dulu sebelum deploy ke staging/production.

> **PASTIKAN** kedua server berjalan saat testing SSO:
> - SIGAP backend: `cd backend && node server.js` (port 5000)
> - e-Pelara backend: `cd e-pelara/backend && node server.js` (port 3000)
> - SIGAP frontend: `cd frontend && npm run dev` (port 5173)
> - e-Pelara frontend: `cd e-pelara/frontend && npm run dev` (port 3001)

> **INGAT** dokumen 33 ([33-keputusan-arsitektur-final-dashboard-dan-desain-sistem.md](33-keputusan-arsitektur-final-dashboard-dan-desain-sistem.md)) tetap menjadi single source of truth untuk keputusan arsitektur SIGAP internal. Dokumen ini (34) adalah panduan khusus integrasi dua sistem.
