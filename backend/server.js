import { sequelize, testConnection } from "./config/database.js";
import SequelizePkg from "sequelize";
import "./models/HargaPangan.js";
import "./models/HargaPanganLog.js";
import "./models/InflasiHarian.js";
import "./models/ProduksiPangan.js";
import "./models/StokPangan.js";
import "./models/NeracaPangan.js";
import "./models/KerawananPangan.js";
import "./models/EwsKetersediaan.js";
import "./models/AnalisaJfKetersediaan.js";
import "./models/KonsumsiPangan.js";
import "./models/Pph.js";
import "./models/SppgPenerima.js";
import "./models/SppgDistribusi.js";
import "./models/InspeksiKeamanan.js";
import "./models/KeracunanPangan.js";
import "./models/UmkmPangan.js";
import "./models/KoordinasiUptd.js";
import { initInflasiHarianCron } from "./jobs/inflasiHarianCron.js";
import registerRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import sekAdmRoutes from "./routes/SEK-ADM.js";
import bdsHrgRoutes from "./routes/BDS-HRG.js";
import bktPgdRoutes from "./routes/BKT-PGD.js";
import modulesRoutes from "./routes/modules.js";
import bksEvlRoutes from "./routes/BKS-EVL.js";
import dashboardRoutes from "./routes/dashboard.js";
import inflasiRoutes from "./routes/inflasi.js";
import komoditasStockRoutes from "./routes/komoditasStock.js";
import taskRoutes from "./routes/tasks.js";
import suratRoutes from "./routes/surat.js";
import notificationRoutes from "./routes/notification.js";
import mfaRoutes from "./routes/mfa.js";
import ePelaraRoutes from "./routes/ePelaraRoutes.js";
import bypassDetectionRoutes from "./routes/bypassDetection.js";
import subKegiatanUsulRoutes from "./routes/subKegiatanUsul.js";
import uptdOpsRoutes from "./routes/uptdOps.js";
import { initSLAScheduler } from "./services/slaService.js";
import { initDailyDigestScheduler } from "./services/dailyDigestService.js";
import sekretarisRoutes from "./routes/sekretaris/sekretarisIndex.js";
import publicRoutes from "./routes/public.js";

import http from "http";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import winston from "winston";
import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import client from "prom-client";
import { initSocketIOAsync } from "./services/socketService.js";
import {
  startKPIPolling,
  stopKPIPolling,
} from "./services/kpiPollingService.js";
import { getCacheStats } from "./services/cacheService.js";
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Eksplisit path agar dotenv selalu baca dari direktori server.js, bukan process.cwd()
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
import complianceRoutes from "./routes/compliance.js";

// Prometheus middleware
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.use("/api/compliance", complianceRoutes);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan request logger
app.use(morgan("dev"));

// Winston logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Example usage: logger.info("Server started");

// Serve master-data static files from repository root
app.use(
  "/master-data",
  express.static(path.join(__dirname, "..", "master-data")),
);

// Health check
app.get("/health", (req, res) => {
  const cacheStats = getCacheStats();
  res.json({
    success: true,
    message: "SIGAP Malut API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    cache: cacheStats,
  });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    await sequelize.authenticate();

    // Get table count
    const [tables] = await sequelize.query(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
    );

    res.json({
      success: true,
      message: "Database connection successful",
      dialect: sequelize.getDialect(),
      tables: tables[0].count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Auth routes (harus sebelum registerRoutes)
app.use("/api/auth", authRoutes);
app.use("/api/sek-adm", sekAdmRoutes);
app.use("/api/bds-hrg", bdsHrgRoutes);
app.use("/api/bkt-pgd", bktPgdRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/bks-evl", bksEvlRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inflasi", inflasiRoutes);
app.use("/api/komoditas", komoditasStockRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/surat", suratRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth/mfa", mfaRoutes);
app.use("/api/epelara", ePelaraRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Runtime schema patch (Prompt 5/6) — memastikan tabel core JF tersedia
// Catatan: project ini menjalankan banyak schema generator; untuk environment
// yang belum menjalankan migrations, kita buat tabel inti dengan aman.
// ─────────────────────────────────────────────────────────────────────────────
async function ensureJfSekretariatTables() {
  try {
    const dialect = sequelize.getDialect?.() || process.env.DB_DIALECT || "";
    const isPg = String(dialect).toLowerCase().includes("postgres");
    if (isPg) {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS analisa_perencanaan (
          id SERIAL PRIMARY KEY,
          nomor_analisa VARCHAR(50) UNIQUE,
          judul VARCHAR(255) NOT NULL,
          jenis_analisa VARCHAR(64) NOT NULL,
          dokumen_input_url VARCHAR(500),
          sumber_data_epelara VARCHAR(500),
          periode_tahun INTEGER,
          periode_triwulan INTEGER,
          catatan_teknis TEXT,
          rekomendasi TEXT,
          temuan_cascading JSONB,
          skor_kesesuaian_rpjmd NUMERIC(5,2),
          dokumen_hasil_url VARCHAR(500),
          tujuan_submit VARCHAR(32) NOT NULL DEFAULT 'sekretaris',
          status VARCHAR(64) NOT NULL DEFAULT 'draft',
          task_id INTEGER,
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          revisi_dari INTEGER,
          keputusan_kasubag VARCHAR(32),
          catatan_kasubag TEXT,
          diputuskan_kasubag_at TIMESTAMPTZ,
          diputuskan_kasubag_oleh INTEGER,
          keputusan_sekretaris VARCHAR(32),
          catatan_sekretaris TEXT,
          diputuskan_sekretaris_at TIMESTAMPTZ,
          diputuskan_sekretaris_oleh INTEGER,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS spj (
          id SERIAL PRIMARY KEY,
          nomor_spj VARCHAR(50) UNIQUE,
          jenis_belanja VARCHAR(32) NOT NULL,
          sub_kegiatan_kode VARCHAR(50) NOT NULL,
          kode_rekening VARCHAR(50) NOT NULL,
          nominal NUMERIC(15,2) NOT NULL,
          keterangan TEXT,
          dibuat_oleh INTEGER NOT NULL,
          tanggal_kegiatan DATE NOT NULL,
          lampiran_url VARCHAR(500),
          status VARCHAR(64) NOT NULL DEFAULT 'draft',
          diverifikasi_bendahara_oleh INTEGER,
          diverifikasi_bendahara_at TIMESTAMPTZ,
          catatan_bendahara TEXT,
          diverifikasi_ppk_oleh INTEGER,
          diverifikasi_ppk_at TIMESTAMPTZ,
          catatan_ppk TEXT,
          dasar_hukum_tolak TEXT,
          disetujui_oleh INTEGER,
          disetujui_at TIMESTAMPTZ,
          dibayarkan_oleh INTEGER,
          dibayarkan_at TIMESTAMPTZ,
          nomor_rekening_penerima VARCHAR(50),
          bank_penerima VARCHAR(100),
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          jenis_bendahara VARCHAR(16),
          bendahara_pengirim_id INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS dpa (
          id SERIAL PRIMARY KEY,
          tahun_anggaran INTEGER NOT NULL,
          kode_sub_kegiatan VARCHAR(50) NOT NULL,
          nama_sub_kegiatan VARCHAR(255) NOT NULL,
          kode_rekening VARCHAR(50) NOT NULL,
          uraian_belanja VARCHAR(255) NOT NULL,
          jenis_belanja VARCHAR(16) NOT NULL,
          pagu_anggaran NUMERIC(15,2) NOT NULL,
          realisasi NUMERIC(15,2) NOT NULL DEFAULT 0,
          epelara_dpa_id VARCHAR(100),
          sinkronisasi_terakhir TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE (tahun_anggaran, kode_rekening)
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS rka (
          id SERIAL PRIMARY KEY,
          tahun_anggaran INTEGER NOT NULL,
          kode_sub_kegiatan VARCHAR(50) NOT NULL,
          nama_sub_kegiatan VARCHAR(255) NOT NULL,
          kode_rekening VARCHAR(50) NOT NULL,
          uraian_belanja VARCHAR(255) NOT NULL,
          jenis_belanja VARCHAR(16) NOT NULL,
          pagu_diusulkan NUMERIC(15,2) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'draft',
          dibuat_oleh INTEGER,
          disetujui_oleh INTEGER,
          disetujui_at TIMESTAMPTZ,
          epelara_rka_id VARCHAR(100),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS realisasi_anggaran (
          id SERIAL PRIMARY KEY,
          dpa_id INTEGER NOT NULL,
          bulan INTEGER NOT NULL,
          tahun INTEGER NOT NULL,
          realisasi_bulan_ini NUMERIC(15,2) NOT NULL,
          kumulatif_realisasi NUMERIC(15,2) NOT NULL,
          sumber_data VARCHAR(16) NOT NULL DEFAULT 'spj_otomatis',
          keterangan TEXT,
          diinput_oleh INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE (dpa_id, bulan, tahun)
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS analisa_keuangan (
          id SERIAL PRIMARY KEY,
          nomor_analisa VARCHAR(50) UNIQUE,
          judul VARCHAR(255) NOT NULL,
          jenis_analisa VARCHAR(64) NOT NULL,
          spj_id INTEGER,
          bendahara_pengirim_id INTEGER,
          jenis_bendahara VARCHAR(16),
          dokumen_input_url VARCHAR(500),
          dokumen_hasil_url VARCHAR(500),
          checklist_ppk JSONB,
          temuan_ppk TEXT,
          dasar_hukum TEXT,
          rekomendasi TEXT,
          tujuan_submit VARCHAR(32) NOT NULL DEFAULT 'sekretaris',
          status VARCHAR(64) NOT NULL DEFAULT 'draft',
          keputusan_kasubag VARCHAR(32),
          catatan_kasubag TEXT,
          diputuskan_kasubag_at TIMESTAMPTZ,
          diputuskan_kasubag_oleh INTEGER,
          keputusan_sekretaris VARCHAR(32),
          catatan_sekretaris TEXT,
          diputuskan_sekretaris_at TIMESTAMPTZ,
          diputuskan_sekretaris_oleh INTEGER,
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          revisi_dari INTEGER,
          dibuat_oleh INTEGER NOT NULL,
          task_id INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS uang_persediaan (
          id SERIAL PRIMARY KEY,
          tahun_anggaran INTEGER NOT NULL,
          jenis VARCHAR(16) NOT NULL,
          nominal_diajukan NUMERIC(15,2) NOT NULL,
          nominal_disetujui NUMERIC(15,2),
          tanggal_pengajuan DATE NOT NULL,
          tanggal_cair_bpkad DATE,
          nominal_cair NUMERIC(15,2),
          status VARCHAR(32) NOT NULL DEFAULT 'draft',
          catatan_sekretaris TEXT,
          diajukan_oleh INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS buku_kas_umum (
          id SERIAL PRIMARY KEY,
          tanggal DATE NOT NULL,
          uraian VARCHAR(255) NOT NULL,
          nomor_bukti VARCHAR(100),
          jenis_transaksi VARCHAR(8) NOT NULL,
          nominal NUMERIC(15,2) NOT NULL,
          saldo_setelah NUMERIC(15,2) NOT NULL,
          referensi_tabel VARCHAR(32),
          referensi_id INTEGER,
          keterangan TEXT,
          input_otomatis BOOLEAN NOT NULL DEFAULT FALSE,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS daftar_gaji (
          id SERIAL PRIMARY KEY,
          periode_bulan INTEGER NOT NULL,
          periode_tahun INTEGER NOT NULL,
          nomor_daftar_gaji VARCHAR(50) UNIQUE,
          jumlah_asn INTEGER NOT NULL DEFAULT 0,
          total_gaji_kotor NUMERIC(15,2) NOT NULL DEFAULT 0,
          total_potongan NUMERIC(15,2) NOT NULL DEFAULT 0,
          total_gaji_bersih NUMERIC(15,2) NOT NULL DEFAULT 0,
          pagu_dpa_belanja_pegawai NUMERIC(15,2),
          sisa_pagu NUMERIC(15,2),
          status VARCHAR(64) NOT NULL DEFAULT 'draft',
          catatan_jf_keuangan TEXT,
          dianalisa_oleh INTEGER,
          dianalisa_at TIMESTAMPTZ,
          catatan_sekretaris TEXT,
          disetujui_sekretaris_oleh INTEGER,
          disetujui_at TIMESTAMPTZ,
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE (periode_bulan, periode_tahun, dibuat_oleh)
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS aset_barang (
          id SERIAL PRIMARY KEY,
          nomor_register VARCHAR(50) UNIQUE NOT NULL,
          kode_barang VARCHAR(50),
          nama_barang VARCHAR(255) NOT NULL,
          spesifikasi TEXT,
          jenis_aset VARCHAR(32) NOT NULL,
          kategori_belanja VARCHAR(16) NOT NULL,
          tahun_perolehan INTEGER NOT NULL,
          nilai_perolehan NUMERIC(15,2) NOT NULL,
          nilai_buku NUMERIC(15,2),
          unit_kerja VARCHAR(64) NOT NULL DEFAULT 'Sekretariat',
          lokasi_fisik VARCHAR(255),
          pemegang_id INTEGER,
          kondisi VARCHAR(16) NOT NULL DEFAULT 'baik',
          status VARCHAR(16) NOT NULL DEFAULT 'aktif',
          foto_url VARCHAR(500),
          dokumen_url VARCHAR(500),
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS penerimaan_barang (
          id SERIAL PRIMARY KEY,
          nomor_bast VARCHAR(50) UNIQUE,
          nama_pengadaan VARCHAR(255) NOT NULL,
          nama_rekanan VARCHAR(255) NOT NULL,
          nilai_kontrak NUMERIC(15,2) NOT NULL,
          nomor_kontrak VARCHAR(100),
          sub_kegiatan_kode VARCHAR(50),
          daftar_barang JSONB NOT NULL DEFAULT '[]'::jsonb,
          tanggal_pengiriman DATE,
          tanggal_bast DATE,
          status VARCHAR(64) NOT NULL DEFAULT 'menunggu_kedatangan',
          catatan_ppk TEXT,
          catatan_sekretaris TEXT,
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS pemeliharaan_aset (
          id SERIAL PRIMARY KEY,
          aset_id INTEGER NOT NULL,
          jenis_pemeliharaan VARCHAR(32) NOT NULL,
          tanggal_jadwal DATE NOT NULL,
          tanggal_realisasi DATE,
          deskripsi TEXT NOT NULL,
          vendor_bengkel VARCHAR(255),
          biaya_estimasi NUMERIC(15,2) NOT NULL DEFAULT 0,
          biaya_realisasi NUMERIC(15,2),
          status VARCHAR(32) NOT NULL DEFAULT 'dijadwalkan',
          spj_id INTEGER,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS laporan_kerusakan_aset (
          id SERIAL PRIMARY KEY,
          aset_id INTEGER,
          nama_aset VARCHAR(255) NOT NULL,
          lokasi_aset VARCHAR(255) NOT NULL,
          jenis_kerusakan VARCHAR(32) NOT NULL,
          deskripsi TEXT NOT NULL,
          tingkat_urgensi VARCHAR(16) NOT NULL DEFAULT 'normal',
          foto_url VARCHAR(500),
          dilaporkan_oleh INTEGER NOT NULL,
          unit_pelapor VARCHAR(100),
          status_tindak_lanjut VARCHAR(32) NOT NULL DEFAULT 'belum_ditindaklanjuti',
          catatan_tindak_lanjut TEXT,
          ditindaklanjuti_oleh INTEGER,
          ditindaklanjuti_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS sub_checklist_tugas (
          id SERIAL PRIMARY KEY,
          task_id INTEGER NOT NULL,
          dibuat_oleh INTEGER NOT NULL,
          deskripsi VARCHAR(255) NOT NULL,
          is_selesai BOOLEAN NOT NULL DEFAULT FALSE,
          selesai_at TIMESTAMPTZ,
          urutan INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS absensi_harian (
          id SERIAL PRIMARY KEY,
          pegawai_id INTEGER NOT NULL,
          tanggal DATE NOT NULL,
          status VARCHAR(16) NOT NULL,
          keterangan TEXT,
          ref_absen_online VARCHAR(100),
          ref_sppd_id INTEGER,
          perlu_substitusi BOOLEAN NOT NULL DEFAULT FALSE,
          verified_by INTEGER,
          verified_at TIMESTAMPTZ
        );
      `);
    } else {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS analisa_perencanaan (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nomor_analisa VARCHAR(50) UNIQUE,
          judul VARCHAR(255) NOT NULL,
          jenis_analisa VARCHAR(64) NOT NULL,
          dokumen_input_url VARCHAR(500),
          sumber_data_epelara VARCHAR(500),
          periode_tahun INTEGER,
          periode_triwulan INTEGER,
          catatan_teknis TEXT,
          rekomendasi TEXT,
          temuan_cascading JSON,
          skor_kesesuaian_rpjmd DECIMAL(5,2),
          dokumen_hasil_url VARCHAR(500),
          tujuan_submit VARCHAR(32) NOT NULL DEFAULT 'sekretaris',
          status VARCHAR(64) NOT NULL DEFAULT 'draft',
          task_id INTEGER,
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          revisi_dari INTEGER,
          keputusan_kasubag VARCHAR(32),
          catatan_kasubag TEXT,
          diputuskan_kasubag_at TIMESTAMP,
          diputuskan_kasubag_oleh INTEGER,
          keputusan_sekretaris VARCHAR(32),
          catatan_sekretaris TEXT,
          diputuskan_sekretaris_at TIMESTAMP,
          diputuskan_sekretaris_oleh INTEGER,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS spj (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nomor_spj VARCHAR(50) UNIQUE,
          jenis_belanja VARCHAR(32) NOT NULL,
          sub_kegiatan_kode VARCHAR(50) NOT NULL,
          kode_rekening VARCHAR(50) NOT NULL,
          nominal DECIMAL(15,2) NOT NULL,
          keterangan TEXT,
          dibuat_oleh INTEGER NOT NULL,
          tanggal_kegiatan DATE NOT NULL,
          lampiran_url VARCHAR(500),
          status VARCHAR(64) NOT NULL DEFAULT 'draft',
          diverifikasi_bendahara_oleh INTEGER,
          diverifikasi_bendahara_at TIMESTAMP,
          catatan_bendahara TEXT,
          diverifikasi_ppk_oleh INTEGER,
          diverifikasi_ppk_at TIMESTAMP,
          catatan_ppk TEXT,
          dasar_hukum_tolak TEXT,
          disetujui_oleh INTEGER,
          disetujui_at TIMESTAMP,
          dibayarkan_oleh INTEGER,
          dibayarkan_at TIMESTAMP,
          nomor_rekening_penerima VARCHAR(50),
          bank_penerima VARCHAR(100),
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          jenis_bendahara VARCHAR(16),
          bendahara_pengirim_id INTEGER,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS dpa (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tahun_anggaran INTEGER NOT NULL,
          kode_sub_kegiatan VARCHAR(50) NOT NULL,
          nama_sub_kegiatan VARCHAR(255) NOT NULL,
          kode_rekening VARCHAR(50) NOT NULL,
          uraian_belanja VARCHAR(255) NOT NULL,
          jenis_belanja VARCHAR(16) NOT NULL,
          pagu_anggaran DECIMAL(15,2) NOT NULL,
          realisasi DECIMAL(15,2) NOT NULL DEFAULT 0,
          epelara_dpa_id VARCHAR(100),
          sinkronisasi_terakhir TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_dpa_unique ON dpa(tahun_anggaran, kode_rekening);
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS rka (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tahun_anggaran INTEGER NOT NULL,
          kode_sub_kegiatan VARCHAR(50) NOT NULL,
          nama_sub_kegiatan VARCHAR(255) NOT NULL,
          kode_rekening VARCHAR(50) NOT NULL,
          uraian_belanja VARCHAR(255) NOT NULL,
          jenis_belanja VARCHAR(16) NOT NULL,
          pagu_diusulkan DECIMAL(15,2) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'draft',
          dibuat_oleh INTEGER,
          disetujui_oleh INTEGER,
          disetujui_at TIMESTAMP,
          epelara_rka_id VARCHAR(100),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS realisasi_anggaran (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dpa_id INTEGER NOT NULL,
          bulan INTEGER NOT NULL,
          tahun INTEGER NOT NULL,
          realisasi_bulan_ini DECIMAL(15,2) NOT NULL,
          kumulatif_realisasi DECIMAL(15,2) NOT NULL,
          sumber_data VARCHAR(16) NOT NULL DEFAULT 'spj_otomatis',
          keterangan TEXT,
          diinput_oleh INTEGER,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_realisasi_unique ON realisasi_anggaran(dpa_id, bulan, tahun);
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS analisa_keuangan (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nomor_analisa VARCHAR(50) UNIQUE,
          judul VARCHAR(255) NOT NULL,
          jenis_analisa VARCHAR(64) NOT NULL,
          spj_id INTEGER,
          bendahara_pengirim_id INTEGER,
          jenis_bendahara VARCHAR(16),
          dokumen_input_url VARCHAR(500),
          dokumen_hasil_url VARCHAR(500),
          checklist_ppk JSON,
          temuan_ppk TEXT,
          dasar_hukum TEXT,
          rekomendasi TEXT,
          tujuan_submit VARCHAR(32) NOT NULL DEFAULT 'sekretaris',
          status VARCHAR(64) NOT NULL DEFAULT 'draft',
          keputusan_kasubag VARCHAR(32),
          catatan_kasubag TEXT,
          diputuskan_kasubag_at TIMESTAMP,
          diputuskan_kasubag_oleh INTEGER,
          keputusan_sekretaris VARCHAR(32),
          catatan_sekretaris TEXT,
          diputuskan_sekretaris_at TIMESTAMP,
          diputuskan_sekretaris_oleh INTEGER,
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          revisi_dari INTEGER,
          dibuat_oleh INTEGER NOT NULL,
          task_id INTEGER,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS uang_persediaan (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tahun_anggaran INTEGER NOT NULL,
          jenis VARCHAR(16) NOT NULL,
          nominal_diajukan DECIMAL(15,2) NOT NULL,
          nominal_disetujui DECIMAL(15,2),
          tanggal_pengajuan DATE NOT NULL,
          tanggal_cair_bpkad DATE,
          nominal_cair DECIMAL(15,2),
          status VARCHAR(32) NOT NULL DEFAULT 'draft',
          catatan_sekretaris TEXT,
          diajukan_oleh INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS buku_kas_umum (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tanggal DATE NOT NULL,
          uraian VARCHAR(255) NOT NULL,
          nomor_bukti VARCHAR(100),
          jenis_transaksi VARCHAR(8) NOT NULL,
          nominal DECIMAL(15,2) NOT NULL,
          saldo_setelah DECIMAL(15,2) NOT NULL,
          referensi_tabel VARCHAR(32),
          referensi_id INTEGER,
          keterangan TEXT,
          input_otomatis INTEGER NOT NULL DEFAULT 0,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS daftar_gaji (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          periode_bulan INTEGER NOT NULL,
          periode_tahun INTEGER NOT NULL,
          nomor_daftar_gaji VARCHAR(50) UNIQUE,
          jumlah_asn INTEGER NOT NULL DEFAULT 0,
          total_gaji_kotor DECIMAL(15,2) NOT NULL DEFAULT 0,
          total_potongan DECIMAL(15,2) NOT NULL DEFAULT 0,
          total_gaji_bersih DECIMAL(15,2) NOT NULL DEFAULT 0,
          pagu_dpa_belanja_pegawai DECIMAL(15,2),
          sisa_pagu DECIMAL(15,2),
          status VARCHAR(64) NOT NULL DEFAULT 'draft',
          catatan_jf_keuangan TEXT,
          dianalisa_oleh INTEGER,
          dianalisa_at TIMESTAMP,
          catatan_sekretaris TEXT,
          disetujui_sekretaris_oleh INTEGER,
          disetujui_at TIMESTAMP,
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_daftar_gaji_unique ON daftar_gaji(periode_bulan, periode_tahun, dibuat_oleh);
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS aset_barang (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nomor_register VARCHAR(50) UNIQUE NOT NULL,
          kode_barang VARCHAR(50),
          nama_barang VARCHAR(255) NOT NULL,
          spesifikasi TEXT,
          jenis_aset VARCHAR(32) NOT NULL,
          kategori_belanja VARCHAR(16) NOT NULL,
          tahun_perolehan INTEGER NOT NULL,
          nilai_perolehan DECIMAL(15,2) NOT NULL,
          nilai_buku DECIMAL(15,2),
          unit_kerja VARCHAR(64) NOT NULL DEFAULT 'Sekretariat',
          lokasi_fisik VARCHAR(255),
          pemegang_id INTEGER,
          kondisi VARCHAR(16) NOT NULL DEFAULT 'baik',
          status VARCHAR(16) NOT NULL DEFAULT 'aktif',
          foto_url VARCHAR(500),
          dokumen_url VARCHAR(500),
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS penerimaan_barang (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nomor_bast VARCHAR(50) UNIQUE,
          nama_pengadaan VARCHAR(255) NOT NULL,
          nama_rekanan VARCHAR(255) NOT NULL,
          nilai_kontrak DECIMAL(15,2) NOT NULL,
          nomor_kontrak VARCHAR(100),
          sub_kegiatan_kode VARCHAR(50),
          daftar_barang JSON NOT NULL,
          tanggal_pengiriman DATE,
          tanggal_bast DATE,
          status VARCHAR(64) NOT NULL DEFAULT 'menunggu_kedatangan',
          catatan_ppk TEXT,
          catatan_sekretaris TEXT,
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS pemeliharaan_aset (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aset_id INTEGER NOT NULL,
          jenis_pemeliharaan VARCHAR(32) NOT NULL,
          tanggal_jadwal DATE NOT NULL,
          tanggal_realisasi DATE,
          deskripsi TEXT NOT NULL,
          vendor_bengkel VARCHAR(255),
          biaya_estimasi DECIMAL(15,2) NOT NULL DEFAULT 0,
          biaya_realisasi DECIMAL(15,2),
          status VARCHAR(32) NOT NULL DEFAULT 'dijadwalkan',
          spj_id INTEGER,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS laporan_kerusakan_aset (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aset_id INTEGER,
          nama_aset VARCHAR(255) NOT NULL,
          lokasi_aset VARCHAR(255) NOT NULL,
          jenis_kerusakan VARCHAR(32) NOT NULL,
          deskripsi TEXT NOT NULL,
          tingkat_urgensi VARCHAR(16) NOT NULL DEFAULT 'normal',
          foto_url VARCHAR(500),
          dilaporkan_oleh INTEGER NOT NULL,
          unit_pelapor VARCHAR(100),
          status_tindak_lanjut VARCHAR(32) NOT NULL DEFAULT 'belum_ditindaklanjuti',
          catatan_tindak_lanjut TEXT,
          ditindaklanjuti_oleh INTEGER,
          ditindaklanjuti_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS sub_checklist_tugas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          dibuat_oleh INTEGER NOT NULL,
          deskripsi VARCHAR(255) NOT NULL,
          is_selesai INTEGER NOT NULL DEFAULT 0,
          selesai_at TIMESTAMP,
          urutan INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS absensi_harian (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pegawai_id INTEGER NOT NULL,
          tanggal DATE NOT NULL,
          status VARCHAR(16) NOT NULL,
          keterangan TEXT,
          ref_absen_online VARCHAR(100),
          ref_sppd_id INTEGER,
          perlu_substitusi INTEGER NOT NULL DEFAULT 0,
          verified_by INTEGER,
          verified_at TIMESTAMP
        );
      `);
    }
  } catch (e) {
    console.warn("[ensureJfSekretariatTables] skipped:", e?.message || e);
  }
}

await ensureJfSekretariatTables();
app.use("/api/bypassdetection", bypassDetectionRoutes);
app.use("/api/sub-kegiatan-usul", subKegiatanUsulRoutes);
app.use("/api/uptd-ops", uptdOpsRoutes);
app.use("/api/sekretaris", sekretarisRoutes);
app.use("/api/public", publicRoutes);

// Register all auto-generated routes
registerRoutes(app);

// Error handler

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// Start server
async function startServer() {
  try {
    await testConnection();

    // Sync database models (only create tables if not exist)
    await sequelize.sync();

    // Hotfix schema patcher (dev-friendly):
    // pastikan kolom baru yang dipakai model sudah ada di SQLite.
    // Tanpa ini, Sequelize akan error "column ... does not exist" saat query.
    try {
      const qi = sequelize.getQueryInterface();
      const table = await qi.describeTable("Tasks");
      if (!table.sumber_perintah_kadin) {
        await qi.addColumn("Tasks", "sumber_perintah_kadin", {
          type: SequelizePkg.DataTypes.INTEGER,
          allowNull: true,
        });
        console.log("✅ Patched schema: added Tasks.sumber_perintah_kadin");
      }
    } catch (schemaErr) {
      console.warn(
        "⚠️ Schema patch skipped:",
        schemaErr?.message || schemaErr,
      );
    }

    // Inisialisasi Socket.IO
    await initSocketIOAsync(httpServer);

    // Mulai KPI polling (5 menit)
    startKPIPolling();

    // SLA escalation + daily digest schedulers
    await initSLAScheduler();
    await initDailyDigestScheduler();

    initInflasiHarianCron(console);

    httpServer.listen(PORT, () => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`SIGAP Malut Backend Server`);
      console.log(`${"=".repeat(60)}`);
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Database: ${sequelize.getDialect()}`);
      console.log(`WebSocket: Socket.IO aktif di ws://localhost:${PORT}`);
      console.log(`KPI Polling: setiap 5 menit`);
      console.log(`SLA Scheduler: aktif`);
      console.log(`Daily Digest: aktif`);
      console.log(
        `Inflasi harian (cron Laspeyres-tipe): ${process.env.INFLASI_CRON_DISABLED === "1" ? "nonaktif" : "aktif"}`,
      );
      console.log(`${"=".repeat(60)}\n`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      stopKPIPolling();
      httpServer.close();
    });
    process.on("SIGINT", () => {
      stopKPIPolling();
      httpServer.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Export default untuk kebutuhan testing (misal supertest/mocha)
export default app;
