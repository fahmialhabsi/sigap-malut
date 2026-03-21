SIGAP-MALUT Dashboard Template Standard

1. Struktur Layout

Header: judul, subjudul, role-aware, sticky, high-contrast.
Baris modul utama: dinamis dari master-data, langsung di bawah header.
Section utama: executive summary panel (KPI), compliance/alert panel, flowchart, data table, quick action bar, AI/feedback, open data portal.
Footer (opsional): info, copyright, versi. 2. Komponen Utama

KpiTile: KPI utama, compliance, trend, drilldown, tooltip definisi.
AlertList: alert, compliance, audit log, timeline.
DataTable: data summary, field dinamis dari master-data, exportable.
ActivityFeed: audit trail, timeline aktivitas.
AIInbox: rekomendasi AI, feedback, auto-routing.
QuickActionBar: upload, export, broadcast, generate report.
OpenDataPortal: download dataset, API publik. 3. Integrasi Data

Semua data, modul, tabel, KPI, alert, dsb diambil dari master-data (CSV/JSON).
Tidak ada input manual, semua referensi ke master-data.
Foreign key, lookup, dan relasi antar modul wajib konsisten. 4. Visual & Accessibility

Grid responsif (12 kolom desktop, 8 tablet, 4 mobile).
Design tokens: warna, font, spacing, radius, shadow.
Iconografi Heroicons/Feather, mapping token untuk setiap aksi.
High-contrast mode, ARIA label, keyboard navigation. 5. Export & Reporting

Semua data dan visual bisa export PDF, Excel, PPTX, CSV, PNG.
Laporan otomatis siap pakai. 6. AI & Feedback

Panel rekomendasi AI, anomaly detection, auto-routing, chatbot.
Widget feedback masyarakat, pelaporan, tracking status, notifikasi. 7. Self-Service Analytics

Filter, pivot, custom dashboard builder, drilldown KPI/alert. 8. Audit Trail & Compliance

Semua aksi tercatat, filterable, exportable, compliance monitoring. 9. QA & Documentation

Storybook environment untuk preview dan QA komponen.
Test coverage (Jest/RTL, Cypress), acceptance criteria di setiap page.
OpenAPI/Swagger untuk validasi kontrak data.
Template ini wajib digunakan untuk seluruh dashboard SIGAP-MALUT, baik sekretariat, bidang, UPTD, maupun publik.
Implementasi dilakukan dengan refactor layout, mapping master-data ke komponen, dan konsistensi style sesuai design tokens.
