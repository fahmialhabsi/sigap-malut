// backend/controllers/ePelaraController.js
// Q2/Q3: Proxy handler — SIGAP backend meneruskan request ke e-Pelara API.
// Menggunakan JWT SIGAP yang sudah ada di req.user (dari middleware auth SIGAP).

import * as ePelara from "../services/ePelaraService.js";

/** Helper: ambil token raw dari request (header atau cookie) */
function getRawToken(req) {
  return (
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.replace("Bearer ", "")
      : null)
  );
}

/** Helper: forward query params relevan (tahun, periode_id, opd, dst) */
function perencanaamParams(req) {
  const { tahun, periode_id, opd, limit, page } = req.query;
  return Object.fromEntries(
    Object.entries({ tahun, periode_id, opd, limit, page }).filter(
      ([, v]) => v !== undefined,
    ),
  );
}

// ─── Handler per endpoint ──────────────────────────────────────────────────────

export const getVisiMisi = async (req, res) =>
  proxy(req, res, ePelara.getVisiMisi);
export const getPrioritasGubernur = async (req, res) =>
  proxy(req, res, ePelara.getPrioritasGubernur);
export const getPrioritasNasional = async (req, res) =>
  proxy(req, res, ePelara.getPrioritasNasional);
export const getPrioritas = async (req, res) =>
  proxy(req, res, ePelara.getPrioritas);
export const getProgram = async (req, res) =>
  proxy(req, res, ePelara.getProgram);
export const getKegiatan = async (req, res) =>
  proxy(req, res, ePelara.getKegiatan);
export const getSubKegiatan = async (req, res) =>
  proxy(req, res, ePelara.getSubKegiatan);
export const getRenstraOpd = async (req, res) =>
  proxy(req, res, ePelara.getRenstraOpd);
export const getRenstraTujuan = async (req, res) =>
  proxy(req, res, ePelara.getRenstraTujuan);
export const getRenstraSasaran = async (req, res) =>
  proxy(req, res, ePelara.getRenstraSasaran);
export const getRenstraProgram = async (req, res) =>
  proxy(req, res, ePelara.getRenstraProgram);
export const getRenstraKegiatan = async (req, res) =>
  proxy(req, res, ePelara.getRenstraKegiatan);
export const getRenstraSubKegiatan = async (req, res) =>
  proxy(req, res, ePelara.getRenstraSubKegiatan);
export const getTargetRenstra = async (req, res) =>
  proxy(req, res, ePelara.getTargetRenstra);
export const getRenja = async (req, res) => proxy(req, res, ePelara.getRenja);
export const getRka = async (req, res) => proxy(req, res, ePelara.getRka);
export const getDpa = async (req, res) => proxy(req, res, ePelara.getDpa);
export const getRealisasiIndikator = async (req, res) =>
  proxy(req, res, ePelara.getRealisasiIndikator);
export const getMonev = async (req, res) => proxy(req, res, ePelara.getMonev);
export const getLakip = async (req, res) => proxy(req, res, ePelara.getLakip);
export const getCascading = async (req, res) =>
  proxy(req, res, ePelara.getCascading);

export const approveRenstra = async (req, res) => {
  const token = getRawToken(req);
  if (!token)
    return res.status(401).json({ message: "Token tidak ditemukan." });
  // Validasi sederhana: id harus berupa angka/uuid untuk cegah path traversal
  const id = req.params.id;
  if (!id || !/^[\w-]+$/.test(id))
    return res.status(400).json({ message: "ID tidak valid." });
  const allowedStatus = ["disetujui", "ditolak", "direvisi"];
  const { status, catatan } = req.body;
  if (!allowedStatus.includes(status))
    return res.status(400).json({ message: "Status tidak valid." });
  try {
    const result = await ePelara.approveRenstra(token, id, { status, catatan });
    return res.json({ success: true, data: result });
  } catch (err) {
    return handleProxyError(res, err);
  }
};

export const getRingkasanPerencanaan = async (req, res) => {
  const token = getRawToken(req);
  if (!token)
    return res.status(401).json({ message: "Token tidak ditemukan." });
  try {
    const result = await ePelara.getRingkasanPerencanaan(
      token,
      perencanaamParams(req),
    );
    return res.json({ success: true, data: result });
  } catch (err) {
    return handleProxyError(res, err);
  }
};

// ─── Internal proxy helper ─────────────────────────────────────────────────────

async function proxy(req, res, serviceFn) {
  const token = getRawToken(req);
  if (!token)
    return res.status(401).json({ message: "Token tidak ditemukan." });
  try {
    const result = await serviceFn(token, perencanaamParams(req));
    return res.json({ success: true, data: result });
  } catch (err) {
    return handleProxyError(res, err);
  }
}

function handleProxyError(res, err) {
  // Teruskan status code dari e-Pelara jika ada, fallback ke 502
  const status = err.response?.status || 502;
  const message =
    err.response?.data?.message || "Gagal mengambil data dari e-Pelara.";
  console.error("[ePelaraController]", err.message);
  return res.status(status).json({ success: false, message });
}
