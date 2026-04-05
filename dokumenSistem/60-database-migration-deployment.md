# Database: migrasi, `sequelize.sync()`, dan deployment

## `sequelize.sync()` vs `sequelize-cli db:migrate`

| Aspek | `sequelize.sync()` | `sequelize-cli db:migrate` |
|--------|-------------------|----------------------------|
| Sumber kebenaran | Model Sequelize saat ini | File di `backend/migrations/*.cjs` + baris di **`SequelizeMeta`** |
| Jejak riwayat | Tidak ada di DB | Tabel `SequelizeMeta` |
| PostgreSQL ENUM | Dapat memicu `ALTER TYPE ... ADD VALUE` saat introspeksi | Perubahan ENUM sebaiknya di migrasi eksplisit |
| Rekomendasi prod | **Matikan** (`DB_SYNC_ON_BOOT=0`) | **Wajib** jadi pipeline deploy |

Log `CREATE TABLE IF NOT EXISTS` / introspeksi saat `npm run dev` **bukan** bukti bahwa `db:migrate` sudah dijalankan — itu bisa murni dari `sync()`.

### `package.json` dengan `"type": "module"`

File migrasi yang memakai **`module.exports` (CommonJS)** harus ber-ekstensi **`.cjs`**, bukan `.js` — jika tidak, Sequelize CLI memunculkan *module is not defined in ES module scope*. Migrasi di repo ini memakai `*.cjs` untuk pola tersebut. Skrip bantu: `node backend/scripts/rename-migrations-js-to-cjs.mjs`.

Migrasi **tidak boleh** memakai sintaks ESM (`export const up` / `import`) — Sequelize CLI memuatnya sebagai CommonJS → error *Unexpected token 'export'*. Seluruh migrasi harus `module.exports = { async up, async down }`. Skrip perbaikan massal: `npm run migrations:fix-esm-exports` (di folder `backend`).

Jika database Anda sudah punya baris di `SequelizeMeta` dengan nama berakhiran **`.js`** dan file di repo diganti menjadi **`.cjs`**, Sequelize bisa menganggap migrasi itu “baru” dan mencoba menjalankan ulang. Perbaiki dengan:

```sql
UPDATE "SequelizeMeta" SET name = REPLACE(name, '.js', '.cjs') WHERE name LIKE '%.js';
```

(hanya jika Anda yakin isi migrasi setara; backup DB dulu.)

### Duplikat indeks setelah `createTable` (PostgreSQL)

Dialect PostgreSQL di Sequelize membangun `CREATE TABLE IF NOT EXISTS …`. Jika tabel sudah dibuat lebih dulu (mis. oleh `sequelize.sync()`), pembuatan tabel dilewati, tetapi langkah berikutnya seperti `queryInterface.addIndex(…)` tetap dijalankan — atau sebaliknya indeks dengan nama yang sama sudah ada dari sync — sehingga muncul error *relation "…" already exists* untuk indeks. Mitigasi: gunakan `CREATE INDEX IF NOT EXISTS …` (nama indeks eksplisit, konsisten dengan konvensi Sequelize) atau cek `showIndex` sebelum `addIndex`. Contoh perbaikan di repo: `backend/migrations/20260322-create-notifications.cjs`, `20260402-create-audit-log-archive.cjs`.

### `COMMENT ON COLUMN` digabung ke `CREATE TABLE` / `ADD COLUMN` (PostgreSQL)

Jika definisi kolom memakai `comment: "…"` di `queryInterface.createTable` atau `addColumn`, Sequelize (dialect Postgres) menggabungkan `COMMENT ON COLUMN …` ke **string SQL yang sama** setelah `CREATE TABLE IF NOT EXISTS` atau `ALTER TABLE … ADD COLUMN`. User migrasi harus punya hak setara **owner** untuk kedua pernyataan itu; jika tidak, muncul *must be owner of table …*. Mitigasi: **jangan** set `comment` pada kolom di migrasi tersebut (dokumentasikan di komentar JS file migrasi bila perlu). Contoh penyesuaian: `20260322-create-surat-keluar.cjs`, `20260322-create-surat-masuk.cjs`, `20260407-operational-modules-execution-thread.cjs`.

### `ALTER TABLE` / indeks pada tabel yang bukan milik user migrasi

`ADD COLUMN` dan `CREATE INDEX` memerlukan hak **owner** (atau superuser). Jika tabel dibuat oleh role lain (mis. `postgres` saat `sync`), `db:migrate` dengan user aplikasi gagal dengan *must be owner of table …*. Migrasi `20260407-operational-modules-execution-thread.cjs` (dan `20260408-…`) menangkap kasus itu: mencatat **peringatan** + contoh SQL di log, **melewatkan** tabel bersangkutan, dan melanjutkan — agar baris di `SequelizeMeta` tetap konsisten. **Wajib** perbaiki skema untuk tabel yang dilewati: `ALTER TABLE "nama_tabel" OWNER TO <user_migrasi>` (superuser), lalu jalankan `ADD COLUMN` / `CREATE INDEX` yang ditampilkan di log, atau ulangi migrasi setelah ownership disamakan.

## Variabel lingkungan (backend)

| Variabel | Default (ringkas) | Keterangan |
|----------|-------------------|------------|
| `DB_SYNC_ON_BOOT` | `false` di **production**; `false` jika `DB_DIALECT=postgres` di non-prod; `true` untuk SQLite dev | Menjalankan `sequelize.sync()` saat startup |
| `DB_MIGRATION_REQUIRED` | `true` jika **production** + **postgres** | Memverifikasi `SequelizeMeta` + migrasi kritis |
| `DB_MIGRATION_STRICT` | `false` | Jika `true`, gap migrasi → **process.exit(1)** |
| `DB_MIGRATION_INFO` | `true` di non-prod Postgres saat `DB_MIGRATION_REQUIRED` dimatikan | Log baca-saja status migrasi |
| `DB_DEV_SCHEMA_PATCH_ON_BOOT` | `true` non-prod, `false` prod | Patch kolom `Tasks` ad-hoc (hanya dev/staging; prod pakai migrasi) |

## Verifikasi `SequelizeMeta` (PostgreSQL)

```sql
SELECT name FROM "SequelizeMeta" ORDER BY name;
```

Atau dari folder `backend`:

```bash
npm run db:verify
```

Skrip keluar kode `0` jika semua migrasi **kritis** terdaftar (lihat `migrationReadinessService.js`).

## Menjalankan migrasi CLI

Dari folder **`backend`** (setelah `npm install`):

```bash
npx sequelize-cli db:migrate
# atau
npm run db:migrate:cli
```

Status:

```bash
npm run db:migrate:status
```

Konfigurasi CLI: `backend/config/sequelize-cli.cjs`, paths: `backend/.sequelizerc`.

## Policy deploy production (disarankan)

1. Set `NODE_ENV=production`, `DB_DIALECT=postgres`.
2. Set **`DB_SYNC_ON_BOOT=0`** (atau biarkan default production).
3. Jalankan **`db:migrate`** sebelum atau sebagai bagian dari startup container (init job), bukan mengandalkan sync.
4. Opsional ketat: `DB_MIGRATION_STRICT=true` setelah pipeline migrasi stabil.
5. Redis: jika tidak ada, cache jatuh ke memori — baca log `[Cache] Startup` di boot.

## Jika migrasi tertinggal

1. Cek `SELECT * FROM "SequelizeMeta" ORDER BY name`.
2. Jalankan `npm run db:migrate:cli` pada environment target (backup DB dulu).
3. Jangan mengaktifkan `DB_SYNC_ON_BOOT` di prod hanya untuk “memperbaiki” — risiko drift ENUM/skema.

## Log startup yang diharapkan

- `[DB] DB_SYNC_ON_BOOT=enabled|disabled`
- Production: `mengandalkan migrasi CLI`
- `[DB] SequelizeMeta: OK` atau peringatan + daftar migrasi kritis hilang
- `[Cache] Redis: terhubung` atau fallback in-memory

## Catatan SQLite lokal

`SequelizeMeta` mungkin tidak ada jika hanya memakai `sync()`. Untuk menyamakan perilaku dengan prod, gunakan Postgres lokal + migrasi CLI.

## ENUM / Postgres

Lihat `enum-schema-postgres-notes.md`.
