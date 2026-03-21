---

# BAB KHUSUS: UI/UX SISTEM PENILAIAN KINERJA ASN

## Wireframe Halaman
- Input Penilaian: Form dinamis per indikator, dropdown ASN, catatan, submit.
- Review & Approval: List penilaian, tombol approve/reject, kolom catatan reviewer.
- Dashboard Rekap Kinerja: Tabel rekap nilai, filter periode, status badge.
- Detail Histori Penilaian: Timeline audit trail, histori nilai, reviewer, status.

## Data Contract
- **POST /penilaian**: { asn_id, indikator_id, nilai, catatan, periode }
- **GET /rekap-kinerja**: { asn_id, periode, nilai_akhir, status, histori }
- **PUT /approval**: { penilaian_id, reviewer_id, action, catatan }

## Status Badge
- Draft
- Submitted
- Approved
- Rejected
---

## FIGMA STARTER — SIGAP MALUT (Design Handoff)

Ringkasan:

- Figma Starter adalah paket desain untuk tim desain/developer agar style, komponen, dan workflow konsisten dengan implementasi UI/UX SIGAP Malut.
- Berisi: design tokens (warna, font, spacing, radius, shadow) dalam format JSON, struktur halaman & layer, inventory komponen, grid & breakpoints, panduan ekspor aset, accessibility, plugin rekomendasi, dan checklist handoff.

### Design Tokens (JSON)

- Gunakan tokens JSON dari Figma Starter untuk plugin Figma Tokens dan Tailwind config.
- Pastikan semua warna, font, spacing, radius, shadow di frontend dan Figma identik.

### Struktur Page & Layer

- Ikuti naming convention: Pages (Tokens, Foundations, Components, Patterns, Layouts, Dashboards, Maps, Charts, Prototypes, Assets, Docs).
- Komponen: c/{component-name}/variant, e/{element}, --state, i/{purpose}.

### Inventory Komponen

- Semua komponen (button, input, table, card, sidebar, header, chart, map, modal, toast, module generator, dashboard) dideskripsikan variant, states, accessibility, auto-layout.

### Grid & Breakpoints

- Desktop: 12 kolom, container 1280px, gutter 24px.
- Tablet: 8 kolom, container 1024px, gutter 16px.
- Mobile: 4 kolom, container 360-420px, gutter 12px.

### Accessibility & Export

- Minimum contrast 4.5:1, focus ring, high-contrast theme, keyboard navigation.
- Ekspor aset: SVG icons, PNG images, CSS variables dari tokens.

### Plugin & Checklist

- Plugin: Figma Tokens, Content Reel, Iconify, Map Maker, Chart, Autolayout, Stark, FigJam.
- Checklist: import tokens, buat page/frame, component library, responsive frames, dashboard templates, export icons/images, document states, accessibility check, handoff page.

### Instruksi Implementasi

1. Import tokens JSON ke Figma Tokens dan Tailwind config.
2. Bangun komponen di Figma sesuai inventory dan naming.
3. Pastikan semua states, variant, dan responsive di Figma match dengan React/Tailwind.
4. Ekspor aset dan CSS variables untuk dev.
5. Dokumentasikan handoff dan QA checklist.

## Dengan Figma Starter, desain dan implementasi UI/UX SIGAP Malut akan konsisten, mudah diaudit, dan siap handoff ke tim dev/QA.

## PRA-SYARAT IMPLEMENTASI (8 POINT PENTING)

Sebelum refactor dan setup dashboard SIGAP Malut, pastikan 8 hal berikut sudah siap agar sistem benar-benar profesional, modular, dan role-aware:

1. **Mapping Role-to-Module Final**

- Mapping role ke modul harus fix dan granular (bendahara hanya modul keuangan, sekretaris hanya Sekretariat, dst).
- Satu sumber kebenaran (config/JSON) untuk mapping ini, filtering sidebar/topbar konsisten.

2. **Data Dummy & API Mock**

- Mock data untuk semua panel (KPI, Alerts, Audit, Map, dsb) agar UI bisa langsung tampil tanpa backend delay.
- Endpoint API sesuai dokumen, mock response tersedia.

3. **State Management**

- Store (Zustand) punya state user, role, periode, filter global.
- Role diambil dari auth, filtering modul berbasis state ini.

4. **Auth & RBAC Enforcement**

- Login/logout flow benar, RBAC diterapkan di UI (hide modul/action) dan backend (API reject jika tidak punya akses).
- Tidak ada modul/aksi muncul jika role tidak punya izin.

5. **Design Tokens & Tailwind Config**

- Tailwind config update dengan tokens dari dokumen (warna, spacing, font).
- Semua komponen pakai tokens, bukan hardcoded style.

6. **Komponen Modular**

- Folder /ui/components dan /ui/pages, komponen utama dipisah (KpiTile, AlertList, dsb).
- Setiap komponen bisa menerima props/mock data.

7. **Responsive & Accessibility**

- Layout grid, breakpoints, ARIA label siap.
- Keyboard navigation dan contrast dicek.

8. **Storybook & Testing**

- Setup Storybook untuk preview komponen.
- Test basic (Jest/RTL) untuk acceptance.

Jika semua di atas sudah siap, refactor dan setup bisa langsung dilakukan tanpa hambatan. Jika ada yang belum, tim bisa generate atau setup sesuai kebutuhan.

# 03 — Dashboard UI/UX Level 65 (Detail Komprehensif)

Dokumen ini adalah desain UI/UX lengkap dan siap-handoff untuk semua dashboard utama SIGAP Malut. Tujuan: tim pengembang frontend/backend, designer, dan QA dapat langsung bekerja tanpa perlu klarifikasi desain tambahan.

Versi: 1.0  
Tanggal: 2026-02-19  
Disusun untuk: Sekretaris Dinas Pangan Provinsi Maluku Utara (Super Admin)  
Pengantar singkat: dokumen ini menguraikan desain visual, interaksi, komponen, kontrak data (API mock), standar aksesibilitas, responsive rules, serta checklist implementasi dan acceptance criteria.

---

DAFTAR ISI

1. Tujuan & Prinsip Desain
2. Personas & Use Cases Utama
3. Information Architecture (halaman & alur)
4. Grid, Breakpoints & Layout System
5. Visual System (palette, typography, iconography)
6. Komponen UI Kunci (detail implementasi)
7. Halaman Dashboard — Wireframes & Deskripsi Fungsional
   - 7.1 Dashboard Sekretaris (Executive)
   - 7.2 Dashboard Inflasi (Rapat Mendagri)
   - 7.3 Dashboard Kepegawaian (KGB / Pangkat)
   - 7.4 Dashboard Keuangan & SPJ
   - 7.5 Dashboard Komoditas (SSOT)
   - 7.6 Dashboard UPTD (Hasil Uji)
   - 7.7 Modul Dynamic Module & Creator
   - 7.8 Panel AI Chatbot & Inbox Surat
   - 7.9 Portal Publik (Ringkasan/Widget Publik)
8. Data Contracts (API mock: JSON examples per widget)
9. State Management & Performance Patterns
10. Accessibility & Internationalization
11. Printing & Export (Report Templates)
12. Security, Audit & Compliance UI
13. QA Checklist & Acceptance Criteria
14. Handoff & Asset List (Figma, Storybook, Tokens)
15. Roadmap Implementasi UI (Sprint-ready tasks)

---

1. TUJUAN & PRINSIP DESAIN

- Tujuan: Membuat dashboard yang tegas, informatif, cepat, dan enforce alur kerja organisasi — "Data first, Actionable next".
- Prinsip utama:
  - Clarity: setiap metric harus punya definisi & sumber data (hover tooltip).
  - Hierarchy: KPI utama terlihat tanpa scroll.
  - Action-first: CTA (tindak lanjut) hadir di setiap kartu yang butuh tindakan.
  - Enforcement: bila terdapat pelanggaran alur (bypass), UI memaksa langkah korektif (remedial).
  - Mobile-first responsiveness, tetapi desktop-first layout untuk eksekutif.

---

2. PERSONAS & USE CASES UTAMA

- Sekretaris (Super Admin) — daily: pantau 50 KPI, audit bypass, approve dokumen, generate report Mendagri.
- Kepala Dinas — weekly: review kebijakan, approve rekomendasi.
- Kepala Bidang (Ketersediaan/Distribusi/Konsumsi) — monitor komoditas, distribusi, realisasi program.
- Kasubag Kepegawaian & Bendahara — proses KGB, verifikasi SPJ.
- Petugas lapangan / enumerator — input harga, stok (mobile).
- Publik / Peneliti — akses data terbuka (portal publik).

Use cases terpenting: 1) Generate laporan Mendagri 1-click; 2) Detect & remediate bypass; 3) Zero KGB lateness; 4) Single Source of Truth for komoditas; 5) Fast drill-down dari KPI ke data rekaman & audit log.

---

3. INFORMATION ARCHITECTURE (HALAMAN & ALUR)

- /login
- /dashboard (landing untuk Sekretaris) — ringkasan KPI + alerts
- /inflasi — dashboard inflasi lengkap + generate ppt/pdf
- /komoditas — master komoditas, stok, sejarah harga
- /kepegawaian — daftar ASN + KGB tracking + proses KGB
- /keuangan — DPA/RKA/SPJ, bukti upload, verifikasi
- /uptd — hasil uji lab, sertifikasi UMKM
- /surat-inbox — inbox terotomasi dari AI chatbot (WhatsApp gateway)
- /dynamic-modules — module generator (Super Admin only)
- /public — portal data terbuka (read-only)
- /settings — roles & permissions, templates, branding

Navigasi utama: top nav + side nav (left) with role-aware items. Breadcrumb di semua halaman data-list/detail.

---

4. GRID, BREAKPOINTS & LAYOUT SYSTEM
   Grid system: 12-column CSS grid (desktop), 8-col tablet, single column mobile.

Breakpoints (Tailwind style):

- xs: < 480px — mobile
- sm: 480px — small devices
- md: 768px — tablet
- lg: 1024px — desktop
- xl: 1280px — large desktop
- 2xl: 1536px — executive screens

Spacing scale: 4px base (0.25rem). Use tokens (see Visual System).

Header height: 64px (desktop), 56px (mobile). Left nav width: 280px (desktop), collapsible to 72px icons-only.

Card border-radius: 8px. Elevation: subtle shadow levels.

---

5. VISUAL SYSTEM
   A. Color Palette (semantic)

- Primary: #0B5FFF (Brand Blue)
- Primary-600: #0956E6, Primary-300: #4D7CFF
- Accent / Success: #06A657 (success)
- Warning: #F59E0B
- Danger: #EF4444
- Neutral bg: #F6F7FB
- Card bg: #FFFFFF
- Text primary: #0F172A
- Muted text: #64748B

B. Typography

- Font family: Inter (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- Scale:
  - H1: 28px / 700
  - H2: 22px / 600
  - H3: 18px / 600
  - Body: 14px / 400
  - Caption: 12px / 400

C. Iconography

- Use Heroicons/Feather. Provide token mapping for each action (view, edit, approve, export, audit, alert).

D. Tokens (sample Tailwind config snippet)

```json
{
  "colors": {
    "primary": "#0B5FFF",
    "success": "#06A657",
    "warning": "#F59E0B",
    "danger": "#EF4444",
    "bg": "#F6F7FB",
    "card": "#FFFFFF",
    "muted": "#64748B"
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "6": "24px",
    "8": "32px"
  }
}
```

---

6. KOMPONEN UI KUNCI (DETAIL IMPLEMENTASI)
   Semua komponen harus dibuat sebagai React components (filename suggestions) dan memiliki Storybook story.

A. KPI Tile (components/KpiTile)

- Size variants: small / medium / large.
- Elements: metric label, main value, delta (▲/▼ +% month), sparkline, source badge, last updated.
- Interaction: click opens drilldown drawer with data table + audit log + action buttons (Notify, Assign, Create Task).

B. Alerts List (components/AlertList)

- Prioritization & filters.
- Each alert shows timeline, severity, affected records, quick-actions (assign, escalate, mark resolved).

C. Data Table (components/DataTable)

- Virtualized, server-side pagination, sorting, column visibility, export CSV, row actions.
- Columns: customizable; each column must display tooltip with data source.

D. Charting Patterns

- Use Recharts / ECharts for complex charts.
- Standard chart types & recommended defaults:
  - KPI trend: Area chart, 6 months, baseline line.
  - Top N contributors: Horizontal bar, sorted desc.
  - Map: React-Leaflet with clustered markers & heatmap overlay.
  - Sankey for distribution flows (optional).
- Charts must have accessible alt text and raw-data download.

E. Map Component (Komoditas & Kerawanan)

- Layers: base map (OSM), heatmap (kerawanan), markers (gudang, pasar, UPTD), polygon for district.
- Controls: layer toggle, date slider, legend, export PNG.

F. Modal / Drawer / Right Panel

- Use drawer for drilldown allowing persistent context.

G. Timeline / Activity Feed

- Display audit trail entries with icons, user, timeago, linked record.

H. Approval Flow UI

- Approval card with status, approvers, elapsed time, escalation policy (auto-escalate after X hours).

I. Dynamic Module Creator UI

- Wizard with steps (metadata → schema → permissions → print template → generate). Show progress & logs.

J. AI Chatbot Panel

- Inbox: list of AI-processed items, confidence score, original attachment preview, extracted fields, quick-correct action to retrain AI.

K. Export & Print

- Use server-side rendering for PDF/PPTX generation; UI shows preview, choose template, watermark, signatory.

---

7. HALAMAN DASHBOARD — WIREFRAMES & FUNGSIONAL DETAIL

Catatan: setiap layar diberikan struktur: Top (header + quick filters), Left nav, Main canvas (grid), Right contextual panel (expandable).

7.1 Dashboard Sekretaris (Executive)

- Grid layout: 3 columns (XL), 2 cols (LG), 1 col (MD)
- Top bar: date range selector, quick search, role switch (preview as head of bidang), global export button.
- KPI Row (sticky top): 6 primary KPIs:
  1. Compliance Alur Koordinasi (percent + small sparkline)
  2. Zero Bypass Violations (count last30d)
  3. Avg. Approval Time Sekretaris (<24h)
  4. KGB Alerts (count)
  5. Konsistensi Data Komoditas (%)
  6. Inflasi Pangan (%)
- Middle: Alerts panel (left full height), Trend chart (middle), Map (right).
- Bottom: Recent Documents (table: DPA, SK, SPJ) + Recent Activities / Audit log.
- Primary actions: "Generate Mendagri Report", "Open Inbox AI", "Create Module".
- Drilldown: click KPI → drawer shows list + quick actions (send reminder, escalate).

  7.2 Dashboard Inflasi (Rapat Mendagri)

- Top: Period selector (monthly), "Generate PPT" button.
- Left: Big number Inflasi Pangan + status pill (ON_TARGET/WARNING/ALERT).
- Center: Top 10 contributors bar chart (sortable by contribution).
- Right: Predictive widget (1-month forecast + confidence % + suggested interventions with estimated impact and required volume/cost).
- Below: Trend 6-month line chart with event markers (weather, operation_market).
- Export: PPTX template selection and notes per slide, and "One-click send to email".

  7.3 Dashboard Kepegawaian (KGB / Pangkat)

- Left: KGB timeline (calendar view) + upcoming KGB cards (30d).
- Middle: KGB tracking table with status badges (pending, proses, selesai, terlambat) and file links.
- Right: Workflow timeline for selected ASN (documents, approvals, audit log).
- Actions: "Start KGB Process", "Upload SK", "Notify via WA".

  7.4 Dashboard Keuangan & SPJ

- KPI: total transaksi month, SPJ pending, reject rate, time to verify.
- Table: transactions with expandable row showing receipts (images), linked ASN, budget code (DPA/RKA).
- Approval flow UI: stepper for SPJ (submit → verifikasi → approve → disburse).
- Secure upload with client-side image compression and OCR suggestion of fields.

  7.5 Dashboard Komoditas (SSOT)

- Master komoditas list (searchable, taggable).
- Map + heatmap of stock levels.
- Price feed panel: per-komoditas time series and per-pasar breakdown.
- Early Warning card: thresholds crossed with recommended actions.
- Actions: "Request UPTD test", "Create distribution order", "Mark as verified".

  7.6 Dashboard UPTD (Hasil Uji)

- Table of lab samples, status (in lab, result ready), certificates.
- Quality metrics: % pass GMP/NKV by month.
- Link to send result automatically to Bidang Konsumsi & Sekretaris.

  7.7 Modul Dynamic Module & Creator

- Wizard screens as described in components.
- Preview of schema, auto-generated API endpoints list, sample forms preview.
- Logs: migration status, errors, rollback button.

  7.8 Panel AI Chatbot & Inbox Surat

- Inbox lists items with confidence score, category, extracted fields.
- Quick confirm / correct flow (update classification, which adds to training dataset).
- "Auto route" toggle (on/off) and retry button.

  7.9 Portal Publik Widget

- Public-facing widgets: price mini-dashboard, export dataset buttons, simple map.
- Accessibility mode (high contrast & large text).

---

8. DATA CONTRACTS (API MOCKS)
   Semua endpoints RESTful, JSON. Berikut contoh mock responses (ringkas) untuk developer frontend.

A. GET /api/dashboard/sekretaris/summary

```json
{
  "kpis": [
    {
      "id": "compliance",
      "label": "Compliance Alur Koordinasi",
      "value": 0.94,
      "unit": "ratio",
      "trend": [0.85, 0.88, 0.92, 0.94],
      "source": "audit_log"
    },
    {
      "id": "bypass_count",
      "label": "Bypass Violations (30d)",
      "value": 3,
      "unit": "count",
      "items": [
        {
          "id": 123,
          "type": "SPJ bypass",
          "user": "bendahara",
          "date": "2026-02-15"
        }
      ]
    },
    {
      "id": "avg_approval_time",
      "label": "Avg Approval Sekretaris",
      "value": 12,
      "unit": "hours"
    },
    { "id": "kgb_alerts", "label": "KGB Alerts", "value": 5, "unit": "count" },
    {
      "id": "komoditas_consistency",
      "label": "Konsistensi Komoditas",
      "value": 1.0,
      "unit": "ratio"
    },
    {
      "id": "inflasi",
      "label": "Inflasi Pangan",
      "value": 2.35,
      "unit": "percent"
    }
  ],
  "alerts": [
    {
      "id": "a1",
      "severity": "critical",
      "title": "KGB Terlambat: Siti",
      "summary": "Terlewat 59 hari",
      "link": "/kepegawaian/2"
    },
    {
      "id": "a2",
      "severity": "warning",
      "title": "Bypass detected",
      "summary": "Bendahara submit SPJ langsung ke Kadis"
    }
  ]
}
```

B. GET /api/inflasi/latest

```json
{
  "periode": "2026-12-01",
  "inflasi_persen": 2.35,
  "status": "on_target",
  "top_10": [
    { "komoditas": "Beras Premium", "perubahan": 3.31, "kontribusi": 1.1 },
    { "komoditas": "Minyak Goreng", "perubahan": 2.74, "kontribusi": 0.6 }
  ],
  "ai_analysis": "Inflasi naik 0.25 poin ...",
  "recommendations": [
    {
      "id": "r1",
      "title": "Operasi Pasar Beras",
      "impact_est": "-0.3 poin",
      "cost_est": "Rp X",
      "actions": ["Request BULOG 50 ton", "Schedule 3 pasar"]
    }
  ]
}
```

C. GET /api/komoditas/stock?komoditas_id=1

```json
{
  "komoditas_id": 1,
  "name": "Beras Premium",
  "locations": [
    {
      "type": "gudang",
      "name": "Gudang CPPD Sofifi",
      "stock": 1000,
      "last_updated": "2026-02-18"
    },
    { "type": "bulog", "name": "Bulog Ternate", "stock": 200 }
  ],
  "data_source": "bid_ketersediaan"
}
```

D. POST /api/spj/submit (file upload multipart/form-data)
Response:

```json
{
  "status": "ok",
  "id": 987,
  "message": "SPJ submitted, pending verification by bendahara"
}
```

Catatan: untuk semua endpoints tambahkan `meta` dengan `last_updated` dan `source` di header response.

---

9. STATE MANAGEMENT & PERFORMANCE PATTERNS

- Use Zustand for global store (auth, currentOrg, selectedPeriod).
- Per-widget fetching: each widget uses suspense-like pattern, cache per 5 minutes, forceRefresh param for user-triggered refresh.
- WebSocket for alerts + real-time inflasi updates. Fallback to polling for pages without WS.
- Client-side caching in Redis (server) for heavy queries (dashboard data), expire 60-300s depending on metric.
- Lazy-load heavy components (map, charts) and use skeleton loaders.

---

10. ACCESSIBILITY & INTERNATIONALIZATION

- WCAG 2.1 AA compliance:
  - Contrast ratios >= 4.5:1 for body text.
  - Keyboard navigable: all interactive controls reachable.
  - ARIA labels for charts & map controls.
  - Skip-to-content links.
- i18n: implement i18next with locale `id` default; all strings externalized.
- Date/time: use locale "id-ID", 24-hour format.

---

11. PRINTING & EXPORT (REPORT TEMPLATES)

- Generate PPTX on server using template engine (pptxgenjs or server-side python docx/pptx).
- Each PPT slide mapping for Mendagri report defined in 7.2.
- Export PDF (for legal docs) use server-side headless HTML->PDF (wkhtmltopdf/Puppeteer) to ensure exact visual fidelity.
- Export CSV/Excel for dataset downloads with proper headers & metadata.

---

12. SECURITY, AUDIT & COMPLIANCE UI

- All sensitive actions show confirmation dialog detailing audit: who, when, why.
- Audit log accessible from UI (with filters).
- Display `security badge` on pages handling finances (verified TLS, DLP).
- RBAC enforced on UI: hide controls if permission missing. Backend always authoritative.

---

13. QA CHECKLIST & ACCEPTANCE CRITERIA
    Each page/component has acceptance criteria. Contoh ringkas:

Dashboard Sekretaris:

- KPI tiles show value, unit, trend, last_updated.
- Clicking KPI opens drawer with list of 10 latest records and audit entries.
- "Generate Mendagri Report" downloads PPTX with 6 slides and correct data for selected period.
- Alerts stream via WS within 5s after server push.

KGB flow:

- System auto-creates kgb_tracking record 30 days before KGB.
- Notifications sent (email & system) and displayed in dashboard.
- Marking SPJ complete triggers audit_log entry.

Komoditas SSOT:

- Updating komoditas master immediately reflects in Komoditas API and is visible to all bidang widgets within cache TTL.

Performance:

- Dashboard loads primary KPIs within 1.5s on 4G; full page < 3s on reasonable infra.

Accessibility:

- Keyboard navigation works; screen reader announces KPI names and values.

---

14. HANDOFF & ASSET LIST

- Figma file: SIGAP Malut / Pages: Dashboard / Components / Tokens. (Provide link in repo)
- Storybook: stories for every component (KpiTile, DataTable, Map, AlertList, ModuleWizard).
- Design tokens: JSON file (colors, spacing, fonts).
- Icon set: Heroicons set + custom icons (download folder).
- Export assets: SVG for logos + PNG fallback.

Figma file structure (recommended):

- Pages: 01 — Tokens, 02 — Components, 03 — Templates, 04 — Screens, 05 — Prototypes
  Naming convention: `Component / KpiTile / KpiTile - Small / Variant - Danger`

---

15. SPRINT-READY TASKS (HIGH PRIORITY)
    Sprint 0 (3 days) — Foundation

- Implement token system & Tailwind config
- Layout container + left nav + topbar
- Auth flow + role-aware nav
- Basic KPITile component + mock data

Sprint 1 (5 days)

- Dashboard Sekretaris: KPI row, Alerts list, Recent docs table
- WebSocket infra (simple) for alert pushes
- API contracts stubs

Sprint 2 (7 days)

- Inflasi dashboard (charts, top contributors, generate PPT button)
- Komoditas master & price feed widget (map placeholder)

Sprint 3 (7 days)

- Kepegawaian KGB flow
- SPJ upload & verification basics
- AI Inbox minimal UI hook

Each task should include Storybook story, unit tests (Jest/RTL), and E2E test (Cypress) for acceptance flows.

---

16. NEXT STEPS (UNTUK TIM)
1. Import design tokens into codebase (Tailwind config + CSS variables).
1. Create Storybook environment and implement base components with mock API responses.
1. Implement backend endpoints (stubs) matching Data Contracts.
1. Run accessibility audit (axe) and performance baseline (Lighthouse).
1. Arrange 2-hour handoff workshop between designer, frontend lead, backend lead, Sekretaris.

---

17. LAMPIRAN: SAMPLE TAILWIND CONFIG (snippet)

```js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0B5FFF",
        success: "#06A657",
        warning: "#F59E0B",
        danger: "#EF4444",
        bg: "#F6F7FB",
        card: "#FFFFFF",
        muted: "#64748B",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
      },
      fontFamily: {
        inter: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
```

---

PENUTUP
Dokumen ini dirancang agar tim Anda (designer, frontend, backend, QA) dapat langsung membuat implementasi UI/UX yang profesional, konsisten, dan memenuhi kebutuhan operasional SIGAP Malut. Jika Anda menginginkan, saya dapat:

- Menyusun file Figma starter (komponen & beberapa screens) sesuai spesifikasi di atas, atau
- Menghasilkan Storybook boilerplate React + Tailwind dengan contoh komponen (KpiTile, AlertList, DataTable) dan mock API server.

Catatan: dokumen ini sengaja dibuat rinci (Level 65) — mencakup desain visual, interaksi, data contract, aksesibilitas, dan checklist implementasi. Silakan beri tahu jika tim mau saya generate Storybook/React starter atau file Figma.
