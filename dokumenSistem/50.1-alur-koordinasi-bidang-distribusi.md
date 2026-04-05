# Alur koordinasi — Bidang Distribusi & sekretariat / bidang lain

Ringkasan untuk melengkapi Prompt 14–16: titik temu alur data dan dokumen.

## Alur data harga & inflasi

1. **Pelaksana** mengirim `POST /api/pelaksana/harga-pasar` → baris tersimpan di tabel **`harga_pangan`** (status `menunggu_verifikasi`) untuk **JF Distribusi**.
2. **JF** memverifikasi lewat `GET/POST /api/jf-distribusi/verifikasi/*` → setelah stabil, siap dikaitkan ke kalkulator inflasi (layanan `inflasiKalkulatorService` saat tabel M043 aktif).
3. **Kepala Bidang** memantau `GET /api/kabid-distribusi/inflasi/current`, alert, CPPD, dan antrean persetujuan JF.

## Alur dokumen formal

- Tetap mengikuti rantai: Pelaksana → JF → Kepala Bidang → **Sekretaris** → Kepala Dinas (tanpa bypass Sekretaris untuk laporan resmi).
- Usul pelepasan CPPD dan operasi pasar: disiapkan di bidang distribusi, diserahkan ke Sekretaris/Kepala Dinas sesuai SOP setempat.

## Integrasi lintas bidang

- **Ketersediaan**: data produksi/stok melengkapi narasi inflasi; koordinasi teknis via TPID / rapat gabungan.
- **Konsumsi**: pola serupa dengan modul konsumsi (Prompt 19) nanti; gunakan `unit_kerja` yang konsisten di JWT/profil user.
- **UPTD / Balai**: input teknis tetap melalui peran pelaksana/JF yang ditugaskan, bukan bypass Kabid.

File teknis terkait: `backend/models/HargaPangan.js`, `backend/models/InflasiHarian.js`, `backend/services/hargaPanganRepository.js`, `backend/services/inflasiLaspeyresService.js`, `backend/jobs/inflasiHarianCron.js`, `backend/routes/kabid-distribusi.js`, `jf-distribusi.js`, `pelaksana-bidang.js`.
