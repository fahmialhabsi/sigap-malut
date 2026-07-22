import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

/**
 * Model SPJ — mencakup Kondisi A (Mandiri) dan Kondisi B (Delegasi).
 *
 * Alur status:
 *   Kondisi A: draft → diajukan_ke_bendahara → terverifikasi_bendahara
 *              → diajukan_ke_ppk → terverifikasi_ppk (selesai di SIGAP-MALUT)
 *
 *   Kondisi B: draft_delegasi → menunggu_konfirmasi_pejabat
 *              → dikonfirmasi_pejabat (atau ditolak_pejabat → kembali ke draft_delegasi)
 *              → diajukan_ke_bendahara → terverifikasi_bendahara
 *              → diajukan_ke_ppk → terverifikasi_ppk
 *
 * Sesuai: Permendagri 77/2020, PP 12/2019, dokumen 41-pedoman-mekanisme-spj.
 * Scope sistem: cukup sampai PPK-SKPD (terverifikasi_ppk + penerbitan nomor SPM).
 * PA otorisasi SPM dan SP2D diproses di SIPD/SIMDA — di luar scope SIGAP-MALUT.
 */
const Spj =
  sequelize.models.Spj ||
  sequelize.define(
    "Spj",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      nomor_spj: { type: DataTypes.STRING(50), allowNull: true, unique: true },

      // ── Kondisi A / B ──────────────────────────────────────────────────────
      jenis_kondisi: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: "mandiri",
        // 'mandiri' | 'delegasi'
      },
      // Kondisi B: ID pejabat yang namanya tercantum di SPJ (Kabid/Sekretaris/Kasubag/dll)
      atas_nama_pejabat_id: { type: DataTypes.INTEGER, allowNull: true },
      // PPTK yang bertanggung jawab atas kegiatan ini (biasanya Pelaksana yang ditugaskan)
      pptk_id: { type: DataTypes.INTEGER, allowNull: true },

      // ── Konfirmasi pejabat (kondisi B) ─────────────────────────────────────
      konfirmasi_pejabat_at: { type: DataTypes.DATE, allowNull: true },
      konfirmasi_pejabat_ip: { type: DataTypes.STRING(45), allowNull: true },
      catatan_penolakan_pejabat: { type: DataTypes.TEXT, allowNull: true },
      // Batas waktu 3 hari kerja untuk konfirmasi pejabat
      deadline_konfirmasi: { type: DataTypes.DATEONLY, allowNull: true },

      // ── Data utama SPJ ─────────────────────────────────────────────────────
      jenis_belanja: { type: DataTypes.STRING(32), allowNull: false },
      sub_kegiatan_kode: { type: DataTypes.STRING(50), allowNull: false },
      kode_rekening: { type: DataTypes.STRING(50), allowNull: false },
      nominal: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      uraian_kegiatan: { type: DataTypes.TEXT, allowNull: true },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
      tanggal_kegiatan: { type: DataTypes.DATEONLY, allowNull: false },
      // TEXT agar bisa menyimpan JSON array multi-dokumen [{jenis, label, url}]
      // Backward-compatible: plain URL lama tetap bisa dibaca
      lampiran_url: { type: DataTypes.TEXT, allowNull: true },

      // Unit kerja asal pengajuan (Bidang/UPTD → semua ke Sekretariat)
      unit_kerja_asal: { type: DataTypes.STRING(100), allowNull: true },

      // ── Status workflow ────────────────────────────────────────────────────
      status: {
        type: DataTypes.STRING(64),
        allowNull: false,
        defaultValue: "draft",
        // Kondisi A: draft → diajukan_ke_bendahara → terverifikasi_bendahara
        //            → diajukan_ke_ppk → terverifikasi_ppk
        // Kondisi B: draft_delegasi → menunggu_konfirmasi_pejabat
        //            → dikonfirmasi_pejabat / ditolak_pejabat
        //            → diajukan_ke_bendahara → (sama seperti A)
        // Return paths: dikembalikan_bendahara, dikembalikan_ppk, ditolak_ppk
      },

      // ── Verifikasi Bendahara Pengeluaran ───────────────────────────────────
      diverifikasi_bendahara_oleh: { type: DataTypes.INTEGER, allowNull: true },
      diverifikasi_bendahara_at: { type: DataTypes.DATE, allowNull: true },
      catatan_bendahara: { type: DataTypes.TEXT, allowNull: true },

      // ── Verifikasi PPK-SKPD ────────────────────────────────────────────────
      diverifikasi_ppk_oleh: { type: DataTypes.INTEGER, allowNull: true },
      diverifikasi_ppk_at: { type: DataTypes.DATE, allowNull: true },
      catatan_ppk: { type: DataTypes.TEXT, allowNull: true },
      dasar_hukum_tolak: { type: DataTypes.TEXT, allowNull: true },

      // Nomor SPM diterbitkan PPK-SKPD setelah verifikasi selesai
      nomor_spm: { type: DataTypes.STRING(50), allowNull: true },
      tanggal_spm: { type: DataTypes.DATEONLY, allowNull: true },

      // ── Field legacy (dipertahankan untuk kompatibilitas) ──────────────────
      disetujui_oleh: { type: DataTypes.INTEGER, allowNull: true },
      disetujui_at: { type: DataTypes.DATE, allowNull: true },
      dibayarkan_oleh: { type: DataTypes.INTEGER, allowNull: true },
      dibayarkan_at: { type: DataTypes.DATE, allowNull: true },
      nomor_rekening_penerima: { type: DataTypes.STRING(50), allowNull: true },
      bank_penerima: { type: DataTypes.STRING(100), allowNull: true },
      revisi_ke: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      jenis_bendahara: { type: DataTypes.STRING(16), allowNull: true },
      bendahara_pengirim_id: { type: DataTypes.INTEGER, allowNull: true },
      execution_thread_id: { type: DataTypes.STRING(36), allowNull: true },
      task_id: { type: DataTypes.INTEGER, allowNull: true },

      master_program_id: { type: DataTypes.INTEGER, allowNull: true },
      master_kegiatan_id: { type: DataTypes.INTEGER, allowNull: true },
      master_sub_kegiatan_id: { type: DataTypes.INTEGER, allowNull: true },

      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "spj",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default Spj;

