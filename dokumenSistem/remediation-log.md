# Remediation Log — Go-Live Validation SIGAP-MALUT

**Branch:** `audit/go-live-remediation`  
**Tanggal:** 2026-04-05

---

## RL-001

**File:** `backend/controllers/taskController.js`  
**Jenis perubahan:** fix(api) — enforce submit content validation  
**Sebelum:**
```javascript
// Menggunakan transitionHandler factory — ZERO content validation
router.post("/:id/submit", transitionHandler("submit", (req) => req.body.note || null, ...));
```
**Sesudah:**
```javascript
// Handler penuh dengan validasi:
// - output_ringkas wajib ≥ 50 karakter
// - output_url wajib untuk tugas ASN/kepegawaian
// - status harus in_progress (dari state machine)
// - metadata pelaksana_submit tersimpan
router.post("/:id/submit", async (req, res) => { /* full validation handler */ });
```
**Alasan:** Endpoint umum bisa di-bypass langsung dari API tanpa melalui UI Pelaksana; validasi di controller Pelaksana saja tidak cukup  
**Layer:** Security, Workflow Integrity, Data Integrity  
**Dampak:** Submit tanpa output valid → HTTP 400; bypass tidak mungkin lagi

---

## RL-002

**File:** `backend/server.js`  
**Jenis perubahan:** fix(security) — add rate limiting  
**Sebelum:** `express-rate-limit` ada di `package.json` tapi **tidak pernah diimport/digunakan**  
**Sesudah:**
```javascript
import rateLimit from "express-rate-limit";

// Auth: max 20 req / 15 menit (production)
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, skipSuccessfulRequests: true, ... });

// Submit: max 10 req / menit (production)
const submitLimiter = rateLimit({ windowMs: 60*1000, max: 10, ... });

// General API: max 300 req / menit (production)
const generalApiLimiter = rateLimit({ ... });

app.use("/api/auth", authLimiter);
app.use("/api/tasks/:id/submit", submitLimiter);
app.use("/api", generalApiLimiter);
```
**Alasan:** Tanpa rate limiting, endpoint auth dan submit rentan brute force dan DoS  
**Layer:** Security  
**Dampak:** Brute force auth → HTTP 429 setelah 20 percobaan gagal; API flooding diblokir; health/metrics dikecualikan dari limit

---

## RL-003

**File:** `backend/controllers/sekretaris/tugasVerifiedController.js` (FILE BARU)  
**Jenis perubahan:** feat — controller endpoint tugas terverifikasi  
**Sebelum:** Tidak ada endpoint untuk list tugas status `verified` yang menunggu review Sekretaris  
**Sesudah:** `GET /api/sekretaris/tugas-terverifikasi` dengan pagination, include assignees, include creator, include metadata pelaksana_submit  
**Alasan:** Dashboard Sekretaris tidak bisa menampilkan tugas yang sudah diverifikasi Kasubag tanpa endpoint ini  
**Layer:** Workflow Integrity  
**Dampak:** Sekretaris sekarang dapat melihat dan memproses tugas yang menunggu persetujuan

---

## RL-004

**File:** `backend/routes/sekretaris/sekretarisIndex.js`  
**Jenis perubahan:** fix(workflow) — tambah route tugas terverifikasi  
**Sebelum:** Tidak ada `router.get("/tugas-terverifikasi", ...)`  
**Sesudah:** `router.get("/tugas-terverifikasi", listTugasVerified)` — dilindungi `protect` middleware (sudah ada di `router.use(protect)`)  
**Alasan:** Controller baru perlu terdaftar di route index  
**Layer:** Workflow Integrity  
**Dampak:** Endpoint aktif dan dapat dipanggil dari frontend

---

## RL-005

**File:** `frontend/src/components/sekretaris/ReviewTugasVerifiedPanel.jsx` (FILE BARU)  
**Jenis perubahan:** feat — panel UI review tugas verified  
**Sebelum:** Tidak ada panel untuk Sekretaris memproses tugas `verified`  
**Sesudah:** Panel dengan fitur:
- Fetch `GET /api/sekretaris/tugas-terverifikasi`
- List tugas dengan metadata pelaksana_submit (ringkasan output)
- Modal keputusan: Setujui / Kembalikan / Teruskan ke Kadis
- Validasi: catatan wajib saat mengembalikan
- Call `POST /api/tasks/:id/review` dengan `decision` + `note`
- Auto-refresh setelah keputusan berhasil

**Alasan:** Alur `verified → approved_by_secretary` butuh UI trigger yang jelas  
**Layer:** UI Consistency, Workflow Integrity  
**Dampak:** Alur persetujuan Sekretaris lengkap end-to-end

---

## RL-006

**File:** `frontend/src/ui/dashboards/DashboardSekretariat.jsx`  
**Jenis perubahan:** fix(workflow) — integrasi ReviewTugasVerifiedPanel  
**Sebelum:** Tidak ada import, tidak ada menu, tidak ada badge untuk tugas terverifikasi  
**Sesudah:**
- `import ReviewTugasVerifiedPanel`
- State `verifiedCount` dengan `useEffect` fetch count dari endpoint
- Menu sidebar `{ id: "review_tugas", label: "Perlu persetujuan Sekretaris", icon: "🔐", badge: verifiedCount }`
- `case "review_tugas": return <ReviewTugasVerifiedPanel />`

**Alasan:** Panel baru perlu diintegrasikan ke dashboard agar dapat diakses Sekretaris  
**Layer:** UI Consistency  
**Dampak:** Sekretaris melihat badge merah di sidebar saat ada tugas yang menunggu persetujuan
