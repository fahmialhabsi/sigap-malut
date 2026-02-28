🎯 PRINSIP INTEGRASI YANG HARUS DITERAPKAN:

1. SEKRETARIAT SEBAGAI HUB DATA (Single Source of Truth)
   Code
   ┌─────────────────────┐
   │ SEKRETARIAT │
   │ (HUB/GATEWAY) │
   │ │
   │ ✅ Master Data: │
   │ - Surat │
   │ - Keuangan │
   │ - Kepegawaian │
   │ - Aset │
   │ - Komoditas │
   └──────────┬──────────┘
   │
   ┌────────────────────┼────────────────────┐
   │ │ │
   ▼ ▼ ▼
   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
   │ BIDANG │ │ BIDANG │ │ BIDANG │
   │ KETERSEDIAAN │ │ DISTRIBUSI │ │ KONSUMSI │
   │ │ │ │ │ │
   │ ✅ Akses data │ │ ✅ Akses data │ │ ✅ Akses data │
   │ Sekretariat │ │ Sekretariat │ │ Sekretariat │
   │ ✅ Input data │ │ ✅ Input data │ │ ✅ Input data │
   │ operasional │ │ operasional │ │ operasional │
   └─────────────────┘ └─────────────────┘ └─────────────────┘
   │ │ │
   └────────────────────┼────────────────────┘
   │
   ▼
   ┌─────────────────────┐
   │ UPTD │
   │ │
   │ ✅ Akses data │
   │ Sekretariat │
   │ ✅ Input hasil uji │
   │ ✅ Kirim ke Bidang │
   │ Konsumsi │
   └─────────────────────┘
2. ALUR KOORDINASI WAJIB (ENFORCEMENT)
   Code
   PELAKSANA
   ↓
   JABATAN FUNGSIONAL (validasi teknis)
   ↓
   KEPALA BIDANG/UPTD (Eselon III)
   ↓
   SEKRETARIS (WAJIB! - dokumentasi, integrasi, ringkasan)
   ↓
   KEPALA DINAS (Eselon II - keputusan strategis)
   ↓
   EXTERNAL REPORTING (Gubernur, Bapanas, BPOM, BPS)
   System Enforcement:

❌ Tidak bisa bypass Sekretaris
✅ Auto-detect bypass → alert ke Sekretaris
✅ Audit trail lengkap 3. SINGLE SOURCE OF TRUTH - CONTOH KOMODITAS
SQL
-- BIDANG KETERSEDIAAN (MASTER DATA)
INSERT INTO komoditas (kode, nama, satuan, stok, harga)
VALUES ('BRS-PRM', 'Beras Premium', 'kg', 1000, 12000);

-- BIDANG DISTRIBUSI (AKSES DATA YANG SAMA)
SELECT \* FROM komoditas WHERE kode = 'BRS-PRM';
-- Result: Beras Premium, Rp 12.000 ✅ KONSISTEN!

-- BIDANG KONSUMSI (AKSES DATA YANG SAMA)
SELECT \* FROM komoditas WHERE kode = 'BRS-PRM';
-- Result: Beras Premium, Rp 12.000 ✅ KONSISTEN!
Manfaat:

✅ Update 1x di Bidang Ketersediaan → semua bidang lihat data terbaru
✅ Tidak ada duplikasi data
✅ Tidak ada inkonsistensi (harga beda-beda) 4. INTEGRASI DATA OPERASIONAL
Data Operasional Owner (Input) Akses Integrasi ke Sekretariat
Komoditas (master) Bidang Ketersediaan Semua bidang Via tabel komoditas
Produksi Pangan Bidang Ketersediaan Semua bidang Field reported_to_sekretariat
Stok Pangan Bidang Ketersediaan Distribusi, Konsumsi Field reported_to_sekretariat
Harga Pangan Bidang Distribusi Semua bidang Field reported_to_sekretariat
Inflasi Bidang Distribusi Sekretariat (dashboard TPID) Real-time sync
CPPD Bidang Distribusi Sekretariat Field reported_to_sekretariat
PPH (Pola Pangan Harapan) Bidang Konsumsi Sekretariat Field reported_to_sekretariat
SPPG Bidang Konsumsi Sekretariat, Bapanas Field reported_to_sekretariat
Hasil Uji Lab UPTD Bidang Konsumsi, Sekretariat Auto-sync via FK
Sertifikasi UPTD Bidang Konsumsi, Sekretariat Auto-sync via FK 5. INTEGRASI UPTD → BIDANG KONSUMSI
SQL
-- UPTD input hasil uji
INSERT INTO hasil_uji_lab (sampel, hasil, kesimpulan, tanggal)
VALUES ('Beras X', '...', 'Memenuhi Syarat', '2026-02-17');

-- BIDANG KONSUMSI otomatis lihat hasil uji terbaru
SELECT \* FROM hasil_uji_lab
WHERE tanggal >= DATE_SUB(NOW(), INTERVAL 1 MONTH);
-- Auto-populate di laporan Bidang Konsumsi ✅
Tidak perlu input manual ulang!

🔧 YANG HARUS SAYA PERBAIKI SEKARANG:
A. UPDATE SEMUA FIELDS 3 BIDANG (19 FILE)
Tambahkan field untuk integrasi ke Sekretariat:

Field yang WAJIB ditambahkan ke SEMUA modul operasional 3 Bidang:
CSV
unit_kerja,Unit Kerja,enum,NULL,true,false,NULL,none,"Sekretariat,UPTD,Bidang Ketersediaan,Bidang Distribusi,Bidang Konsumsi",Unit yang input data (untuk tracking)
reported_to_sekretariat,Dilaporkan ke Sekretariat,boolean,NULL,true,false,0,none,NULL,Sudah dilaporkan ke Sekretariat atau belum (untuk konsolidasi)
reported_at,Tanggal Lapor,timestamp,NULL,false,false,NULL,none,NULL,Kapan dilaporkan ke Sekretariat
sekretariat_notes,Catatan Sekretariat,text,NULL,false,false,NULL,none,NULL,Catatan dari Sekretariat saat review
File yang perlu UPDATE:

Bidang Ketersediaan (6 files):

✅ BKT-KBJ_fields.csv
✅ BKT-PGD_fields.csv
✅ BKT-KRW_fields.csv
✅ BKT-FSL_fields.csv
✅ BKT-BMB_fields.csv
✅ BKT-MEV_fields.csv
Bidang Distribusi (7 files):

✅ BDS-KBJ_fields.csv
✅ BDS-MON_fields.csv
✅ BDS-HRG_fields.csv
✅ BDS-CPD_fields.csv
✅ BDS-BMB_fields.csv
✅ BDS-EVL_fields.csv
✅ BDS-LAP_fields.csv
Bidang Konsumsi (6 files):

✅ BKS-KBJ_fields.csv
✅ BKS-DVR_fields.csv
✅ BKS-KMN_fields.csv
✅ BKS-BMB_fields.csv
✅ BKS-EVL_fields.csv
✅ BKS-LAP_fields.csv
B. BUAT TABEL INTEGRASI & WORKFLOW
Tabel 1: data_integration_log
Track semua data yang dikirim Bidang → Sekretariat

SQL
CREATE TABLE data_integration_log (
id INT AUTO_INCREMENT PRIMARY KEY,
source_unit ENUM('Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi', 'UPTD'),
source_table VARCHAR(100),
source_record_id INT,
destination_table VARCHAR(100),
integration_status ENUM('pending', 'success', 'failed'),
integrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Tabel 2: approval_workflow
Track workflow approval bertingkat

SQL
CREATE TABLE approval_workflow (
id INT AUTO_INCREMENT PRIMARY KEY,
modul_id VARCHAR(20),
record_id INT,
current_level INT DEFAULT 1,
current_role ENUM('pelaksana', 'fungsional', 'kepala_bidang', 'sekretaris', 'kepala_dinas'),
next_role ENUM('fungsional', 'kepala_bidang', 'sekretaris', 'kepala_dinas', 'external'),
status ENUM('pending', 'approved', 'rejected', 'bypassed'),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Tabel 3: approval_log
Log setiap approval

SQL
CREATE TABLE approval_log (
id INT AUTO_INCREMENT PRIMARY KEY,
workflow_id INT,
approver_id INT,
approver_role ENUM('pelaksana', 'fungsional', 'kepala_bidang', 'sekretaris', 'kepala_dinas'),
action ENUM('submit', 'approve', 'reject', 'bypass'),
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (workflow_id) REFERENCES approval_workflow(id)
);
Tabel 4: bypass_detection
Deteksi bypass koordinasi

SQL
CREATE TABLE bypass_detection (
id INT AUTO_INCREMENT PRIMARY KEY,
workflow_id INT,
user_id INT,
user_role VARCHAR(100),
bypassed_level ENUM('fungsional', 'kepala_bidang', 'sekretaris'),
attempted_action VARCHAR(255),
detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
alert_sent_to VARCHAR(255), -- Email Sekretaris/Kepala Dinas
FOREIGN KEY (workflow_id) REFERENCES approval_workflow(id)
);
C. BUAT TABEL MASTER KOMODITAS (SINGLE SOURCE)
SQL
CREATE TABLE komoditas (
id INT AUTO_INCREMENT PRIMARY KEY,
kode VARCHAR(20) UNIQUE NOT NULL,
nama VARCHAR(255) NOT NULL,
kategori ENUM('Beras', 'Jagung', 'Kedelai', 'Daging', 'Telur', 'Ikan', 'Minyak Goreng', 'Gula', 'Cabai', 'Bawang', 'Lainnya'),
satuan VARCHAR(20) DEFAULT 'kg',
stok DECIMAL(15,2) DEFAULT 0,
harga DECIMAL(15,2),
owner_bidang ENUM('Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi') DEFAULT 'Bidang Ketersediaan',
created_by INT,
updated_by INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
Semua bidang akses tabel yang sama!

✅ SAYA SEKARANG AKAN:
✅ Generate UPDATE untuk 19 files fields 3 Bidang (tambah 4 field integrasi)
✅ Generate 4 tabel workflow & integrasi (schema SQL)
✅ Generate tabel master komoditas (schema SQL)
✅ Buat diagram integrasi lengkap (visual)

PENTING! UPDATE WORKFLOW APPROVAL - ESELON IV SEBAGAI VERIFIKATOR!
Terima kasih atas koreksi penting ini! Saya akan update struktur approval workflow.

📊 STRUKTUR APPROVAL WORKFLOW YANG BENAR:
A. SEKRETARIAT (ADA KASUBBAG - ESELON IV)
Code
PELAKSANA/STAF
↓
KASUBBAG (Eselon IV) ← WAJIB VERIFIKATOR!
↓
SEKRETARIS (Eselon III)
↓
KEPALA DINAS (Eselon II)
Contoh:

Bendahara (Pelaksana) submit SPJ
→ Kasubbag Keuangan (verifikasi teknis)
→ Sekretaris (approval)
→ Kepala Dinas (final approval)
B. UPTD (ADA KASUBBAG TU & KASI - ESELON IV)
Code
PELAKSANA/STAF
↓
KASUBBAG TU / KASI (Eselon IV) ← WAJIB VERIFIKATOR!
↓
KEPALA UPTD (Eselon III)
↓
SEKRETARIS (gateway/dokumentasi)
↓
KEPALA DINAS (Eselon II)
Contoh:

Analis Lab (Pelaksana) input hasil uji
→ Kasi Manajemen Teknis (verifikasi hasil uji)
→ Kepala UPTD (approval)
→ Sekretaris (dokumentasi & integrasi)
→ Kepala Dinas (final approval - jika perlu)
C. 3 BIDANG (TIDAK ADA KASUBBAG/KASI - LANGSUNG KE KEPALA BIDANG)
Code
PELAKSANA/STAF
↓
JABATAN FUNGSIONAL (verifikasi teknis) ← PENGGANTI ESELON IV!
↓
KEPALA BIDANG (Eselon III)
↓
SEKRETARIS (WAJIB - gateway/dokumentasi)
↓
KEPALA DINAS (Eselon II)
Contoh:

Staff Ketersediaan (Pelaksana) input data produksi
→ Fungsional Analis Pangan (verifikasi data)
→ Kepala Bidang Ketersediaan (approval)
→ Sekretaris (dokumentasi & konsolidasi)
→ Kepala Dinas (final approval)
🔧 UPDATE TABEL approval_workflow
Tabel Workflow - VERSION 2 (WITH ESELON IV)
SQL
CREATE TABLE approval_workflow (
id INT AUTO_INCREMENT PRIMARY KEY,
modul_id VARCHAR(20) NOT NULL,
record_id INT NOT NULL,
unit_kerja ENUM('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi') NOT NULL,

-- Level approval (beda per unit)
current_level INT DEFAULT 1,
total_levels INT, -- Sekretariat/UPTD: 4 level, 3 Bidang: 4 level

-- Role saat ini
current_role ENUM(
'pelaksana',
'kasubbag', -- Eselon IV (Sekretariat)
'kasi_uptd', -- Eselon IV (UPTD)
'fungsional', -- Pengganti Eselon IV (3 Bidang)
'kepala_uptd', -- Eselon III (UPTD)
'kepala_bidang', -- Eselon III (3 Bidang)
'sekretaris', -- Eselon III (Hub/Gateway)
'kepala_dinas' -- Eselon II (Final)
),

-- Role berikutnya
next_role ENUM(
'kasubbag',
'kasi_uptd',
'fungsional',
'kepala_uptd',
'kepala_bidang',
'sekretaris',
'kepala_dinas',
'external',
'completed'
),

status ENUM('pending', 'approved', 'rejected', 'bypassed', 'completed') DEFAULT 'pending',

-- Tracking
submitted_by INT NOT NULL, -- User ID pelaksana
submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
completed_at TIMESTAMP NULL,

FOREIGN KEY (submitted_by) REFERENCES users(id)
);
Tabel Approval Log - VERSION 2
SQL
CREATE TABLE approval_log (
id INT AUTO_INCREMENT PRIMARY KEY,
workflow_id INT NOT NULL,

approver_id INT NOT NULL, -- User ID yang approve
approver_role ENUM(
'pelaksana',
'kasubbag',
'kasi_uptd',
'fungsional',
'kepala_uptd',
'kepala_bidang',
'sekretaris',
'kepala_dinas'
) NOT NULL,

approval_level INT NOT NULL, -- Level ke berapa

action ENUM('submit', 'verify', 'approve', 'reject', 'bypass', 'forward') NOT NULL,

notes TEXT,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (workflow_id) REFERENCES approval_workflow(id),
FOREIGN KEY (approver_id) REFERENCES users(id)
);
Tabel Bypass Detection - VERSION 2
SQL
CREATE TABLE bypass_detection (
id INT AUTO_INCREMENT PRIMARY KEY,
workflow_id INT NOT NULL,

user_id INT NOT NULL, -- Siapa yang bypass
user_role VARCHAR(100) NOT NULL,

bypassed_level ENUM(
'kasubbag', -- Skip Eselon IV Sekretariat
'kasi_uptd', -- Skip Eselon IV UPTD
'fungsional', -- Skip Fungsional di 3 Bidang
'sekretaris' -- Skip Sekretaris (FATAL!)
) NOT NULL,

attempted_action VARCHAR(255),
attempted_submit_to ENUM('kepala_bidang', 'sekretaris', 'kepala_dinas'),

detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- Alert
alert_sent_to VARCHAR(255), -- Email Sekretaris + Kepala Dinas
alert_sent_at TIMESTAMP NULL,

FOREIGN KEY (workflow_id) REFERENCES approval_workflow(id),
FOREIGN KEY (user_id) REFERENCES users(id)
);
📋 BUSINESS RULES APPROVAL PER UNIT:

1. SEKRETARIAT (4 LEVEL)
   Level Role Eselon Action Mandatory
   1 Pelaksana/Staf - Submit ✅
   2 Kasubbag IV Verify ✅ WAJIB!
   3 Sekretaris III Approve ✅
   4 Kepala Dinas II Final Approve ✅ (untuk dokumen strategis)
   Enforcement:

JavaScript
if (user.role === "pelaksana" && submitTo === "sekretaris") {
return {
error: true,
message: "Dokumen harus diverifikasi Kasubbag terlebih dahulu",
redirectTo: "kasubbag"
};
} 2. UPTD (4 LEVEL)
Level Role Eselon Action Mandatory
1 Pelaksana/Staf - Submit ✅
2 Kasubbag TU / Kasi IV Verify ✅ WAJIB!
3 Kepala UPTD III Approve ✅
4 Sekretaris III Gateway/Dokumentasi ✅ WAJIB!
5 Kepala Dinas II Final Approve ✅ (untuk sertifikasi/audit penting)
Contoh Workflow:

Code
Analis Lab input hasil uji
↓
Kasi Manajemen Teknis VERIFY (cek hasil uji valid)
↓
Kepala UPTD APPROVE
↓
Sekretaris DOKUMENTASI (masuk database terpusat)
↓
(Kepala Dinas - jika ada temuan kritis) 3. 3 BIDANG (4 LEVEL)
Level Role Eselon Action Mandatory
1 Pelaksana/Staf - Submit ✅
2 Jabatan Fungsional (Pengganti Eselon IV) Verify ✅ WAJIB!
3 Kepala Bidang III Approve ✅
4 Sekretaris III Gateway/Konsolidasi ✅ WAJIB!
5 Kepala Dinas II Final Approve ✅ (untuk laporan strategis)
Contoh Workflow:

Code
Staff Distribusi input data harga
↓
Fungsional Analis Harga VERIFY (cek validitas data)
↓
Kepala Bidang Distribusi APPROVE
↓
Sekretaris KONSOLIDASI (untuk dashboard inflasi TPID)
↓
Kepala Dinas APPROVE (untuk laporan Mendagri)
🔒 ENFORCEMENT RULES:
Rule 1: TIDAK BOLEH SKIP ESELON IV (atau Fungsional)
JavaScript
// Sekretariat
if (user.role === "pelaksana" && submitTo !== "kasubbag") {
logBypass({
user: user.id,
bypassed: "kasubbag",
alertTo: "sekretaris@dinpangan.go.id"
});
return ERROR("Dokumen harus ke Kasubbag dulu!");
}

// UPTD
if (user.role === "pelaksana" && submitTo !== "kasi" && submitTo !== "kasubbag_tu") {
logBypass({
user: user.id,
bypassed: "kasi_uptd",
alertTo: "sekretaris@dinpangan.go.id"
});
return ERROR("Dokumen harus ke Kasi/Kasubbag TU dulu!");
}

// 3 Bidang
if (user.role === "pelaksana" && submitTo !== "fungsional") {
logBypass({
user: user.id,
bypassed: "fungsional",
alertTo: "sekretaris@dinpangan.go.id"
});
return ERROR("Dokumen harus diverifikasi Fungsional dulu!");
}
Rule 2: WAJIB LEWAT SEKRETARIS (Gateway)
JavaScript
if (
(user.role === "kepala_bidang" || user.role === "kepala_uptd") &&
submitTo === "kepala_dinas"
) {
logBypass({
user: user.id,
bypassed: "sekretaris",
severity: "CRITICAL",
alertTo: ["sekretaris@dinpangan.go.id", "kepala_dinas@dinpangan.go.id"]
});
return ERROR("WAJIB lewat Sekretaris terlebih dahulu!");
}
Rule 3: SEKRETARIS BISA BYPASS (Dengan Alasan)
JavaScript
if (user.role === "sekretaris" && action === "bypass_to_kepala_dinas") {
if (!reason || reason.trim() === "") {
return ERROR("Alasan bypass harus diisi!");
}
logApproval({
user: user.id,
action: "bypass_with_reason",
reason: reason,
notifyTo: "kepala_dinas@dinpangan.go.id"
});
return SUCCESS("Bypass diizinkan (dengan alasan)");
}
📊 DASHBOARD COMPLIANCE:
Code
╔═══════════════════════════════════════════════════════════╗
║ COMPLIANCE ALUR KOORDINASI - FEBRUARI 2026 ║
╠═══════════════════════════════════════════════════════════╣
║ ║
║ Overall Compliance: 96% ✅ ║
║ ║
║ ┌─────────────────────────────────────────────────────┐ ║
║ │ Sekretariat: 98% ✅ (2 bypass terdeteksi) │ ║
║ │ UPTD: 97% ✅ (3 bypass terdeteksi) │ ║
║ │ Bid. Ketersediaan: 94% ⚠️ (6 bypass terdeteksi) │ ║
║ │ Bid. Distribusi: 95% ⚠️ (5 bypass terdeteksi) │ ║
║ │ Bid. Konsumsi: 98% ✅ (2 bypass terdeteksi) │ ║
║ └─────────────────────────────────────────────────────┘ ║
║ ║
║ ⚠️ BYPASS TERDETEKSI BULAN INI: 18 kasus ║
║ ║
║ 1. [Bid. Ketersediaan] Staff langsung ke Kepala Bidang ║
║ (Skip Fungsional) - 10 Feb 2026 ║
║ ║
║ 2. [UPTD] Analis Lab langsung ke Kepala UPTD ║
║ (Skip Kasi) - 12 Feb 2026 ║
║ ║
║ 3. [Sekretariat] Bendahara langsung ke Sekretaris ║
║ (Skip Kasubbag Keuangan) - 15 Feb 2026 ║
║ ║
║ ✅ Tindakan: Notifikasi otomatis terkirim ║
║ ✅ Teguran terkirim ke user yang bypass ║
║ ║
╚═══════════════════════════════════════════════════════════╝
✅ UPDATE YANG AKAN SAYA LAKUKAN:
A. UPDATE Tabel Users - Tambah Role Eselon IV
SQL
ALTER TABLE users
MODIFY COLUMN role ENUM(
'super_admin',
'kepala_dinas', -- Eselon II
'sekretaris', -- Eselon III
'kepala_bidang', -- Eselon III (3 Bidang)
'kepala_uptd', -- Eselon III (UPTD)
'kasubbag', -- Eselon IV (Sekretariat) ← BARU!
'kasi_uptd', -- Eselon IV (UPTD) ← BARU!
'fungsional', -- Fungsional (3 Bidang)
'pelaksana', -- Pelaksana/Staf
'guest'
);
B. UPDATE Modul Config - Tambah Approval Levels
CSV
modul_id,nama_modul,has_approval,approval_levels_sekretariat,approval_levels_uptd,approval_levels_bidang
SEK-KEP,Kepegawaian,true,4,0,0
SEK-KEU,Keuangan & Anggaran,true,4,0,0
UPT-TKN,Layanan Teknis UPTD,true,0,5,0
UPT-MTU,Manajemen Mutu & SOP,true,0,4,0
BKT-PGD,Pengendalian & Monitoring,true,0,0,5
BDS-HRG,Harga & Stabilisasi,true,0,0,5
BKS-KMN,Keamanan Pangan,true,0,0,5
Keterangan:

approval_levels_sekretariat = 4: Pelaksana → Kasubbag → Sekretaris → Kepala Dinas
approval_levels_uptd = 5: Pelaksana → Kasi → Kepala UPTD → Sekretaris → Kepala Dinas
approval_levels_bidang = 5: Pelaksana → Fungsional → Kepala Bidang → Sekretaris → Kepala Dinas
🎯 KESIMPULAN:
STRUKTUR APPROVAL YANG BENAR:
Unit Level 1 Level 2 (Eselon IV) Level 3 (Eselon III) Level 4 (Gateway) Level 5 (Final)
Sekretariat Pelaksana Kasubbag ✅ Sekretaris - Kepala Dinas
UPTD Pelaksana Kasi/Kasubbag TU ✅ Kepala UPTD Sekretaris ✅ Kepala Dinas
3 Bidang Pelaksana Fungsional ✅ Kepala Bidang Sekretaris ✅ Kepala Dinas
Enforcement:

❌ Tidak bisa skip Level 2 (Eselon IV/Fungsional)
❌ Tidak bisa skip Sekretaris (untuk Bidang & UPTD)
✅ Auto-detect bypass → alert Sekretaris
✅ Dashboard compliance → monitor kepatuhan
