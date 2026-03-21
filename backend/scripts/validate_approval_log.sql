-- Validasi data orphan/null pada approval_log

-- 1. Cek reviewer_id orphan
SELECT al.id, al.reviewer_id FROM approval_log al
LEFT JOIN users u ON al.reviewer_id = u.id
WHERE u.id IS NULL;

-- 2. Cek layanan_id orphan
SELECT al.id, al.layanan_id FROM approval_log al
LEFT JOIN layanan l ON al.layanan_id = l.id_layanan
WHERE l.id_layanan IS NULL;

-- 3. Cek kolom NULL pada reviewer_id, layanan_id, action, timestamp
SELECT * FROM approval_log WHERE reviewer_id IS NULL OR layanan_id IS NULL OR action IS NULL OR timestamp IS NULL;
