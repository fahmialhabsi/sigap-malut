# 09-KPI-Definition-Sheet

| Nama Indikator            | Sumber Data  | Formula                                     | Role Akses         |
| ------------------------- | ------------ | ------------------------------------------- | ------------------ |
| Keterlambatan KGB         | layanan_kgb  | (jumlah keterlambatan / total KGB) x 100%   | Sekretaris, Kepala |
| SLA Compliance            | approval_log | (jumlah selesai tepat waktu / total) x 100% | Semua              |
| Jumlah Permohonan Layanan | layanan      | count(id_layanan)                           | Semua              |
| Waktu Penyelesaian Rata2  | approval_log | avg(timestamp_selesai - timestamp_ajuan)    | Sekretaris         |
