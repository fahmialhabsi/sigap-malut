# Execution Plan Artifacts

Folder ini dihasilkan otomatis oleh generator eksekusi.

## Files

- master-plan.md: ringkasan fase, baseline role, dan indeks weekly plan.
- tracker.json: data terstruktur untuk integrasi dashboard/pipeline.
- backlog-auto.md: hasil ekstraksi backlog KRITIS/TINGGI/SEDANG dari matrix.
- backlog-auto.json: versi JSON backlog semua severity hasil parsing matrix.
- matrix-reconciliation.md: validasi declared vs parsed count pada matrix.
- matrix-reconciliation.json: versi JSON hasil rekonsiliasi matrix.
- dokumenSistem-completeness.md: validasi kelengkapan dokumen wajib di folder dokumenSistem.
- dokumenSistem-completeness.json: versi JSON validasi kelengkapan dokumenSistem.
- weekly/week-XX.md: lembar kerja mingguan dari Week 01 sampai Week 16.

## Cara Pakai

1. Isi Monday Prioritization dengan 10-15 item prioritas backlog fase aktif.
2. Section Tuesday-Thursday terisi otomatis dari item Monday (Implement, Test, Review) dan bisa disesuaikan manual bila perlu.
3. Jalankan Friday 3-hour audit, lalu putuskan gate Pass/Conditional/Fail.
4. Rekap temuan severity dan tindak lanjut sebelum pindah minggu berikutnya.
5. Jika autofill aktif, item Monday diambil otomatis dari severity fase aktif (Phase 1=KRITIS, Phase 2=TINGGI, Phase 3=SEDANG) lalu diurutkan ketat menggunakan timeline mingguan.

## Lokasi Saat Ini

E:\sigap-malut\reports\execution-plan
