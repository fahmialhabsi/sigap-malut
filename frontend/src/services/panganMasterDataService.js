import api from "./api";

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal memuat master data dari ${url}`);
  }

  return response.json();
}

export async function fetchKomoditasOptions() {
  const response = await api.get("/komoditas", {
    params: { page: 1, limit: 200 },
  });

  const rows = Array.isArray(response.data?.data) ? response.data.data : [];

  return rows.map((row) => ({
    id: row.id,
    nama: row.nama,
    satuan: row.satuan,
    kode: row.kode,
  }));
}

export async function fetchKabupatenMalut() {
  const rows = await fetchJson("/master-data/pangan/kabupaten-malut.json");
  return Array.isArray(rows) ? rows : [];
}

export async function fetchPasarStrategisMalut() {
  const rows = await fetchJson("/master-data/pangan/pasar-strategis-malut.json");
  return Array.isArray(rows) ? rows : [];
}
