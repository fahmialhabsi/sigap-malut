import sequelize from "../../config/database.js";

// Master Komoditas Strategis
const komoditas = [
  {
    id: 1,
    nama: "Beras",
    kategori: "Padi-padian",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 2,
    nama: "Jagung",
    kategori: "Padi-padian",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 3,
    nama: "Kedelai",
    kategori: "Kacang-kacangan",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 4,
    nama: "Gula Pasir",
    kategori: "Gula",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 5,
    nama: "Minyak Goreng",
    kategori: "Minyak",
    satuan: "Liter",
    is_strategis: true,
  },
  {
    id: 6,
    nama: "Daging Sapi",
    kategori: "Protein Hewani",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 7,
    nama: "Daging Ayam",
    kategori: "Protein Hewani",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 8,
    nama: "Telur Ayam",
    kategori: "Protein Hewani",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 9,
    nama: "Cabai Merah",
    kategori: "Sayuran",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 10,
    nama: "Bawang Merah",
    kategori: "Sayuran",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 11,
    nama: "Ikan Segar",
    kategori: "Protein Hewani",
    satuan: "Kg",
    is_strategis: false,
  },
  {
    id: 12,
    nama: "Tepung Terigu",
    kategori: "Tepung",
    satuan: "Kg",
    is_strategis: false,
  },
  {
    id: 13,
    nama: "Susu",
    kategori: "Produk Susu",
    satuan: "Liter",
    is_strategis: false,
  },
  {
    id: 14,
    nama: "Garam",
    kategori: "Bumbu",
    satuan: "Kg",
    is_strategis: false,
  },
];

// Kabupaten/Kota di Maluku Utara
const kabupaten = [
  { id: 1, nama: "Halmahera Barat", kode: "8201", ibu_kota: "Jailolo" },
  { id: 2, nama: "Halmahera Tengah", kode: "8202", ibu_kota: "Weda" },
  { id: 3, nama: "Kepulauan Sula", kode: "8203", ibu_kota: "Sanana" },
  { id: 4, nama: "Halmahera Selatan", kode: "8204", ibu_kota: "Labuha" },
  { id: 5, nama: "Halmahera Utara", kode: "8205", ibu_kota: "Tobelo" },
  { id: 6, nama: "Halmahera Timur", kode: "8206", ibu_kota: "Maba" },
  { id: 7, nama: "Pulau Morotai", kode: "8207", ibu_kota: "Daruba" },
  { id: 8, nama: "Pulau Taliabu", kode: "8208", ibu_kota: "Bobong" },
  { id: 9, nama: "Kota Ternate", kode: "8271", ibu_kota: "Ternate" },
  { id: 10, nama: "Kota Tidore Kepulauan", kode: "8272", ibu_kota: "Soasio" },
];

export async function seedMasterData() {
  console.log("🌱 Seeding master data...\n");

  try {
    // Seed Komoditas
    console.log("📦 Seeding komoditas...");
    for (const item of komoditas) {
      await sequelize.query(
        `INSERT OR IGNORE INTO master_komoditas (id, nama, kategori, satuan, is_strategis, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        {
          replacements: [
            item.id,
            item.nama,
            item.kategori,
            item.satuan,
            item.is_strategis ? 1 : 0,
          ],
        },
      );
    }
    console.log(`  ✅ ${komoditas.length} komoditas seeded\n`);

    // Seed Kabupaten
    console.log("🏙️  Seeding kabupaten...");
    for (const kab of kabupaten) {
      await sequelize.query(
        `INSERT OR IGNORE INTO master_kabupaten (id, nama, kode, ibu_kota, created_at, updated_at) 
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
        { replacements: [kab.id, kab.nama, kab.kode, kab.ibu_kota] },
      );
    }
    console.log(`  ✅ ${kabupaten.length} kabupaten seeded\n`);

    console.log("✅ Master data seeding complete!\n");
  } catch (error) {
    console.error("❌ Master data seeding error:", error);
    throw error;
  }
}
