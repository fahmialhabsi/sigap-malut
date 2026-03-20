# 15 - Panduan Integrasi e‑Pelara ke SIGAP‑MALUT (untuk GitHub Copilot / VS Code)

Versi: 2026-03-20  
Penulis: Sistem (direkomendasikan untuk disesuaikan oleh tim sebelum implementasi)

Ringkasan singkat

- Tujuan: panduan lengkap dan terstruktur agar integrasi e‑Pelara ke SIGAP‑MALUT dapat diimplementasikan dari development sampai deployment tanpa kebingungan oleh GitHub Copilot atau engineer yang bekerja di VS Code.
- Hasil yang diharapkan: integrasi berjalan di lingkungan development (tercontainerisasi), kontrak API terdokumentasi, shared utilities dipisah/di-publish, CI/CD dan deployment terotomasi, serta daftar tugas/cek untuk developer.

Sumber referensi (file penting dari repo e‑Pelara yang saya baca)

- docker-compose.yml: https://github.com/fahmialhabsi/e-pelara/blob/main/docker-compose.yml
- backend/Dockerfile: https://github.com/fahmialhabsi/e-pelara/blob/main/backend/Dockerfile
- frontend/Dockerfile: https://github.com/fahmialhabsi/e-pelara/blob/main/frontend/Dockerfile
- db_epelara.sql (dump DB): https://github.com/fahmialhabsi/e-pelara/blob/main/db_epelara.sql
- Catatan Aplikasi e‑Pelara (txt/docx) and Daftar Nama Tabel Dan Field.xlsx — periksa untuk mapping data model.

Catatan: panduan ini mengasumsikan kedua repo (sigap-malut dan e-pelara) tetap terpisah (microservice / service-per-repo). Itu cara paling aman dan cepat untuk integrasi awal. Jika ingin tight coupling (monorepo), langkah yang perlu ditambahkan juga dijelaskan.

1. Rekomendasi pendekatan integrasi (pilih satu)

- A — Loose coupling (direkomendasikan awal)
  - Sigap-malut tetap memakai backend sendiri.
  - e‑Pelara expose API (REST/GraphQL) yang SIGAP konsumsi.
  - Gunakan API Gateway / reverse-proxy untuk routing (nginx/traefik).
  - Keunt.: cepat, rollback mudah, sedikit perubahan.
- B — Shared packages (jika banyak logika yang identik)
  - Ekstrak shared utils/enums/validation/workflow engine menjadi paket npm privat atau git submodule.
  - Gunakan versioning (semver).
- C — Full merge (khusus bila mau jadi satu produk)
  - Gabungkan repo → monolit. Risiko migrasi & testing lebih besar — butuh planning terperinci.

2. Hal penting yang harus disiapkan sebelum coding

- Standarisasi environment variables di tiap repo (setiap repo punya `.env.example`).
- Tentukan engine DB produksi (jangan sqlite di prod). Konsistensi: gunakan MySQL/Postgres untuk kedua layanan bila memungkinkan.
- Buat OpenAPI/Swagger (atau setidaknya endpoint list) untuk setiap API penting di e‑Pelara yang SIGAP butuhkan.
- Tambahkan endpoint health check (`/health`, `/healthz`) di tiap backend.

3. Mapping kebutuhan integrasi (contoh high-level)

- Autentikasi: pilih central auth (JWT or OIDC). Jika belum ada, buat service auth sederhana (JWT shared secret) atau gunakan Keycloak.
- Data sharing: baca lewat API (read-only) atau event-based sync untuk data besar.
- Workflow/approval: jika e‑Pelara punya modul workflow, identifikasi:
  - Endpoints submit/approve/status: contoh: `/api/approval`, `/api/workflow-status`, `/api/approval/:id/status`
  - DTO (payload) untuk submit/update: { user: {username}, modulId, dataId, detail, status }
  - Pastikan format user/roles konsisten (lihat serviceRegistry.json pada kedua repo).

4. Daftar file/komponen di e‑Pelara yang perlu diperiksa/dipakai di SIGAP

- docker-compose.yml — contoh konfigurasi dev (mysql + redis + backend + frontend)
- db_epelara.sql — dump skema & data, sangat berguna untuk mapping tabel; gunakan untuk membuat migration atau seed
- backend/Dockerfile & frontend/Dockerfile — contoh Docker build; bisa diadapt ke kedua repo
- Dokumen: Catatan Aplikasi e‑Pelara.\* & Daftar Nama Tabel Dan Field.xlsx — baca untuk definisi field/relasi
  Langkah: buka file-file tersebut, catat:
  - Model tabel yang relevan untuk integrasi (user, roles, workflow, approval logs, layanan)
  - Nama endpoint di backend (cek controller dan routes di folder backend)

5. Contoh docker-compose.dev.yml terintegrasi (development)

- Tujuan: menjalankan kedua backend + DB(s) + reverse proxy sehingga frontend dapat mem-proxy call ke backend yang benar.
- Contoh (sesuaikan nama image/paths dll):

```yaml
version: "3.8"
services:
  sigap-backend:
    build:
      context: ./sigap-malut/backend
      dockerfile: Dockerfile
    container_name: sigap-backend
    environment:
      NODE_ENV: development
      PORT: 5000
      # tambahkan env lain sesuai config sigap
    ports:
      - "5000:5000"
    networks:
      - app-net

  epelara-backend:
    build:
      context: ./e-pelara/backend
      dockerfile: Dockerfile
    container_name: epelara-backend
    environment:
      NODE_ENV: production
      PORT: 3000
      MYSQL_HOST: mysql
      MYSQL_PORT: 3306
      MYSQL_USER: root
      MYSQL_PASSWORD: rootpassword
      MYSQL_DATABASE: app_db
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - "3000:3000"
    depends_on:
      - mysql
      - redis
    networks:
      - app-net

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: app_db
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - app-net

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-net

  reverse-proxy:
    image: nginx:stable-alpine
    ports:
      - "80:80"
    volumes:
      - ./deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - sigap-backend
      - epelara-backend
    networks:
      - app-net

volumes:
  mysql-data:

networks:
  app-net:
    driver: bridge
```

Contoh nginx.conf (deploy/nginx.conf) untuk routing:

```nginx
server {
  listen 80;
  server_name _;

  location /api/sigap/ {
    proxy_pass http://sigap-backend:5000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /api/epelara/ {
    proxy_pass http://epelara-backend:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location / {
    # Serve a generic frontend, or redirect to a specific front-end container
    return 302 /frontend/;
  }
}
```

6. Vite frontend proxy (jika men-develop frontend SIGAP atau e‑Pelara dengan vite)
   Contoh vite.config.js (frontend dev) — agar permintaan `/api/...` diarahkan ke nginx atau backend langsung:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/sigap": "http://localhost:5000",
      "/api/epelara": "http://localhost:3000",
    },
  },
});
```

7. Environment variables yang wajib dicatat (mapping minimal)

- e‑Pelara (lihat docker-compose.yml): MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, REDIS_HOST, REDIS_PORT, PORT
- SIGAP (pastikan ada variabel analognya; konfigurasi default di sigap-malut/config/config.json menunjukkan sqlite dev — pindahkan ke MySQL di production)
- Shared secret untuk JWT (AUTH_JWT_SECRET) atau OIDC config (OIDC_ISSUER, CLIENT_ID, CLIENT_SECRET)
- API gateway base URLs

8. Database migration & skema

- Jika SIGAP saat ini pakai sqlite (config/config.json), rencana migrasi:
  1. Pilih DB target di production (MySQL/Postgres). Karena e‑Pelara menggunakan MySQL, rekomendasi: gunakan MySQL untuk SIGAP juga agar lebih mudah migrasi data.
  2. Tambah migrasi Sequelize untuk membuat / menyesuaikan tabel; gunakan migration files (`migrations/`) dan run `npx sequelize db:migrate --env production`.
  3. Untuk memindahkan data: buat script migrasi ETL (export dari sqlite → transform → import ke MySQL) OR gunakan SQL dump/seed. HATI‑HATI pada primary keys/UUID/counters.
  4. Jika integrasi hanya membaca data e‑Pelara dari SIGAP, hindari memodifikasi DB e‑Pelara dari SIGAP secara langsung.
- Gunakan db_epelara.sql sebagai reference untuk tabel & fields (pastikan lisensi/data privat).

9. Sharing code / packages

- Ekstrak potongan kode yang ingin dibagi (contoh):
  - enums approval: APPROVAL_STATUS
  - DTO/Request payload shapes
  - axios/apiClient config
  - middleware auth (token validation)
  - serviceRegistry.json (dipakai sebagai source-of-truth)
- Cara: buat repo `shared-sigap-epelara` atau publish ke GitHub Packages:
  - package.json name: `@org/shared-workflow`
  - Struktur minimal:
    - src/index.js (exports: APPROVAL_STATUS, buildApiClient, mapRoles, serviceRegistry)
  - Konsumsi di repo lain dengan `npm install ../path` atau `npm i @org/shared-workflow@version`.

10. CI/CD (GitHub Actions) — contoh pipeline minimal per repo

- Job: lint → test → build → docker build & push → deploy staging
- Contoh skeleton (sigap-malut/.github/workflows/deploy.yml):

```yaml
name: CI/CD
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with: node-version: 20
      - name: Install
        run: npm ci
      - name: Test
        run: npm test
      - name: Build Docker image and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: user/repo:latest
```

- Pastikan secret untuk registry (DOCKER_USERNAME, DOCKER_PASSWORD) disimpan di GitHub Secrets.

11. Testing & integration tests

- Unit tests per service (jest/mocha).
- Integration tests run both services together (docker-compose up --build) then run smoke tests (supertest/curl) untuk endpoint integrasi.
- Contract tests: bila menggunakan shared packages, gunakan pact.io atau schema validation untuk memastikan backward compatibility.

12. GitHub Copilot / VS Code — pedoman prompt & tasks agar Copilot membantu tepat

- Saat menulis perubahan, sertakan komentar yang jelas pada file sebelum commit. Contoh header comment:
  ```js
  // INTEGRATION TASK:
  // - This function implements the client to call e-Pelara /api/epelara/approval
  // - Payload must match { user: {username}, modulId, dataId, detail }
  // - Use shared package @org/shared-workflow
  ```
- Gunakan Copilot untuk generate boilerplate (axios calls, try/catch), tapi verifikasi:
  - Nama endpoint & payload dari e‑Pelara controllers (open controllers to confirm).
  - Error handling & retries (add axios-retry).
- Jika membuat migration files, include descriptive commit messages and migration name (timestamp-prefixed).
- Provide Copilot with small, focused prompts inside file (don’t ask broad “implement all integration” prompts). Example prompts:
  - "Implement function submitToEpelara(form) to POST to http://epelara-backend:3000/api/epelara/approval with body {...}. Use axios instance from services/apiClient."
  - "Create migration to add column dashboardUrl to users table using sequelize."

13. Checklist PR / Release (pre-merge)

- [ ] Semua perubahan teruji lokal (unit + smoke).
- [ ] Migration scripts checked & reversible (down available).
- [ ] Secrets tidak di-commit.
- [ ] .env.example diperbarui untuk semua env baru.
- [ ] OpenAPI/Swagger up-to-date (generated file included or link to docs).
- [ ] CI passing.
- [ ] Rollback plan ada di PR description.

14. Potensi masalah yang sering muncul & mitigasi

- Vite proxy ECONNREFUSED: backend tidak berjalan atau port salah. Debug: curl backend, periksa vite.config.js proxy target.
- CORS issues: atur Access-Control-Allow-Origin di backend atau lewat nginx.
- DB locking/charset mismatch saat import dump: gunakan same charset / engine, cek foreign key constraints.
- Config differences (sqlite vs mysql): buat config per NODE_ENV and test both.
- Breaking API changes: use versioned endpoints (`/v1/...`), contract tests.

15. Rencana implementasi terperinci (milestone kecil)

- Milestone 0 (preparation)
  - Baca db_epelara.sql dan buat daftar tabel yang relevan untuk integrasi.
  - Buat `.env.example` dan dokumentasi env.
- Milestone 1 (dev environment)
  - Buat `docker-compose.dev.yml` untuk menjalankan kedua app + nginx.
  - Pastikan frontends dapat mengakses backends via /api paths.
- Milestone 2 (API contract)
  - Tambah/hasilkan OpenAPI untuk e‑Pelara endpoints yang diperlukan.
  - Buat client wrapper di SIGAP yang memanggil e‑Pelara.
- Milestone 3 (shared code)
  - Ekstrak shared enums/clients ke paket `@org/shared-workflow`.
- Milestone 4 (CI + tests)
  - Tambah GitHub Actions, integration tests running docker-compose.
- Milestone 5 (staging & prod)
  - Deploy to staging (docker-compose or k8s), run smoke tests, then release to prod with blue-green/canary.

16. Contoh perintah CLI umum

- Jalankan dev integrated stack:
  - docker-compose -f docker-compose.dev.yml up --build
- Jalankan migration (Sequelize):
  - npx sequelize db:migrate --env development
- Dump DB MySQL (export):
  - mysqldump -u root -p app_db > dump.sql
- Test API:
  - curl -v http://localhost:3000/api/epelara/workflow-status
- Lint & test:
  - npm ci && npm test

17. Tasks / Issues yang perlu dibuat untuk tim (contoh)

- TASK-001: Buat docker-compose.dev.yml terintegrasi + nginx.conf
- TASK-002: Generate OpenAPI untuk e‑Pelara backend dan tempatkan di /docs
- TASK-003: Implement client wrapper di SIGAP untuk endpoint approval e-Pelara
- TASK-004: Ekstrak APPROVAL_STATUS dan share housekeeping enums ke package shared
- TASK-005: Migrasi SIGAP dari sqlite ke MySQL (migrations + ETL)
- TASK-006: Tambah health endpoints di kedua backend
- TASK-007: Tambahkan GitHub Actions integration job yang menjalankan docker-compose integration tests

18. Pedoman commit / PR message untuk Copilot consistency

- Format commit:
  - type(scope): short description
  - contoh: feat(approval): add epelara client submitForApproval
  - contoh: fix(db): add migration for dashboardUrl in users
- PR template: isi field "What changed", "Why", "How to test", "Rollback plan".

19. Security & Data privacy

- Jangan commit db_epelara.sql jika berisi data sensitif—sebaiknya hanya bagikan schema atau contoh data sanitized.
- Simpan credentials di GitHub Secrets / Vault.
- Pastikan role mapping tidak leak sensitive permissions.

20. Dokumentasi tambahan untuk GitHub Copilot (contoh prompt presets)

- "Write a small function in Node (axios) that posts approval payload { user: { username }, modulId, dataId, detail } to URL `http://epelara-backend:3000/api/epelara/approval`. Use axios instance import from services/apiClient and export a named function `submitForApprovalEpelara`."
- "Create a Sequelize migration that adds `dashboardUrl` column to `users` table — up and down implemented."

Penutup / Apa yang sudah saya lakukan di sini

- Saya telah membaca dan merangkum file-file kunci dari repo e‑Pelara (Dockerfiles, docker-compose, DB dump, docs) dan menyusun panduan lengkap agar integrasi ke sigap-malut dapat diikuti langkah-per-langkah.
- Dokumen ini ditulis agar GitHub Copilot/engineer di VS Code mendapatkan konteks yang jelas saat menulis kode integrasi: mapping env, contoh proxy/nginx, contoh docker-compose, contoh prompts, checklist, dan tasks.

Langkah selanjutnya (pilih salah satu)

- Saya bisa buatkan file `docker-compose.dev.yml` konkret yang menaruh kedua repo (perlu path relatif pada mesin Anda) — saya akan generate file siap taruh di root sigap-malut.
- Saya bisa buatkan `services/shared-workflow` package skeleton (package.json + index.js) yang dapat langsung di-publish atau di-link dengan `npm link`.
- Saya bisa scan folder backend di masing-masing repo untuk mengenerate daftar endpoint (OpenAPI skeleton) otomatis.
  Ketik pilihan Anda atau minta saya menghasilkan salah satu artefak di atas, lalu saya buatkan file yang sesuai untuk Anda taruh di repo `sigap-malut/dokumenSistem`.
