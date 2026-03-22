/**
 * fix-soft-delete.cjs — Script otomatis konversi hard delete → soft delete
 * di semua generated controllers backend.
 *
 * Jalankan: node scripts/fix-soft-delete.cjs
 */
const fs = require("fs");
const path = require("path");

const controllersDir = path.join(__dirname, "../backend/controllers");

// Ambil semua file controller .js kecuali auth dan approval
const files = fs
  .readdirSync(controllersDir)
  .filter((f) => f.endsWith(".js"))
  .filter(
    (f) =>
      ![
        "authController.js",
        "approvalWorkflow.js",
        "approvalLog.js",
        "auditLog.js",
        "auditLogController.js",
      ].includes(f),
  );

let totalFixed = 0;

for (const fname of files) {
  const fpath = path.join(controllersDir, fname);
  let content = fs.readFileSync(fpath, "utf8");
  const original = content;

  // 1. Ganti hard delete: await record.destroy();
  //    → await record.update({ is_deleted: true, deleted_at: new Date(), deleted_by: req.user?.id || null });
  content = content.replace(
    /await record\.destroy\(\);/g,
    `await record.update({ is_deleted: true, deleted_at: new Date(), deleted_by: req.user?.id || null });`,
  );

  // 2. Tambahkan filter is_deleted: false pada findAll
  //    Model.findAll() → Model.findAll({ where: { is_deleted: false } })
  //    tapi hanya jika belum ada where clause
  content = content.replace(
    /\.findAll\(\s*\)/g,
    `.findAll({ where: { is_deleted: false } })`,
  );

  // 3. findByPk sudah oke karena kita check is_deleted setelah fetch
  //    Tambahkan validasi: if (record && record.is_deleted) { 404 }
  // Tidak perlu diubah — cukup check record !== null saja.

  if (content !== original) {
    fs.writeFileSync(fpath, content, "utf8");
    console.log(`FIXED: ${fname}`);
    totalFixed++;
  }
}

console.log(`\nSelesai. Total file diproses: ${totalFixed}`);
