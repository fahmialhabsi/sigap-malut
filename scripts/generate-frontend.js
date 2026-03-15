// scripts/generate-frontend.js
// Auto-generate SIGAP frontend modules from master-data blueprints
// Usage: node scripts/generate-frontend.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_DATA_DIR = path.resolve(__dirname, "../master-data");
const FRONTEND_MODULES_DIR = path.resolve(__dirname, "../frontend/src/modules");
const COMPONENTS_IMPORT = "../../components";
const API_IMPORT = "../../lib/api";

function pascalCase(str) {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readBlueprint(moduleKey, type) {
  const file = path.join(MASTER_DATA_DIR, `${type}_${moduleKey}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  }
  return null;
}

function generateApiJs(moduleKey) {
  return `import api from "${API_IMPORT}";

export function fetchList() {
  return api.get("/${moduleKey}");
}
export function fetchDetail(id) {
  return api.get("/${moduleKey}/" + id);
}
export function createItem(data) {
  return api.post("/${moduleKey}", data);
}
export function updateItem(id, data) {
  return api.put("/${moduleKey}/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/${moduleKey}/" + id);
}
`;
}

function generateListPage(moduleKey, fields) {
  return `import React, { useEffect, useState } from "react";
import { fetchList, deleteItem } from "./api";
import Table from "${COMPONENTS_IMPORT}/Table";
import PageLayout from "${COMPONENTS_IMPORT}/PageLayout";
import { useNavigate } from "react-router-dom";

const columns = ${JSON.stringify(fields)};

export default function ListPage() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchList().then(res => setData(res.data));
  }, []);
  return (
    <PageLayout>
      <h1>${moduleKey}</h1>
      <button onClick={() => navigate("/" + "${moduleKey.toLowerCase()}" + "/new")}>Tambah</button>
      <Table
        columns={columns}
        data={data}
        onView={row => navigate("/" + "${moduleKey.toLowerCase()}" + "/" + row.id)}
        onEdit={row => navigate("/" + "${moduleKey.toLowerCase()}" + "/edit/" + row.id)}
        onDelete={row => { if(window.confirm("Hapus data?")) deleteItem(row.id).then(()=>setData(data.filter(d=>d.id!==row.id))); }}
      />
    </PageLayout>
  );
}
`;
}

function generateFormPage(moduleKey, fields) {
  return `import React, { useState } from "react";
import { createItem, updateItem } from "./api";
import FormField from "${COMPONENTS_IMPORT}/FormField";
import PageLayout from "${COMPONENTS_IMPORT}/PageLayout";
import { useNavigate } from "react-router-dom";

const fields = ${JSON.stringify(fields)};

export default function FormPage({ isEdit, initialData = {} }) {
  const [form, setForm] = useState(initialData);
  const navigate = useNavigate();
  function handleChange(e) {
    const { name, value, type, files } = e.target;
    setForm(f => ({ ...f, [name]: type === "file" ? files[0] : value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    const action = isEdit ? updateItem : createItem;
    action(form.id, form).then(() => navigate("/" + "${moduleKey.toLowerCase()}"));
  }
  return (
    <PageLayout>
      <h1>{isEdit ? "Edit" : "Tambah"} ${moduleKey}</h1>
      <form onSubmit={handleSubmit}>
        {fields.map(field => (
          <div key={field.name}>
            <label>{field.label}</label>
            <FormField field={field} value={form[field.name] || ""} onChange={handleChange} />
          </div>
        ))}
        <button type="submit">Simpan</button>
      </form>
    </PageLayout>
  );
}
`;
}

function generateDetailPage(moduleKey, fields) {
  return `import React, { useEffect, useState } from "react";
import { fetchDetail } from "./api";
import PageLayout from "${COMPONENTS_IMPORT}/PageLayout";
import { useParams } from "react-router-dom";

const fields = ${JSON.stringify(fields)};

export default function DetailPage() {
  const { id } = useParams();
  const [data, setData] = useState({});
  useEffect(() => {
    fetchDetail(id).then(res => setData(res.data));
  }, [id]);
  return (
    <PageLayout>
      <h1>Detail ${moduleKey}</h1>
      <ul>
        {fields.map(field => (
          <li key={field.name}><b>{field.label}:</b> {data[field.name]}</li>
        ))}
      </ul>
    </PageLayout>
  );
}
`;
}

function generateRoutesJs(moduleKey) {
  const pascal = pascalCase(moduleKey);
  return `import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/${moduleKey.toLowerCase()}", element: <ListPage /> },
  { path: "/${moduleKey.toLowerCase()}/new", element: <FormPage /> },
  { path: "/${moduleKey.toLowerCase()}/edit/:id", element: <FormPage isEdit /> },
  { path: "/${moduleKey.toLowerCase()}/:id", element: <DetailPage /> },
];
`;
}

function main() {
  const fieldFiles = fs
    .readdirSync(MASTER_DATA_DIR)
    .filter((f) => f.startsWith("FIELDS_") && f.endsWith(".json"));
  // Pastikan folder modules ada
  ensureDir(FRONTEND_MODULES_DIR);
  for (const file of fieldFiles) {
    const moduleKey = file.replace(/^FIELDS_/, "").replace(/\.json$/, "");
    const fields = readBlueprint(moduleKey, "FIELDS");
    if (!fields) continue;
    const moduleDir = path.join(FRONTEND_MODULES_DIR, moduleKey);
    try {
      ensureDir(moduleDir);
      fs.writeFileSync(
        path.join(moduleDir, "api.js"),
        generateApiJs(moduleKey),
      );
      fs.writeFileSync(
        path.join(moduleDir, "ListPage.jsx"),
        generateListPage(moduleKey, fields),
      );
      fs.writeFileSync(
        path.join(moduleDir, "FormPage.jsx"),
        generateFormPage(moduleKey, fields),
      );
      fs.writeFileSync(
        path.join(moduleDir, "DetailPage.jsx"),
        generateDetailPage(moduleKey, fields),
      );
      fs.writeFileSync(
        path.join(moduleDir, "routes.js"),
        generateRoutesJs(moduleKey),
      );
      fs.writeFileSync(
        path.join(moduleDir, "fields.js"),
        `export const fields = ${JSON.stringify(fields, null, 2)};\n`,
      );
      console.log(`Generated module: ${moduleKey}`);
    } catch (err) {
      console.error(`Gagal generate module: ${moduleKey} -`, err);
    }
  }
}

main();
