# Panduan Integrasi Grafana dengan Prometheus

1. Pastikan backend Anda sudah menyediakan endpoint Prometheus di `/metrics`.

2. Install Prometheus dan Grafana:
   - Prometheus: https://prometheus.io/download/
   - Grafana: https://grafana.com/grafana/download

3. Konfigurasi Prometheus:
   Tambahkan job berikut di file `prometheus.yml`:

```
scrape_configs:
  - job_name: 'sigap-malut-backend'
    static_configs:
      - targets: ['localhost:5000']
```

4. Jalankan Prometheus dan pastikan dapat mengakses http://localhost:9090

5. Konfigurasi Grafana:
   - Buka Grafana di http://localhost:3000
   - Tambahkan data source Prometheus (URL: http://localhost:9090)
   - Import dashboard (contoh di bawah)

6. Contoh Dashboard JSON:

Simpan file berikut sebagai `grafana-dashboard.json` dan import ke Grafana.

```json
{
  "dashboard": {
    "id": null,
    "title": "SIGAP Malut Backend Monitoring",
    "panels": [
      {
        "type": "graph",
        "title": "HTTP Requests",
        "targets": [
          {
            "expr": "http_requests_total",
            "legendFormat": "{{method}} {{route}} {{status}}"
          }
        ]
      }
    ],
    "schemaVersion": 16,
    "version": 1
  }
}
```

7. Selesai! Sekarang Anda bisa memonitor backend SIGAP Malut melalui Grafana.
