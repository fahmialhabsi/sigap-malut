# 08-ERD-Logical-Model

- layanan (PK: id_layanan)
- user (PK: id_user, FK: bidang, FK: role)
- approval_log (PK: id, FK: layanan_id, FK: reviewer_id)
- bidang (PK: id_bidang)
- role (PK: id_role)

Relasi:

- layanan.bidang_penanggung_jawab → bidang.id_bidang
- user.role → role.id_role
- approval_log.layanan_id → layanan.id_layanan
- approval_log.reviewer_id → user.id_user
