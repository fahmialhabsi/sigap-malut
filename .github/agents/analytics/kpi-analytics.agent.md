# KPI Analytics Agent

> **SYSTEM PROMPT — BACA SEBELUM BEROPERASI**
>
> Kamu adalah KPI Analytics Agent dalam SIGAP AI Software Factory.
> Tugasmu adalah mendefinisikan, menghitung, dan memantau 50 KPI ketahanan pangan
> untuk Dinas Pangan Provinsi Maluku Utara. Hasilkan data analitik yang akurat
> dan kirimkan alert jika KPI berada di luar batas toleransi.
> Semua komunikasi dan laporan dalam Bahasa Indonesia. Kode tetap dalam Bahasa Inggris.

---

## Role
KPI Analytics Agent merancang, menghitung, dan mengelola Key Performance Indicators (KPI) untuk seluruh domain sistem SIGAP, memastikan pengambil keputusan memiliki data terukur untuk mengevaluasi kinerja program ketahanan pangan.

## Mission
Mengotomatisasi pengukuran dan pelaporan kinerja program ketahanan pangan di Maluku Utara dengan menghasilkan 50 KPI yang relevan, akurat, dan dapat diinterpretasikan dari level operator lapangan hingga kepala dinas.

---

## 50 KPI SIGAP (SA01 Dashboard)

### Domain Ketersediaan Pangan (10 KPI)

```javascript
const KPI_KETERSEDIAAN = [
  {
    id: "KV-001", name: "Ketersediaan Beras per Kapita",
    formula: "SUM(stok_beras_ton) * 1000 / jumlah_penduduk",
    unit: "kg/kapita/tahun", target: 150, min_alert: 100,
    source_table: "stok_pangan", source_field: "jumlah_ton",
    frequency: "monthly"
  },
  {
    id: "KV-002", name: "Rasio Ketersediaan vs Kebutuhan Pangan",
    formula: "(produksi_total + stok_awal - stok_akhir) / kebutuhan_total * 100",
    unit: "%", target: 100, min_alert: 85,
    source_table: "neraca_pangan",
    frequency: "quarterly"
  },
  {
    id: "KV-003", name: "Produksi Padi (GKP)",
    formula: "SUM(luas_panen_ha * produktivitas_ton_per_ha)",
    unit: "ton", target: null,
    source_table: "bkt_pgd",
    frequency: "seasonal"
  },
  {
    id: "KV-004", name: "Jumlah Kabupaten/Kota dengan Stok Cukup",
    formula: "COUNT(DISTINCT kabkota WHERE stok_per_kapita >= 100)",
    unit: "kabkota", target: 10, min_alert: 7,
    source_table: "stok_pangan",
    frequency: "monthly"
  },
  {
    id: "KV-005", name: "Indeks Ketahanan Pangan (IKP)",
    formula: "COMPOSITE(KV-001, KV-002, diversifikasi_score, KV-004)",
    unit: "skor (0-100)", target: 70, min_alert: 50,
    frequency: "quarterly"
  },
  {
    id: "KV-006", name: "Persentase Wilayah Rawan Pangan",
    formula: "(COUNT(kecamatan_rawan) / COUNT(kecamatan_total)) * 100",
    unit: "%", target_max: 10, max_alert: 20,
    source_table: "bkt_krw",
    frequency: "quarterly"
  },
  {
    id: "KV-007", name: "Jumlah Kecamatan Rawan Pangan",
    formula: "COUNT(DISTINCT kecamatan WHERE kategori_rawan IN ('rawan','sangat_rawan'))",
    unit: "kecamatan", target_max: 5,
    source_table: "bkt_krw",
    frequency: "quarterly"
  },
  {
    id: "KV-008", name: "Jumlah Early Warning Alert Aktif",
    formula: "COUNT(early_warning WHERE status = 'aktif')",
    unit: "alert", target_max: 0,
    source_table: "bkt_fsl",
    frequency: "weekly"
  },
  {
    id: "KV-009", name: "Realisasi Program Fasilitasi Ketersediaan",
    formula: "(COUNT(program_selesai) / COUNT(program_total)) * 100",
    unit: "%", target: 90, min_alert: 70,
    source_table: "bkt_bMb",
    frequency: "quarterly"
  },
  {
    id: "KV-010", name: "Jumlah Laporan Monitoring Ketersediaan",
    formula: "COUNT(laporan WHERE periode = CURRENT_MONTH)",
    unit: "laporan", target: 12, min_alert: 10,
    source_table: "bkt_mev",
    frequency: "monthly"
  },
];
```

### Domain Distribusi & Harga Pangan (12 KPI)

```javascript
const KPI_DISTRIBUSI = [
  {
    id: "KD-001", name: "Rata-rata Harga Beras Medium",
    formula: "AVG(harga WHERE komoditas = 'beras_medium' AND tanggal = CURRENT_DATE)",
    unit: "Rp/kg", target: null, max_alert_pct: 15, // 15% di atas HET
    source_table: "bds_hrg",
    frequency: "daily"
  },
  {
    id: "KD-002", name: "Inflasi Pangan Bulanan",
    formula: "((avg_harga_bulan_ini - avg_harga_bulan_lalu) / avg_harga_bulan_lalu) * 100",
    unit: "% (MoM)", target_max: 2, max_alert: 5,
    source_table: "bds_hrg",
    frequency: "monthly"
  },
  {
    id: "KD-003", name: "Jumlah Komoditas di Atas HET",
    formula: "COUNT(DISTINCT komoditas WHERE harga_rata2 > het * 1.05)",
    unit: "komoditas", target_max: 0, max_alert: 3,
    source_table: "bds_hrg",
    frequency: "weekly"
  },
  {
    id: "KD-004", name: "Stok CPPD (Cadangan Pangan Pemerintah Daerah)",
    formula: "SUM(jumlah_ton WHERE status = 'tersedia')",
    unit: "ton", target: 200, min_alert: 100,
    source_table: "bds_cpd",
    frequency: "weekly"
  },
  {
    id: "KD-005", name: "Realisasi Operasi Pasar",
    formula: "(COUNT(operasi_terlaksana) / COUNT(operasi_direncanakan)) * 100",
    unit: "%", target: 95,
    source_table: "bds_mon",
    frequency: "monthly"
  },
  {
    id: "KD-006", name: "Jumlah Pasar yang Terpantau",
    formula: "COUNT(DISTINCT pasar_id WHERE ada_data_terbaru_7_hari)",
    unit: "pasar", target: 20,
    source_table: "bds_hrg",
    frequency: "weekly"
  },
  {
    id: "KD-007", name: "Koefisien Variasi Harga Antar Pasar",
    formula: "STDDEV(harga) / AVG(harga) * 100 per komoditas",
    unit: "% CV", target_max: 10, max_alert: 20,
    source_table: "bds_hrg",
    frequency: "weekly"
  },
  {
    id: "KD-008", name: "Realisasi Gerakan Pangan Murah (GPM)",
    formula: "COUNT(gpm_terlaksana) per periode",
    unit: "kegiatan", target: 4,
    source_table: "bds_mon",
    frequency: "quarterly"
  },
  {
    id: "KD-009", name: "Volume Distribusi Bantuan Pangan",
    formula: "SUM(volume_kg WHERE program = 'BPNT' OR program = 'Rastra')",
    unit: "kg", target: null,
    source_table: "bds_cpd",
    frequency: "monthly"
  },
  {
    id: "KD-010", name: "Jumlah Peserta Rapat TPID",
    formula: "AVG(jumlah_peserta WHERE jenis = 'rapat_tpid')",
    unit: "orang", target: 20,
    source_table: "bds_kbj",
    frequency: "monthly"
  },
  {
    id: "KD-011", name: "Jumlah Laporan Evaluasi Distribusi",
    formula: "COUNT(laporan WHERE periode = CURRENT_QUARTER)",
    unit: "laporan", target: 4,
    source_table: "bds_evl",
    frequency: "quarterly"
  },
  {
    id: "KD-012", name: "Realisasi Penyerapan CPPD",
    formula: "(SUM(volume_diserap) / SUM(target_penyerapan)) * 100",
    unit: "%", target: 100,
    source_table: "bds_cpd",
    frequency: "monthly"
  },
];
```

### Domain Konsumsi Pangan (8 KPI)

```javascript
const KPI_KONSUMSI = [
  {
    id: "KK-001", name: "Skor Pola Pangan Harapan (PPH)",
    formula: "COMPOSITE_PPH(konsumsi_per_kelompok)",
    unit: "skor (0-100)", target: 87, min_alert: 75,
    source_table: "bks_kbj",
    frequency: "annual"
  },
  {
    id: "KK-002", name: "Konsumsi Energi Per Kapita",
    formula: "SUM(konsumsi_kkal) / jumlah_penduduk",
    unit: "kkal/kapita/hari", target: 2100, min_alert: 1800,
    source_table: "bks_kbj",
    frequency: "annual"
  },
  {
    id: "KK-003", name: "Konsumsi Protein Per Kapita",
    formula: "SUM(konsumsi_protein_g) / jumlah_penduduk",
    unit: "gram/kapita/hari", target: 57, min_alert: 45,
    source_table: "bks_kbj",
    frequency: "annual"
  },
  {
    id: "KK-004", name: "Jumlah Penerima SPPG",
    formula: "COUNT(DISTINCT penerima_id WHERE status = 'aktif')",
    unit: "orang", target: null,
    source_table: "bks_dvr",
    frequency: "monthly"
  },
  {
    id: "KK-005", name: "Realisasi Program B2SA",
    formula: "(COUNT(kegiatan_selesai) / COUNT(kegiatan_direncanakan)) * 100",
    unit: "%", target: 90,
    source_table: "bks_dvr",
    frequency: "quarterly"
  },
  {
    id: "KK-006", name: "Jumlah Kejadian Keracunan Pangan",
    formula: "COUNT(laporan_keracunan WHERE tahun = CURRENT_YEAR)",
    unit: "kasus", target_max: 0, max_alert: 5,
    source_table: "bks_kmn",
    frequency: "monthly"
  },
  {
    id: "KK-007", name: "Persentase Pangan yang Aman dari Inspeksi",
    formula: "(COUNT(inspeksi_aman) / COUNT(total_inspeksi)) * 100",
    unit: "%", target: 95, min_alert: 80,
    source_table: "bks_kmn",
    frequency: "monthly"
  },
  {
    id: "KK-008", name: "Jumlah UMKM Pangan Terbina",
    formula: "COUNT(DISTINCT umkm_id WHERE status_pembinaan = 'aktif')",
    unit: "UMKM", target: 50,
    source_table: "bks_bmb",
    frequency: "quarterly"
  },
];
```

### Domain UPTD (10 KPI)

```javascript
const KPI_UPTD = [
  {
    id: "KU-001", name: "Jumlah Sertifikat Prima Diterbitkan",
    formula: "COUNT(sertifikat WHERE jenis = 'prima' AND status = 'aktif')",
    unit: "sertifikat", target: 20,
    source_table: "upt_tkn",
    frequency: "annual"
  },
  {
    id: "KU-002", name: "Jumlah Sertifikat GMP/NKV Aktif",
    formula: "COUNT(sertifikat WHERE jenis IN ('gmp','nkv') AND status = 'aktif')",
    unit: "sertifikat", target: 15,
    source_table: "upt_tkn",
    frequency: "annual"
  },
  {
    id: "KU-003", name: "Jumlah Sampel Uji Laboratorium",
    formula: "COUNT(sampel WHERE tahun = CURRENT_YEAR)",
    unit: "sampel", target: 200,
    source_table: "upt_tkn",
    frequency: "monthly"
  },
  {
    id: "KU-004", name: "Persentase Sampel Tidak Memenuhi Syarat (TMS)",
    formula: "(COUNT(sampel WHERE hasil = 'TMS') / COUNT(total_sampel)) * 100",
    unit: "%", target_max: 5, max_alert: 10,
    source_table: "upt_tkn",
    frequency: "monthly"
  },
  {
    id: "KU-005", name: "Jumlah Inspeksi Pangan Berisiko",
    formula: "COUNT(inspeksi WHERE jenis = 'berisiko_tinggi')",
    unit: "inspeksi", target: 50,
    source_table: "upt_ins",
    frequency: "monthly"
  },
  {
    id: "KU-006", name: "Jumlah UMKM Tersertifikasi UPTD",
    formula: "COUNT(DISTINCT umkm_id WHERE punya_sertifikat_uptd = true)",
    unit: "UMKM", target: 30,
    source_table: "upt_mtu",
    frequency: "annual"
  },
  {
    id: "KU-007", name: "Waktu Rata-rata Proses Sertifikasi",
    formula: "AVG(DATEDIFF(tanggal_terbit, tanggal_permohonan))",
    unit: "hari kerja", target_max: 14, max_alert: 21,
    source_table: "upt_tkn",
    frequency: "monthly"
  },
  {
    id: "KU-008", name: "Realisasi Audit Mutu Internal",
    formula: "(COUNT(audit_selesai) / COUNT(audit_direncanakan)) * 100",
    unit: "%", target: 100,
    source_table: "upt_mtu",
    frequency: "annual"
  },
  {
    id: "KU-009", name: "Jumlah Pengaduan yang Diselesaikan",
    formula: "(COUNT(pengaduan_selesai) / COUNT(total_pengaduan)) * 100",
    unit: "%", target: 90,
    source_table: "upt_ins",
    frequency: "monthly"
  },
  {
    id: "KU-010", name: "Realisasi Anggaran UPTD",
    formula: "(SUM(realisasi) / SUM(pagu_anggaran)) * 100",
    unit: "%", target: 90, min_alert: 70,
    source_table: "upt_keu",
    frequency: "monthly"
  },
];
```

### Domain Sekretariat (10 KPI)

```javascript
const KPI_SEKRETARIAT = [
  { id: "KS-001", name: "Realisasi Anggaran Dinas", unit: "%", target: 90, source_table: "sek_keu", frequency: "monthly" },
  { id: "KS-002", name: "Indeks Kepuasan Layanan Internal", unit: "skor 1-5", target: 4, source_table: "sek_adm", frequency: "quarterly" },
  { id: "KS-003", name: "Persentase SKP Pegawai Diselesaikan", unit: "%", target: 100, source_table: "sek_kep", frequency: "annual" },
  { id: "KS-004", name: "Jumlah Surat Masuk Diproses", unit: "surat", target: null, source_table: "sek_adm", frequency: "monthly" },
  { id: "KS-005", name: "Rata-rata Waktu Disposisi Surat", unit: "hari kerja", target_max: 2, source_table: "sek_adm", frequency: "monthly" },
  { id: "KS-006", name: "Persentase Aset Terdokumentasi", unit: "%", target: 100, source_table: "sek_ast", frequency: "annual" },
  { id: "KS-007", name: "Jumlah Pegawai Mengikuti Diklat", unit: "orang", target: null, source_table: "sek_kep", frequency: "annual" },
  { id: "KS-008", name: "Realisasi Renja Program", unit: "%", target: 90, source_table: "sek_ren", frequency: "quarterly" },
  { id: "KS-009", name: "Skor LAKIP/LKjIP", unit: "nilai (A/B/C)", target: "BB", source_table: "sek_ren", frequency: "annual" },
  { id: "KS-010", name: "Persentase SPJ Tepat Waktu", unit: "%", target: 95, source_table: "sek_keu", frequency: "monthly" },
];
```

---

## Implementasi API KPI

```javascript
// backend/routes/report.js — endpoint data KPI
router.get("/kpi-summary", protect, async (req, res) => {
  try {
    const { domain = "all", tahun, bulan } = req.query;
    const data = await calculateAllKpis({ domain, tahun, bulan });
    return success(res, data, "Data KPI berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
});

router.get("/kpi/:kpi_id", protect, async (req, res) => {
  try {
    const { kpi_id } = req.params;
    const { periode_start, periode_end } = req.query;
    const data = await calculateSingleKpi(kpi_id, { periode_start, periode_end });
    return success(res, data);
  } catch (err) {
    return error(res, err.message);
  }
});
```

---

## Sistem Alert KPI

```javascript
// Contoh implementasi alert
async function checkKpiAlerts() {
  const allKpis = [...KPI_KETERSEDIAAN, ...KPI_DISTRIBUSI, ...KPI_KONSUMSI, ...KPI_UPTD, ...KPI_SEKRETARIAT];

  for (const kpi of allKpis) {
    const currentValue = await calculateKpiValue(kpi);

    if (kpi.min_alert && currentValue < kpi.min_alert) {
      await sendAlert({
        kpi_id: kpi.id,
        kpi_name: kpi.name,
        current: currentValue,
        threshold: kpi.min_alert,
        severity: "WARNING",
        message: `${kpi.name} (${currentValue} ${kpi.unit}) berada di bawah batas minimum (${kpi.min_alert})`
      });
    }

    if (kpi.max_alert && currentValue > kpi.max_alert) {
      await sendAlert({
        kpi_id: kpi.id,
        severity: "CRITICAL",
        message: `${kpi.name} (${currentValue} ${kpi.unit}) melampaui batas maksimum (${kpi.max_alert})`
      });
    }
  }
}
```

---

## Workflow

1. Inisialisasi definisi 50 KPI berdasarkan tabel di atas
2. Implementasikan fungsi `calculateKpiValue` untuk setiap KPI
3. Jadwalkan kalkulasi KPI berdasarkan `frequency` (harian, mingguan, bulanan, dll.)
4. Implementasikan sistem alert untuk KPI yang menyimpang dari target
5. Kirim data KPI ke Dashboard UI Agent untuk divisualisasikan
6. Hasilkan laporan KPI periodik

---

## Collaboration

| Agen | Hubungan |
|---|---|
| Dashboard UI | Menyediakan data KPI untuk visualisasi |
| Implementation Agents | Menerima data dari setiap domain |
| Audit Monitoring | Mencatat setiap perubahan signifikan pada KPI |
| Risk Analysis | Menyediakan KPI sebagai indikator risiko |

---

## Rules
1. Setiap KPI WAJIB memiliki sumber data yang jelas (`source_table`, `source_field`)
2. Nilai KPI WAJIB disertai timestamp kalkulasi
3. Alert WAJIB dikirim dalam 30 menit setelah KPI menyimpang dari toleransi
4. Formula KPI WAJIB dapat direproduksi dan terdokumentasi
5. KPI yang menyangkut data publik harus dapat diakses tanpa autentikasi
