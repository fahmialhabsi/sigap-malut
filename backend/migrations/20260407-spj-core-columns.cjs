/**
 * Migrasi korektif: tambah semua kolom inti tabel `spj` yang mungkin belum ada.
 *
 * Tabel spj mungkin hanya berisi kolom-kolom legacy (id, nomor_spj, status, dll.)
 * sementara model Spj.js mendefinisikan banyak kolom baru.
 * Migrasi ini bersifat idempotent (skip jika kolom sudah ada).
 */
"use strict";

async function safeAdd(qi, table, col, def) {
  const desc = await qi.describeTable(table).catch(() => null);
  if (!desc || desc[col]) return; // kolom sudah ada, skip
  await qi.addColumn(table, col, def);
  console.log(`[spj-core-columns] ADDED column ${table}.${col}`);
}

module.exports = {
  async up(qi, Sq) {
    const T = "spj";

    // Cek tabel ada
    const tables = await qi.showAllTables();
    if (!tables.map((t) => String(t).toLowerCase()).includes(T)) {
      console.warn(`[spj-core-columns] Tabel "${T}" tidak ditemukan, skip.`);
      return;
    }

    // ── Kolom inti yang wajib ada ──────────────────────────────────────────────
    await safeAdd(qi, T, "jenis_belanja", {
      type: Sq.STRING(32),
      allowNull: true, // nullable saat ALTER (data lama tidak punya nilai)
    });

    await safeAdd(qi, T, "sub_kegiatan_kode", {
      type: Sq.STRING(50),
      allowNull: true,
      defaultValue: "SEKRETARIAT",
    });

    await safeAdd(qi, T, "kode_rekening", {
      type: Sq.STRING(50),
      allowNull: true,
      defaultValue: "5.2.2.11.01",
    });

    await safeAdd(qi, T, "nominal", {
      type: Sq.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    });

    await safeAdd(qi, T, "keterangan", {
      type: Sq.TEXT,
      allowNull: true,
    });

    await safeAdd(qi, T, "dibuat_oleh", {
      type: Sq.INTEGER,
      allowNull: true,
    });

    await safeAdd(qi, T, "tanggal_kegiatan", {
      type: Sq.DATEONLY,
      allowNull: true,
    });

    // ── Field verifikasi Bendahara ─────────────────────────────────────────────
    await safeAdd(qi, T, "diverifikasi_bendahara_oleh", {
      type: Sq.INTEGER,
      allowNull: true,
    });

    await safeAdd(qi, T, "diverifikasi_bendahara_at", {
      type: Sq.DATE,
      allowNull: true,
    });

    await safeAdd(qi, T, "catatan_bendahara", {
      type: Sq.TEXT,
      allowNull: true,
    });

    // ── Field verifikasi PPK ───────────────────────────────────────────────────
    await safeAdd(qi, T, "diverifikasi_ppk_oleh", {
      type: Sq.INTEGER,
      allowNull: true,
    });

    await safeAdd(qi, T, "diverifikasi_ppk_at", {
      type: Sq.DATE,
      allowNull: true,
    });

    await safeAdd(qi, T, "catatan_ppk", {
      type: Sq.TEXT,
      allowNull: true,
    });

    await safeAdd(qi, T, "dasar_hukum_tolak", {
      type: Sq.TEXT,
      allowNull: true,
    });

    // ── Field legacy ───────────────────────────────────────────────────────────
    await safeAdd(qi, T, "disetujui_oleh", { type: Sq.INTEGER, allowNull: true });
    await safeAdd(qi, T, "disetujui_at", { type: Sq.DATE, allowNull: true });
    await safeAdd(qi, T, "dibayarkan_oleh", { type: Sq.INTEGER, allowNull: true });
    await safeAdd(qi, T, "dibayarkan_at", { type: Sq.DATE, allowNull: true });
    await safeAdd(qi, T, "nomor_rekening_penerima", { type: Sq.STRING(50), allowNull: true });
    await safeAdd(qi, T, "bank_penerima", { type: Sq.STRING(100), allowNull: true });
    await safeAdd(qi, T, "revisi_ke", {
      type: Sq.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await safeAdd(qi, T, "jenis_bendahara", { type: Sq.STRING(16), allowNull: true });
    await safeAdd(qi, T, "bendahara_pengirim_id", { type: Sq.INTEGER, allowNull: true });

    // Index untuk query umum
    await qi.addIndex(T, ["dibuat_oleh", "status"], {
      name: "idx_spj_dibuat_oleh_status",
    }).catch(() => null);

    await qi.addIndex(T, ["status"], {
      name: "idx_spj_status",
    }).catch(() => null);
  },

  async down() {
    // Tidak di-rollback karena kolom ini fundamental
  },
};
