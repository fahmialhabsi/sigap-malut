// backend/services/ePelaraService.js
// Q2: Proxy client untuk REST API e-Pelara.
// Database tetap beda (PostgreSQL SIGAP, MySQL e-Pelara) — integrasi via API saja.

import axios from "axios";

const BASE_URL = process.env.EPELARA_API_URL || "http://localhost:3000";

/**
 * Buat axios instance dengan JWT SIGAP diteruskan ke e-Pelara.
 * e-Pelara verifyToken.js akan menerima token ini dan menerjemahkan role otomatis (P24).
 */
function createClient(sigapToken) {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
      Authorization: `Bearer ${sigapToken}`,
      "Content-Type": "application/json",
    },
  });
}

// ─── Q3: 21 endpoint e-Pelara yang dikonsumsi SIGAP ───────────────────────────

export async function getVisiMisi(token, params = {}) {
  const { data } = await createClient(token).get("/api/visi-misi", { params });
  return data;
}

export async function getPrioritasGubernur(token, params = {}) {
  const { data } = await createClient(token).get("/api/prioritas-gubernur", {
    params,
  });
  return data;
}

export async function getPrioritasNasional(token, params = {}) {
  const { data } = await createClient(token).get("/api/prioritas-nasional", {
    params,
  });
  return data;
}

export async function getPrioritas(token, params = {}) {
  const { data } = await createClient(token).get("/api/prioritas", { params });
  return data;
}

export async function getProgram(token, params = {}) {
  const { data } = await createClient(token).get("/api/program", { params });
  return data;
}

export async function getKegiatan(token, params = {}) {
  const { data } = await createClient(token).get("/api/kegiatan", { params });
  return data;
}

export async function getSubKegiatan(token, params = {}) {
  const { data } = await createClient(token).get("/api/sub-kegiatan", {
    params,
  });
  return data;
}

export async function getRenstraOpd(token, params = {}) {
  const { data } = await createClient(token).get("/api/renstra-opd", {
    params,
  });
  return data;
}

export async function getRenstraTujuan(token, params = {}) {
  const { data } = await createClient(token).get("/api/renstra-tujuan", {
    params,
  });
  return data;
}

export async function getRenstraSasaran(token, params = {}) {
  const { data } = await createClient(token).get("/api/renstra-sasaran", {
    params,
  });
  return data;
}

export async function getRenstraProgram(token, params = {}) {
  const { data } = await createClient(token).get("/api/renstra-program", {
    params,
  });
  return data;
}

export async function getRenstraKegiatan(token, params = {}) {
  const { data } = await createClient(token).get("/api/renstra-kegiatan", {
    params,
  });
  return data;
}

export async function getRenstraSubKegiatan(token, params = {}) {
  const { data } = await createClient(token).get("/api/renstra-sub-kegiatan", {
    params,
  });
  return data;
}

export async function getTargetRenstra(token, params = {}) {
  const { data } = await createClient(token).get("/api/target-renstra", {
    params,
  });
  return data;
}

export async function getRenja(token, params = {}) {
  const { data } = await createClient(token).get("/api/renja", { params });
  return data;
}

export async function getRka(token, params = {}) {
  const { data } = await createClient(token).get("/api/rka", { params });
  return data;
}

export async function getDpa(token, params = {}) {
  const { data } = await createClient(token).get("/api/dpa", { params });
  return data;
}

export async function getRealisasiIndikator(token, params = {}) {
  const { data } = await createClient(token).get("/api/realisasi-indikator", {
    params,
  });
  return data;
}

export async function getMonev(token, params = {}) {
  const { data } = await createClient(token).get("/api/monev", { params });
  return data;
}

export async function getLakip(token, params = {}) {
  const { data } = await createClient(token).get("/api/lakip", { params });
  return data;
}

/** Cascading verification: tujuan → sasaran → program → renstra status (Sekretaris) */
export async function getCascading(token, params = {}) {
  const [tujuan, sasaran, renstraOpd] = await Promise.allSettled([
    createClient(token).get("/api/renstra-tujuan", { params }),
    createClient(token).get("/api/renstra-sasaran", { params }),
    createClient(token).get("/api/renstra-opd", { params }),
  ]);
  return {
    tujuan: tujuan.status === "fulfilled" ? tujuan.value.data : null,
    sasaran: sasaran.status === "fulfilled" ? sasaran.value.data : null,
    renstraOpd:
      renstraOpd.status === "fulfilled" ? renstraOpd.value.data : null,
  };
}

/** Approve/Tolak dokumen Renstra-OPD oleh Kepala Dinas (inline action di dashboard) */
export async function approveRenstra(token, id, body = {}) {
  const { data } = await createClient(token).patch(
    `/api/renstra-opd/${id}/approve`,
    body,
  );
  return data;
}

/** Rangkum semua data perencanaan dalam satu call (dipakai dashboard SIGAP) */
export async function getRingkasanPerencanaan(token, params = {}) {
  const [visiMisi, prioritas, renstraOpd, monev] = await Promise.allSettled([
    getVisiMisi(token, params),
    getPrioritas(token, params),
    getRenstraOpd(token, params),
    getMonev(token, params),
  ]);

  return {
    visiMisi: visiMisi.status === "fulfilled" ? visiMisi.value : null,
    prioritas: prioritas.status === "fulfilled" ? prioritas.value : null,
    renstraOpd: renstraOpd.status === "fulfilled" ? renstraOpd.value : null,
    monev: monev.status === "fulfilled" ? monev.value : null,
  };
}
