# Updated Production KPI — SIGAP-MALUT v2.2

**Tanggal:** 2026-04-05  
**Branch:** `audit/pilot-hardening-release`  
**Baseline sebelumnya:** `production-kpi.md` v2.1 (skor 76/100)

---

## KPI Per Layer

| Layer | v2.0 (pre-remediation) | v2.1 (post-go-live) | v2.2 (post-hardening) | Delta v2.1→v2.2 |
|-------|----------------------|--------------------|-----------------------|-----------------|
| 1. Security Hardening | 55 | 72 | **78** | +6 |
| 2. Workflow Integrity | 60 | 80 | **82** | +2 |
| 3. Data Integrity | 70 | 75 | **75** | 0 |
| 4. API Robustness | 55 | 72 | **76** | +4 |
| 5. OpenAPI Alignment | 20 | 25 | **70** | +45 |
| 6. Release Automation | 10 | 15 | **65** | +50 |
| 7. Verification Repeatability | 15 | 20 | **72** | +52 |
| 8. Pilot Readiness Total | 40 | 60 | **76** | +16 |

---

## Interpretasi Skor

| Skor | Interpretasi |
|------|-------------|
| 90–100 | Kuat dan siap produksi penuh |
| 75–89 | Siap dengan gap minor |
| 60–74 | Siap dengan kondisi ketat |
| 40–59 | Belum cukup |
| 0–39 | Tidak siap |

---

## Skor Komposit

| Metrik | Skor |
|--------|------|
| **Weighted Average (all layers)** | **74.3 / 100** |
| **Pilot Readiness Score** | **76 / 100** |
| **Risk Residual Index** | 24 (100 − 76) |

---

## Delta Signifikan v2.1 → v2.2

### OpenAPI Alignment: 25 → 70 (+45)
- **Alasan:** 6 endpoint kritikal (submit, review, tugas-terverifikasi, bawahan, verifikasi) yang sebelumnya tidak terdokumentasi kini tersinkron
- **Gap tersisa:** ~15 endpoint P1/P2 lain belum terdokumentasi

### Release Automation: 15 → 65 (+50)
- **Alasan:** `p0p1-regression-guard.yml` memberikan anti-regresi nyata untuk BL-001/002/011; 3 workflow lama masih aktif
- **Gap tersisa:** Tidak ada gate frontend build; e2e test belum ada; jest coverage threshold belum dikonfigurasi

### Verification Repeatability: 20 → 72 (+52)
- **Alasan:** `verify-pilot-readiness.mjs` dengan 18+ test case dapat dijalankan ulang kapan pun
- **Gap tersisa:** Test tidak bisa dijalankan tanpa server running; MFA flow tidak terverifikasi

---

## Target Produksi Penuh

| Layer | Skor v2.2 | Target Produksi | Gap |
|-------|-----------|-----------------|-----|
| Security Hardening | 78 | 85 | 7 |
| Workflow Integrity | 82 | 85 | 3 |
| Data Integrity | 75 | 85 | 10 |
| API Robustness | 76 | 85 | 9 |
| OpenAPI Alignment | 70 | 90 | 20 |
| Release Automation | 65 | 85 | 20 |
| Verification Repeatability | 72 | 85 | 13 |
| Pilot Readiness Total | 76 | 85 | 9 |

---

## Pilot Readiness Score

```
Total Score v2.2: 74.3/100
Pilot Readiness:  76/100 (CONDITIONAL GO — pilot terbatas Sekretariat diizinkan)
Risk Residual:    24/100 (risiko residual moderat, mitigasi aktif)
```
