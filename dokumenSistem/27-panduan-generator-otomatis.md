# Workflow Generator SIGAP-MALUT

## Overview

Generator otomatis untuk membuat schema database, model Sequelize, controller, routes, dan index routes dari file CSV master data.

## Struktur Input

- **Lokasi CSV**: `master-data/FIELDS_*/`
- **Format**: File CSV dengan header sebagai nama kolom
- **Folder Structure**:
  - `FIELDS_SEKRETARIAT/` - Modul Sekretariat (12 tabel)
  - `FIELDS_BIDANG_KETERSEDIAAN/` - Bidang Ketersediaan (6 tabel)
  - `FIELDS_BIDANG_DISTRIBUSI/` - Bidang Distribusi (7 tabel)
  - `FIELDS_BIDANG_KONSUMSI/` - Bidang Konsumsi (6 tabel)
  - `FIELDS_UPTD/` - UPTD (7 tabel)

## Commands

### Generate All Components

```bash
cd backend
npm run generate:all
```

Menjalankan semua generator secara berurutan.

### Generate Individual Components

#### 1. Generate Schema SQL

```bash
npm run generate:schema
```

- **Input**: CSV files di `master-data/FIELDS_*/`
- **Output**: SQL files di `backend/database/schema/`
- **Purpose**: Membuat DDL untuk tabel database

#### 2. Generate Sequelize Models

```bash
npm run generate:models
```

- **Input**: CSV files
- **Output**: Model files di `backend/models/auto-generated/`
- **Purpose**: Membuat model Sequelize dengan associations

#### 3. Generate Controllers

```bash
npm run generate:controllers
```

- **Input**: Model files
- **Output**: Controller files di `backend/controllers/`
- **Purpose**: CRUD operations untuk setiap model

#### 4. Generate Routes

```bash
npm run generate:routes
```

- **Input**: Controller files
- **Output**: Route files di `backend/routes/`
- **Purpose**: REST API endpoints

#### 5. Generate Route Index

```bash
npm run generate:route-index
```

- **Input**: All route files
- **Output**: `backend/routes/index.js`
- **Purpose**: Central route registration

## Workflow Execution Order

1. **Schema Generation** → Membuat tabel database
2. **Model Generation** → Membuat ORM models
3. **Controller Generation** → Business logic
4. **Route Generation** → API endpoints
5. **Route Index** → Route registration

## Output Statistics (Latest Run)

- **Total Tables**: 37
- **Total Models**: 38
- **Total Controllers**: 56
- **Total Routes**: 66
- **Total Route Registrations**: 84

## Error Handling

- Generator akan melanjutkan meskipun ada error di file tertentu
- Error akan dilog ke console
- File yang berhasil akan tetap di-generate

## Dependencies

- Node.js ESM
- csv-parse
- Sequelize
- File system access

## Troubleshooting

- Pastikan CSV files ada di `master-data/FIELDS_*/`
- Pastikan database connection tersedia untuk schema generation
- Check console output untuk error details
