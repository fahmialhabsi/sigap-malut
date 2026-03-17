# check-workflows-api Usage

## Cara Menjalankan Checker

1. **Install dependencies** (jika belum):

   ```sh
   npm install ts-morph glob minimist chalk
   # atau
   yarn add ts-morph glob minimist chalk
   # atau
   pnpm add ts-morph glob minimist chalk
   ```

2. **Jalankan script checker:**

   ```sh
   npx ts-node scripts/check-workflows-api.ts --json > report.json
   # atau untuk output human readable
   npx ts-node scripts/check-workflows-api.ts --verbose
   ```

3. **Contoh Output JSON**

   ```json
   {
     "endpoints": [
       {
         "path": "/api/workflows",
         "method": "GET",
         "file": "src/routes/workflows.ts",
         "line": 34,
         "handlerIdentifier": "getWorkflows"
       }
     ],
     "authChecks": [
       {
         "path": "/api/workflows",
         "method": "GET",
         "middlewarePresent": true,
         "middlewareNames": ["auth", "ensureScope('workflows:read')"],
         "checksDetected": ["middleware"]
       }
     ],
     "dataModelHints": ["src/models/workflow.ts"],
     "crossInstitutionSupportDetected": false,
     "recommendations": ["Missing endpoint: POST /api/workflows/:id/transition"]
   }
   ```

4. **Interpretasi**
   - Jika ada [MISSING], tambahkan endpoint/middleware sesuai rekomendasi.
   - Jika `crossInstitutionSupportDetected: false`, pastikan ada pemeriksaan otorisasi lintas-instansi di controller/middleware.
   - Exit code 0: semua OK, 2: endpoint kritikal hilang, 3: endpoint ada tapi otorisasi lintas-instansi lemah/missing.

## Menjalankan Integration Test (opsional)

1. **Set token dan fixture**
   - Export token dari env:
     ```sh
     export TEST_ADMIN_TOKEN=... # token admin
     export TEST_USER_TOKEN=...  # token user biasa
     export TEST_SERVICE_TOKEN=... # token service internal
     ```
   - Pastikan ada workflow fixture id di env jika perlu.

2. **Jalankan test**
   ```sh
   npm test -- tests/integration/check-workflows-api.integration.test.ts
   ```

## Contoh GitHub Actions

```yaml
jobs:
  check-workflows-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npx ts-node scripts/check-workflows-api.ts --json > report.json
      - run: cat report.json
      - run: exit $(jq '.exitCode' report.json)
```

## Dependencies

- ts-morph
- glob
- minimist
- chalk
- (optional) supertest, jest (untuk integration test)

---

**Lihat juga:**

- scripts/check-workflows-api.ts
- tests/integration/check-workflows-api.integration.test.ts
