import sequelize from "../../config/database.js";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";
import User from "../../models/User.js";
import UserHierarchy from "../../models/UserHierarchy.js";

async function ensureUserHierarchyTable() {
  // migrate.js tidak menjalankan JS migrations, jadi pastikan tabel ada.
  const dialect = sequelize.getDialect();
  if (dialect === "postgres") {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_hierarchy (
        id SERIAL PRIMARY KEY,
        atasan_id INTEGER NOT NULL,
        bawahan_id INTEGER NOT NULL,
        adalah_primer BOOLEAN NOT NULL DEFAULT TRUE,
        catatan TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (atasan_id, bawahan_id)
      );
    `);
  } else {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_hierarchy (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        atasan_id INTEGER NOT NULL,
        bawahan_id INTEGER NOT NULL,
        adalah_primer BOOLEAN NOT NULL DEFAULT 1,
        catatan TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(atasan_id, bawahan_id)
      );
    `);
  }
}

async function getUserIdByEmail(email) {
  const row = await User.findOne({ where: { email } }).catch(() => null);
  return row?.id ?? null;
}

export async function seedUserHierarchyKasubagDemo() {
  console.log("🧭 Seeding user_hierarchy + demo tasks (Kasubag)...\n");

  await ensureUserHierarchyTable();
  // Pastikan tabel task/assignment ada (dibuat oleh model, tidak ada di schema SQL)
  await sequelize.sync();

  const kasubagId = await getUserIdByEmail("kasubag.uk@example.com");
  const pelA = await getUserIdByEmail("pelaksana.a@example.com");
  const pelB = await getUserIdByEmail("pelaksana.b@example.com");
  const pelC = await getUserIdByEmail("pelaksana.c@example.com");
  const bendPeng = await getUserIdByEmail("bendahara.pengeluaran@example.com");
  const bendGaji = await getUserIdByEmail("bendahara.gaji@example.com");
  const bendBarang = await getUserIdByEmail("bendahara.barang@example.com");

  const bawahan = [pelA, pelB, pelC, bendPeng, bendGaji, bendBarang].filter(Boolean);
  if (!kasubagId || bawahan.length === 0) {
    console.warn("  ⚠️ Kasubag atau bawahan tidak ditemukan. Pastikan seedUsers sudah jalan.");
    return;
  }

  for (const bawahanId of bawahan) {
    await UserHierarchy.create({
      atasan_id: kasubagId,
      bawahan_id: bawahanId,
      adalah_primer: true,
      catatan: "Seeder demo Prompt 4",
    }).catch(() => {});
  }

  // Buat beberapa task agar kanban terisi lintas status
  const mk = async ({ title, status, assignee_user_id, priority = 3, dueInDays = 3, catatan = null, revisi_ke = 0 }) => {
    const task = await Task.create({
      title,
      description: "Seeder demo untuk Kanban Kasubag",
      module: "SEK-UK",
      source_unit: "Sekretariat",
      priority,
      due_date: new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000),
      created_by: kasubagId,
      status,
      catatan_verifikasi: catatan,
      revisi_ke,
      returned_by: catatan ? kasubagId : null,
      returned_at: catatan ? new Date() : null,
      metadata: { ringkas: "Demo Kanban", seeded: true },
    }).catch(() => null);

    if (!task) return;

    await TaskAssignment.create({
      task_id: task.id,
      assignee_role: "pelaksana",
      assignee_user_id,
      assigned_by: kasubagId,
      status: status === "accepted" ? "accepted" : "assigned",
    }).catch(() => {});
  };

  // Pelaksana A/B/C
  await mk({ title: "Input absensi harian (hari ini)", status: "assigned", assignee_user_id: pelA, dueInDays: 0 });
  await mk({ title: "Rekap surat masuk minggu ini", status: "in_progress", assignee_user_id: pelB, dueInDays: 2 });
  await mk({ title: "Draft surat keluar undangan rapat", status: "submitted", assignee_user_id: pelC, dueInDays: 1 });
  await mk({
    title: "Perbaiki data ASN (NIP/golongan) — revisi",
    status: "returned_to_pelaksana",
    assignee_user_id: pelA,
    dueInDays: 1,
    catatan: "NIP belum lengkap dan format golongan salah. Mohon revisi sesuai template.",
    revisi_ke: 1,
  });
  await mk({ title: "Arsip digital SK bulan lalu", status: "closed", assignee_user_id: pelB, dueInDays: -1 });

  // 3 Bendahara (untuk demo kanban, sesuai permintaan)
  await mk({ title: "Siapkan rekap GU/TUP bulan ini", status: "accepted", assignee_user_id: bendPeng, dueInDays: 5 });
  await mk({ title: "Sinkronisasi data gaji ASN (cek perubahan kepegawaian)", status: "in_progress", assignee_user_id: bendGaji, dueInDays: 4 });
  await mk({
    title: "Verifikasi dokumen BAST pengadaan (cek kelengkapan)",
    status: "submitted",
    assignee_user_id: bendBarang,
    dueInDays: 3,
  });

  console.log("  ✅ user_hierarchy + demo tasks seeded\n");
}

export async function seedKeuanganPpkDemo() {
  console.log("💰 Seeding demo SPJ + DPA untuk PPK queue...\n");

  await sequelize.sync();

  const jfKeu = await getUserIdByEmail("jf.keuangan@example.com");
  const bendPeng = await getUserIdByEmail("bendahara.pengeluaran@example.com");
  const bendGaji = await getUserIdByEmail("bendahara.gaji@example.com");
  const bendBarang = await getUserIdByEmail("bendahara.barang@example.com");
  const pelA = await getUserIdByEmail("pelaksana.a@example.com");

  if (!jfKeu || !bendPeng || !bendGaji || !bendBarang || !pelA) {
    console.warn("  ⚠️ User demo belum lengkap. Pastikan seedUsers sudah jalan.");
    return;
  }

  // Lazy import to avoid circular init if model not registered yet
  const { default: Spj } = await import("../../models/Spj.js");
  const { default: Dpa } = await import("../../models/Dpa.js");

  const year = new Date().getFullYear();

  // DPA minimal untuk cek pagu
  await Dpa.findOrCreate({
    where: { tahun_anggaran: year, kode_rekening: "5.2.2.11.01" },
    defaults: {
      kode_sub_kegiatan: "1.02.0.00.0.00.01.0001",
      nama_sub_kegiatan: "Operasional Sekretariat",
      uraian_belanja: "Belanja Perjalanan Dinas Dalam Daerah",
      jenis_belanja: "barang_jasa",
      pagu_anggaran: 10000000,
      realisasi: 2500000,
    },
  }).catch(() => {});

  const mkSpj = async ({
    nomor,
    jenis_bendahara,
    bendahara_pengirim_id,
    jenis_belanja,
    kode_rekening,
    nominal,
    status = "diajukan_ke_ppk",
  }) => {
    await Spj.create({
      nomor_spj: nomor,
      jenis_bendahara,
      bendahara_pengirim_id,
      jenis_belanja,
      sub_kegiatan_kode: "1.02.0.00.0.00.01.0001",
      kode_rekening,
      nominal,
      keterangan: "Seeder demo PPK queue",
      dibuat_oleh: pelA,
      tanggal_kegiatan: new Date(),
      lampiran_url: null,
      status,
      diverifikasi_bendahara_oleh: bendahara_pengirim_id,
      diverifikasi_bendahara_at: new Date(),
      catatan_bendahara: "Dokumen lengkap (demo)",
    }).catch(() => {});
  };

  await mkSpj({
    nomor: `SPJ-${year}-001`,
    jenis_bendahara: "pengeluaran",
    bendahara_pengirim_id: bendPeng,
    jenis_belanja: "perjalanan_dinas",
    kode_rekening: "5.2.2.11.01",
    nominal: 2100000,
  });

  // Prompt 7 demo untuk Bendahara Pengeluaran (antrean verifikasi + siap bayar + dikembalikan PPK)
  await mkSpj({
    nomor: `SPJ-${year}-010`,
    jenis_bendahara: "pengeluaran",
    bendahara_pengirim_id: bendPeng,
    jenis_belanja: "atk",
    kode_rekening: "5.2.2.11.01",
    nominal: 450000,
    status: "diajukan_ke_bendahara",
  });
  await mkSpj({
    nomor: `SPJ-${year}-011`,
    jenis_bendahara: "pengeluaran",
    bendahara_pengirim_id: bendPeng,
    jenis_belanja: "honorarium",
    kode_rekening: "5.2.2.11.01",
    nominal: 750000,
    status: "disetujui_sekretaris",
  });
  await mkSpj({
    nomor: `SPJ-${year}-012`,
    jenis_bendahara: "pengeluaran",
    bendahara_pengirim_id: bendPeng,
    jenis_belanja: "perjalanan_dinas",
    kode_rekening: "5.2.2.11.01",
    nominal: 1800000,
    status: "dikembalikan_ppk",
  });
  await mkSpj({
    nomor: `SPJ-${year}-002`,
    jenis_bendahara: "gaji",
    bendahara_pengirim_id: bendGaji,
    jenis_belanja: "honorarium",
    kode_rekening: "5.1.02.01.01",
    nominal: 4500000,
  });
  await mkSpj({
    nomor: `SPJ-${year}-003`,
    jenis_bendahara: "barang",
    bendahara_pengirim_id: bendBarang,
    jenis_belanja: "modal",
    kode_rekening: "5.2.3.02.01",
    nominal: 7500000,
  });

  console.log("  ✅ Demo SPJ + DPA seeded\n");
}

export async function seedBendaharaPengeluaranUpDemo() {
  try {
    const year = new Date().getFullYear();
    const [rows] = await sequelize.query(
      "SELECT id, username, email FROM users WHERE username = :u OR email = :e LIMIT 1",
      {
        replacements: {
          u: "bendahara_pengeluaran",
          e: "bendahara.pengeluaran@example.com",
        },
      },
    );
    const bend = rows?.[0];
    if (!bend?.id) return;

    // Ensure table exists (server runtime patch should also create it)
    const dialect = sequelize.getDialect();
    if (dialect === "postgres") {
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
    } else {
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
    }

    // Seed UP awal (idempotent enough for demo)
    await sequelize.query(
      `
        INSERT INTO uang_persediaan
          (tahun_anggaran, jenis, nominal_diajukan, nominal_disetujui, tanggal_pengajuan, tanggal_cair_bpkad, nominal_cair, status, diajukan_oleh, created_at, updated_at)
        VALUES
          (:tahun, 'up_awal', 50000000, 50000000, :tgl, :tgl, 50000000, 'cair', :uid, datetime('now'), datetime('now'))
      `,
      {
        replacements: {
          tahun: year,
          tgl: `${year}-01-05`,
          uid: bend.id,
        },
      },
    ).catch(async () => {
      // Postgres variant uses now()
      await sequelize.query(
        `
          INSERT INTO uang_persediaan
            (tahun_anggaran, jenis, nominal_diajukan, nominal_disetujui, tanggal_pengajuan, tanggal_cair_bpkad, nominal_cair, status, diajukan_oleh, created_at, updated_at)
          VALUES
            (:tahun, 'up_awal', 50000000, 50000000, :tgl, :tgl, 50000000, 'cair', :uid, now(), now())
          ON CONFLICT DO NOTHING
        `,
        { replacements: { tahun: year, tgl: `${year}-01-05`, uid: bend.id } },
      );
    });
  } catch {
    // ignore seeding failures for demo
  }
}

export async function seedBendaharaGajiDemo() {
  try {
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    const [rows] = await sequelize.query(
      "SELECT id, username, email FROM users WHERE username = :u OR email = :e LIMIT 1",
      {
        replacements: {
          u: "bendahara_gaji",
          e: "bendahara.gaji@example.com",
        },
      },
    );
    const bend = rows?.[0];
    if (!bend?.id) return;

    // Ensure table exists (server runtime patch should also create it)
    const dialect = sequelize.getDialect();
    if (dialect === "postgres") {
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
          status VARCHAR(64) NOT NULL DEFAULT 'draft',
          catatan_jf_keuangan TEXT,
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE (periode_bulan, periode_tahun, dibuat_oleh)
        );
      `);
    } else {
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
          status VARCHAR(64) NOT NULL DEFAULT 'draft',
          catatan_jf_keuangan TEXT,
          revisi_ke INTEGER NOT NULL DEFAULT 0,
          dibuat_oleh INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_daftar_gaji_unique ON daftar_gaji(periode_bulan, periode_tahun, dibuat_oleh);
      `);
    }

    const nomor = `DG-${tahun}-${String(bulan).padStart(2, "0")}`;
    await sequelize.query(
      `
        INSERT INTO daftar_gaji
          (periode_bulan, periode_tahun, nomor_daftar_gaji, jumlah_asn, total_gaji_kotor, total_potongan, total_gaji_bersih, status, revisi_ke, dibuat_oleh, created_at, updated_at)
        VALUES
          (:bulan, :tahun, :nomor, 50, 500000000, 14250000, 485750000, 'siap_dianalisa', 0, :uid, now(), now())
        ON CONFLICT DO NOTHING
      `,
      { replacements: { bulan, tahun, nomor, uid: bend.id } },
    ).catch(async () => {
      await sequelize.query(
        `
          INSERT OR IGNORE INTO daftar_gaji
            (periode_bulan, periode_tahun, nomor_daftar_gaji, jumlah_asn, total_gaji_kotor, total_potongan, total_gaji_bersih, status, revisi_ke, dibuat_oleh, created_at, updated_at)
          VALUES
            (:bulan, :tahun, :nomor, 50, 500000000, 14250000, 485750000, 'siap_dianalisa', 0, :uid, datetime('now'), datetime('now'))
        `,
        { replacements: { bulan, tahun, nomor, uid: bend.id } },
      );
    });

    // satu contoh dikembalikan oleh JF
    const nomor2 = `DG-${tahun}-${String(bulan).padStart(2, "0")}-REV`;
    await sequelize.query(
      `
        INSERT INTO daftar_gaji
          (periode_bulan, periode_tahun, nomor_daftar_gaji, jumlah_asn, total_gaji_kotor, total_potongan, total_gaji_bersih, status, catatan_jf_keuangan, revisi_ke, dibuat_oleh, created_at, updated_at)
        VALUES
          (:bulan, :tahun, :nomor, 50, 500000000, 14250000, 485750000, 'dikembalikan_jf_keuangan', 'Tunjangan jabatan masih tarif lama. Mohon perbaiki sesuai regulasi terbaru.', 1, :uid, now(), now())
        ON CONFLICT DO NOTHING
      `,
      { replacements: { bulan, tahun, nomor: nomor2, uid: bend.id } },
    ).catch(async () => {
      await sequelize.query(
        `
          INSERT OR IGNORE INTO daftar_gaji
            (periode_bulan, periode_tahun, nomor_daftar_gaji, jumlah_asn, total_gaji_kotor, total_potongan, total_gaji_bersih, status, catatan_jf_keuangan, revisi_ke, dibuat_oleh, created_at, updated_at)
          VALUES
            (:bulan, :tahun, :nomor, 50, 500000000, 14250000, 485750000, 'dikembalikan_jf_keuangan', 'Tunjangan jabatan masih tarif lama. Mohon perbaiki sesuai regulasi terbaru.', 1, :uid, datetime('now'), datetime('now'))
        `,
        { replacements: { bulan, tahun, nomor: nomor2, uid: bend.id } },
      );
    });
  } catch {
    // ignore
  }
}

export async function seedBendaharaBarangDemo() {
  try {
    const [rows] = await sequelize.query(
      "SELECT id, username, email, unit_kerja FROM users WHERE username = :u OR email = :e LIMIT 1",
      {
        replacements: {
          u: "bendahara_barang",
          e: "bendahara.barang@example.com",
        },
      },
    );
    const bend = rows?.[0];
    if (!bend?.id) return;

    const pelA = await getUserIdByEmail("pelaksana.a@example.com");
    const pelB = await getUserIdByEmail("pelaksana.b@example.com");
    const pelReporter = pelB || pelA || bend.id;

    const year = new Date().getFullYear();

    // Ensure tables exist (server runtime patch should also create them)
    const dialect = sequelize.getDialect();
    if (dialect === "postgres") {
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
    } else {
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
    }

    // Seed aset (kritis + normal)
    await sequelize.query(
      `
        INSERT INTO aset_barang
          (nomor_register, kode_barang, nama_barang, spesifikasi, jenis_aset, kategori_belanja, tahun_perolehan, nilai_perolehan, nilai_buku, unit_kerja, lokasi_fisik, kondisi, status, dibuat_oleh, created_at, updated_at)
        VALUES
          (:nr1, 'BMD-IT-001', 'Laptop 14\"', 'Core i5, RAM 16GB', 'peralatan_mesin', 'modal', :tahun, 8250000, 7000000, 'Sekretariat', 'Ruang IT', 'baik', 'aktif', :uid, now(), now())
      `,
      { replacements: { nr1: `BMD-${year}-001`, tahun: year, uid: bend.id } },
    ).catch(() => {});
    await sequelize.query(
      `
        INSERT INTO aset_barang
          (nomor_register, kode_barang, nama_barang, spesifikasi, jenis_aset, kategori_belanja, tahun_perolehan, nilai_perolehan, nilai_buku, unit_kerja, lokasi_fisik, kondisi, status, dibuat_oleh, created_at, updated_at)
        VALUES
          (:nr2, 'BMD-FUR-008', 'Kursi kerja', '8 unit rusak berat', 'inventaris_kantor', 'barang_jasa', :tahun, 8000000, 2000000, 'Bidang Distribusi', 'Ruang Bidang Distribusi', 'rusak_berat', 'aktif', :uid, now(), now())
      `,
      { replacements: { nr2: `BMD-${year}-002`, tahun: year, uid: bend.id } },
    ).catch(() => {});

    // Seed penerimaan barang pending
    await sequelize.query(
      `
        INSERT INTO penerimaan_barang
          (nomor_bast, nama_pengadaan, nama_rekanan, nilai_kontrak, nomor_kontrak, sub_kegiatan_kode, daftar_barang, tanggal_pengiriman, status, revisi_ke, dibuat_oleh, created_at, updated_at)
        VALUES
          (:bast, 'ATK Triwulan I', 'CV Sukses Jaya', 12750000, 'KONTRAK-ATK-01', '1.02.0.00.0.00.01.0001',
           :barang, :tgl, 'barang_tiba', 0, :uid, now(), now())
      `,
      {
        replacements: {
          bast: `BAST-${year}-001`,
          barang: JSON.stringify([{ nama: "ATK set", qty_kontrak: 1, qty_terima: 1, kondisi: "baik" }]),
          tgl: new Date().toISOString().slice(0, 10),
          uid: bend.id,
        },
      },
    ).catch(() => {});

    // Seed pemeliharaan 30 hari
    await sequelize.query(
      `
        INSERT INTO pemeliharaan_aset
          (aset_id, jenis_pemeliharaan, tanggal_jadwal, deskripsi, vendor_bengkel, biaya_estimasi, status, dibuat_oleh, created_at, updated_at)
        VALUES
          (1, 'rutin', :jadwal, 'Servis berkala mesin fotocopy', 'Vendor Lokal', 350000, 'dijadwalkan', :uid, now(), now())
      `,
      {
        replacements: {
          jadwal: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          uid: bend.id,
        },
      },
    ).catch(() => {});

    // Seed laporan kerusakan
    await sequelize.query(
      `
        INSERT INTO laporan_kerusakan_aset
          (aset_id, nama_aset, lokasi_aset, jenis_kerusakan, deskripsi, tingkat_urgensi, dilaporkan_oleh, unit_pelapor, status_tindak_lanjut, created_at, updated_at)
        VALUES
          (NULL, 'AC Ruang Arsip', 'Lt.1 Arsip', 'mekanis', 'AC tidak dingin, compressor diduga mati.', 'tinggi', :pel, 'Sekretariat', 'belum_ditindaklanjuti', now(), now())
      `,
      { replacements: { pel: pelReporter } },
    ).catch(() => {});
  } catch {
    // ignore
  }
}

export async function seedPelaksanaSekretariatDemo() {
  try {
    const pelA = await getUserIdByEmail("pelaksana.a@example.com");
    const pelB = await getUserIdByEmail("pelaksana.b@example.com");
    const kasubag = await getUserIdByEmail("kasubag@example.com");
    if (!pelA || !pelB || !kasubag) return;

    // Ensure tasks tables exist (Sequelize models already map to these)
    const { default: Task } = await import("../../models/Task.js");
    const { default: TaskAssignment } = await import("../../models/TaskAssignment.js");
    const { default: Spj } = await import("../../models/Spj.js");

    // Create 2 demo tasks assigned by Kasubag
    const t1 = await Task.create({
      title: "Input data ASN baru (3 orang)",
      description: "Input data ASN baru sesuai format template terbaru.",
      created_by: kasubag,
      module: "kepegawaian",
      source_unit: "Sekretariat",
      status: "assigned",
      priority: 2,
      due_date: new Date(Date.now() + 6 * 60 * 60 * 1000),
    }).catch(() => null);
    if (t1) {
      await TaskAssignment.create({
        task_id: t1.id,
        assignee_role: "pelaksana",
        assignee_user_id: pelA,
        assigned_by: kasubag,
        status: "assigned",
      }).catch(() => null);
    }

    const t2 = await Task.create({
      title: "Arsipkan surat masuk bulan berjalan",
      description: "Scan + arsipkan surat masuk bulan ini. Pastikan penamaan file sesuai SOP.",
      created_by: kasubag,
      module: "persuratan",
      source_unit: "Sekretariat",
      status: "assigned",
      priority: 3,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }).catch(() => null);
    if (t2) {
      await TaskAssignment.create({
        task_id: t2.id,
        assignee_role: "pelaksana",
        assignee_user_id: pelB,
        assigned_by: kasubag,
        status: "assigned",
      }).catch(() => null);
    }

    // Demo SPJ pelaksana
    const year = new Date().getFullYear();
    await Spj.create({
      nomor_spj: `SPJ-PEL-${year}-001`,
      jenis_belanja: "perjalanan_dinas",
      sub_kegiatan_kode: "SEKRETARIAT",
      kode_rekening: "5.2.2.11.01",
      nominal: 2100000,
      keterangan: "SPJ SPPD (demo) — diajukan ke bendahara",
      dibuat_oleh: pelA,
      tanggal_kegiatan: new Date(),
      status: "diajukan_ke_bendahara",
      revisi_ke: 0,
      jenis_bendahara: "pengeluaran",
    }).catch(() => null);

    await Spj.create({
      nomor_spj: `SPJ-PEL-${year}-002`,
      jenis_belanja: "atk",
      sub_kegiatan_kode: "SEKRETARIAT",
      kode_rekening: "5.2.2.11.01",
      nominal: 320000,
      keterangan: "SPJ ATK (demo) — dikembalikan PPK",
      dibuat_oleh: pelA,
      tanggal_kegiatan: new Date(),
      status: "dikembalikan_ppk",
      catatan_ppk: "Kwitansi tidak ada nama toko dan tanggal. Mohon lengkapi bukti.",
      revisi_ke: 1,
      jenis_bendahara: "pengeluaran",
    }).catch(() => null);
  } catch {
    // ignore
  }
}

