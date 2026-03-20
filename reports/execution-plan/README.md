# Execution Plan Artifacts

Folder ini dihasilkan otomatis oleh generator eksekusi.

## Files

- master-plan.md: ringkasan fase, baseline role, dan indeks weekly plan.
- tracker.json: data terstruktur untuk integrasi dashboard/pipeline.
- backlog-auto.md: hasil ekstraksi backlog KRITIS/TINGGI dari matrix.
- backlog-auto.json: versi JSON backlog KRITIS/TINGGI hasil parsing matrix.
- weekly/week-XX.md: lembar kerja mingguan dari Week 01 sampai Week 16.

## Cara Pakai

1. Isi Monday Prioritization dengan 10-15 item prioritas backlog fase aktif.
2. Gunakan section Tuesday-Thursday untuk tracking implementasi dan test evidence.
3. Jalankan Friday 3-hour audit, lalu putuskan gate Pass/Conditional/Fail.
4. Rekap temuan severity dan tindak lanjut sebelum pindah minggu berikutnya.
5. Jika autofill aktif, item Monday diambil otomatis dari backlog KRITIS/TINGGI matrix.

## Lokasi Saat Ini

E:\sigap-malut\reports\execution-plan
