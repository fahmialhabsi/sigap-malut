// util to insert into public.audit_log (raw query)
// usage: await auditLogger(sequelize, { modul, entitas_id, aksi, data_lama, data_baru, pegawai_id });
module.exports = async function auditLogger(
  sequelize,
  { modul, entitas_id, aksi, data_lama, data_baru, pegawai_id },
) {
  try {
    const sql = `
      INSERT INTO public.audit_log (modul, entitas_id, aksi, data_lama, data_baru, pegawai_id, created_at)
      VALUES (:modul, :entitas_id, :aksi, :data_lama::json, :data_baru::json, :pegawai_id, CURRENT_TIMESTAMP)
    `;
    await sequelize.query(sql, {
      replacements: {
        modul: modul || null,
        entitas_id: entitas_id ? String(entitas_id) : null,
        aksi: aksi || null,
        data_lama: data_lama ? JSON.stringify(data_lama) : null,
        data_baru: data_baru ? JSON.stringify(data_baru) : null,
        pegawai_id: pegawai_id ? String(pegawai_id) : null,
      },
    });
  } catch (err) {
    // non-blocking: log error but don't throw
    console.error("auditLogger error:", err);
  }
};
