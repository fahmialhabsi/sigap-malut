// Pelaksana: data lapangan umum + harga pasar (Bidang Distribusi) — persist ke harga_pangan
import {
  findByUserAndDate,
  coverageForUser,
  yesterdayBarisForUser,
} from "../services/hargaPanganRepository.js";
import { submitHargaPanganBatch } from "../services/hargaPanganService.js";

const dataPanganRiwayat = [];
let idSeq = 1;

export async function postDataPangan(req, res) {
  try {
    const row = {
      id: idSeq++,
      ...req.body,
      diinput_oleh: req.user?.id,
      created_at: new Date().toISOString(),
    };
    dataPanganRiwayat.unshift(row);
    res.status(201).json({ data: row });
  } catch (e) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getDataPanganRiwayat(req, res) {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const uid = req.user?.id;
  const mine = dataPanganRiwayat.filter((r) => r.diinput_oleh === uid);
  res.json({ data: mine.slice(0, limit) });
}

export async function postHargaPasar(req, res) {
  try {
    const {
      tanggal,
      pasar_id,
      pasar_nama,
      kabupaten_kota,
      sumber_data,
      baris,
      status = "submitted_to_jf",
    } = req.body;

    if (!tanggal || !baris || !Array.isArray(baris)) {
      return res.status(400).json({ error: "tanggal_dan_baris_wajib" });
    }

    const actor = { id: req.user?.id, role: req.user?.role };
    const result = await submitHargaPanganBatch(
      {
        tanggal,
        pasar_id,
        pasar_nama,
        kabupaten_kota,
        sumber_data,
        baris,
        status,
        diinput_oleh: req.user?.id,
      },
      actor,
    );

    if (!result.ok) {
      if (result.hardErrors?.length) {
        return res.status(400).json({ error: "validasi_gagal", details: result.hardErrors });
      }
      return res.status(400).json({ error: result.error || "bad_request" });
    }

    res.status(201).json({
      data: {
        id: result.batch_id,
        batch_id: result.batch_id,
        tanggal,
        pasar_id,
        pasar_nama,
        jumlah_baris: result.rows.length,
        status,
        anomaly_count: result.anomaly_count,
        requires_manual_verify: result.anomaly_count > 0,
      },
    });
  } catch (e) {
    console.error("[pelaksanaBidang] postHargaPasar:", e);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getHargaPasarHariIni(req, res) {
  const uid = req.user?.id;
  const today = new Date().toISOString().split("T")[0];
  const rows = await findByUserAndDate(uid, today);
  res.json({ data: rows, tanggal: today });
}

export async function getHargaPasarCoverage(req, res) {
  const uid = req.user?.id;
  const today = new Date().toISOString().split("T")[0];
  const assignedTotal = Number(req.query.total_pasar) || 3;
  const data = await coverageForUser(uid, today, assignedTotal);
  res.json({ data });
}

export async function getHargaPasarKemarin(req, res) {
  const uid = req.user?.id;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.toISOString().split("T")[0];
  const baris = await yesterdayBarisForUser(uid, y);
  res.json({ data: baris });
}
