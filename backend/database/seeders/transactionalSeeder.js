import sequelize from "../../config/database.js";

export async function seedTransactionalData() {
  console.log("🌱 Seeding transactional data...\n");

  try {
    // Seed Surat Masuk/Keluar (SEK-ADM)
    console.log("📨 Seeding surat administrasi...");

    const suratData = [
      {
        unit_kerja: "Sekretariat",
        layanan_id: "LY001",
        nomor_surat: "001/SEK/I/2026",
        jenis_naskah: "Surat Masuk",
        tanggal_surat: "2026-01-05",
        pengirim_penerima: "Gubernur Maluku Utara",
        perihal: "Rapat Koordinasi Ketahanan Pangan Daerah",
        penanggung_jawab: "Kasubbag Umum",
        pelaksana: "Staff Administrasi",
        status: "selesai",
        created_by: 8,
      },
      {
        unit_kerja: "Sekretariat",
        layanan_id: "LY001",
        nomor_surat: "002/SEK/I/2026",
        jenis_naskah: "Surat Keluar",
        tanggal_surat: "2026-01-10",
        pengirim_penerima: "Bupati Halmahera Barat",
        perihal: "Undangan Sosialisasi SPPG 2026",
        penanggung_jawab: "Kasubbag Umum",
        pelaksana: "Staff Administrasi",
        status: "proses",
        created_by: 8,
      },
      {
        unit_kerja: "Sekretariat",
        layanan_id: "LY001",
        nomor_surat: "003/SEK/I/2026",
        jenis_naskah: "SK",
        tanggal_surat: "2026-01-12",
        pengirim_penerima: "Internal",
        perihal: "SK Tim Pengumpul Data Harga Pangan",
        penanggung_jawab: "Kasubbag Umum",
        pelaksana: "Staff Administrasi",
        status: "selesai",
        created_by: 8,
      },
      {
        unit_kerja: "Sekretariat",
        layanan_id: "LY001",
        nomor_surat: "004/SEK/I/2026",
        jenis_naskah: "Surat Masuk",
        tanggal_surat: "2026-01-15",
        pengirim_penerima: "Badan Pangan Nasional",
        perihal: "Permintaan Data Stok Pangan Strategis",
        penanggung_jawab: "Kasubbag Perencanaan",
        pelaksana: "Staff Perencanaan",
        status: "proses",
        created_by: 9,
      },
      {
        unit_kerja: "Bidang Distribusi",
        layanan_id: "LY006",
        nomor_surat: "005/BDS/I/2026",
        jenis_naskah: "Laporan",
        tanggal_surat: "2026-01-20",
        pengirim_penerima: "Sekretaris",
        perihal: "Laporan Harga Pangan Minggu ke-3 Januari 2026",
        penanggung_jawab: "Kepala Bidang Distribusi",
        pelaksana: "Pengumpul Data Harga",
        status: "selesai",
        created_by: 14,
      },
    ];

    for (const surat of suratData) {
      try {
        await sequelize.query(
          `INSERT INTO sek_adm (
            unit_kerja, layanan_id, nomor_surat, jenis_naskah, tanggal_surat,
            pengirim_penerima, perihal, penanggung_jawab, pelaksana, status, created_by,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          {
            replacements: [
              surat.unit_kerja,
              surat.layanan_id,
              surat.nomor_surat,
              surat.jenis_naskah,
              surat.tanggal_surat,
              surat.pengirim_penerima,
              surat.perihal,
              surat.penanggung_jawab,
              surat.pelaksana,
              surat.status,
              surat.created_by,
            ],
          },
        );
      } catch (err) {
        console.error(
          `  ❌ Error inserting surat ${surat.nomor_surat}:`,
          err.message,
        );
      }
    }

    console.log(`  ✅ ${suratData.length} surat administrasi seeded\n`);

    // Seed Harga Pangan (BDS-HRG) - FIXED COLUMN NAMES
    console.log("💰 Seeding data harga pangan...");

    const hargaData = [
      {
        unit_kerja: "Bidang Distribusi",
        layanan_id: "LY087",
        jenis_layanan_harga: "Pemantauan Harga",
        periode: "2026-01-05",
        tahun: 2026,
        bulan: 1,
        komoditas_id: 1,
        nama_komoditas: "Beras",
        nama_pasar: "Pasar Gamalama Ternate",
        tanggal_pantau: "2026-01-05",
        harga: 12500,
        satuan: "kg",
        tren_harga: "Stabil",
        penanggung_jawab: "Kepala Bidang Distribusi",
        pelaksana: "Pengumpul Data Harga",
        status: "final",
        created_by: 14,
      },
      {
        unit_kerja: "Bidang Distribusi",
        layanan_id: "LY087",
        jenis_layanan_harga: "Pemantauan Harga",
        periode: "2026-01-05",
        tahun: 2026,
        bulan: 1,
        komoditas_id: 5,
        nama_komoditas: "Minyak Goreng",
        nama_pasar: "Pasar Gamalama Ternate",
        tanggal_pantau: "2026-01-05",
        harga: 18000,
        satuan: "liter",
        tren_harga: "Naik",
        penanggung_jawab: "Kepala Bidang Distribusi",
        pelaksana: "Pengumpul Data Harga",
        status: "final",
        created_by: 14,
      },
      {
        unit_kerja: "Bidang Distribusi",
        layanan_id: "LY087",
        jenis_layanan_harga: "Pemantauan Harga",
        periode: "2026-01-05",
        tahun: 2026,
        bulan: 1,
        komoditas_id: 9,
        nama_komoditas: "Cabai Merah",
        nama_pasar: "Pasar Gamalama Ternate",
        tanggal_pantau: "2026-01-05",
        harga: 45000,
        satuan: "kg",
        tren_harga: "Turun",
        penanggung_jawab: "Kepala Bidang Distribusi",
        pelaksana: "Pengumpul Data Harga",
        status: "final",
        created_by: 14,
      },
      {
        unit_kerja: "Bidang Distribusi",
        layanan_id: "LY087",
        jenis_layanan_harga: "Pemantauan Harga",
        periode: "2026-01-12",
        tahun: 2026,
        bulan: 1,
        komoditas_id: 1,
        nama_komoditas: "Beras",
        nama_pasar: "Pasar Gamalama Ternate",
        tanggal_pantau: "2026-01-12",
        harga: 12600,
        satuan: "kg",
        tren_harga: "Naik",
        penanggung_jawab: "Kepala Bidang Distribusi",
        pelaksana: "Pengumpul Data Harga",
        status: "final",
        created_by: 14,
      },
      {
        unit_kerja: "Bidang Distribusi",
        layanan_id: "LY087",
        jenis_layanan_harga: "Pemantauan Harga",
        periode: "2026-01-12",
        tahun: 2026,
        bulan: 1,
        komoditas_id: 10,
        nama_komoditas: "Bawang Merah",
        nama_pasar: "Pasar Tobelo",
        tanggal_pantau: "2026-01-12",
        harga: 35000,
        satuan: "kg",
        tren_harga: "Stabil",
        penanggung_jawab: "Kepala Bidang Distribusi",
        pelaksana: "Pengumpul Data Harga",
        status: "final",
        created_by: 14,
      },
    ];

    for (const harga of hargaData) {
      try {
        await sequelize.query(
          `INSERT INTO bds_hrg (
            unit_kerja, layanan_id, jenis_layanan_harga, periode, tahun, bulan,
            komoditas_id, nama_komoditas, nama_pasar, tanggal_pantau,
            harga, satuan, tren_harga, penanggung_jawab, pelaksana, status, created_by,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          {
            replacements: [
              harga.unit_kerja,
              harga.layanan_id,
              harga.jenis_layanan_harga,
              harga.periode,
              harga.tahun,
              harga.bulan,
              harga.komoditas_id,
              harga.nama_komoditas,
              harga.nama_pasar,
              harga.tanggal_pantau,
              harga.harga,
              harga.satuan,
              harga.tren_harga,
              harga.penanggung_jawab,
              harga.pelaksana,
              harga.status,
              harga.created_by,
            ],
          },
        );
      } catch (err) {
        console.error(
          `  ❌ Error inserting harga ${harga.nama_komoditas}:`,
          err.message,
        );
      }
    }

    console.log(`  ✅ ${hargaData.length} data harga pangan seeded\n`);

    console.log("✅ Transactional data seeding complete!\n");
  } catch (error) {
    console.error("❌ Transactional seeding error:", error);
    throw error;
  }
}
