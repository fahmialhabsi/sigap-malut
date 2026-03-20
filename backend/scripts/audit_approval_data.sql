-- Audit orphan dan integritas data approval lama
-- 1. Cek data orphan pada kolom submitted_by di approval_workflow (user tidak ada)
SELECT aw.id, aw.submitted_by
FROM approval_workflow aw
LEFT JOIN users u ON aw.submitted_by = u.id
WHERE u.id IS NULL;

-- 2. Cek data orphan pada kolom approver_id di approval_log (user tidak ada)
SELECT al.id, al.approver_id
FROM approval_log al
LEFT JOIN users u ON al.approver_id = u.id
WHERE u.id IS NULL;

-- 3. Cek data orphan pada kolom workflow_id di approval_log (workflow tidak ada)
SELECT al.id, al.workflow_id
FROM approval_log al
LEFT JOIN approval_workflow aw ON al.workflow_id = aw.id
WHERE aw.id IS NULL;

-- 4. Cek data NULL pada kolom yang akan di-FK-kan
SELECT * FROM approval_workflow WHERE submitted_by IS NULL;
SELECT * FROM approval_log WHERE approver_id IS NULL OR workflow_id IS NULL;

-- 5. Cek duplikasi id (jika perlu)
SELECT id, COUNT(*) FROM approval_workflow GROUP BY id HAVING COUNT(*) > 1;
SELECT id, COUNT(*) FROM approval_log GROUP BY id HAVING COUNT(*) > 1;
