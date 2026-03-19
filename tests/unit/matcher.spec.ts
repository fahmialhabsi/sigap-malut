import {
  extractRequirementsFromMarkdownContent,
  fuzzyMatch,
  detectRouteInSource,
  parseMarkdownTables,
} from "../../scripts/matcher";
import fs from "fs";
import path from "path";

describe("extractRequirementsFromMarkdownContent", () => {
  it("harus mendeteksi permission workflow:read dari markdown", () => {
    // Simulasi markdown dengan heading dan bullet
    const content = `# RBAC\n- permission: workflow:read`;
    const requirements = extractRequirementsFromMarkdownContent(content);
    expect(requirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "permission",
          name: "workflow:read",
        }),
      ]),
    );
  });

  it("harus mengembalikan array kosong jika tidak ada requirement", () => {
    // Simulasi markdown tanpa requirement
    const content = `# Tidak ada requirement`;
    const requirements = extractRequirementsFromMarkdownContent(content);
    // Tidak ada permission/bullet, hanya heading
    expect(requirements).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "permission" }),
        expect.objectContaining({ type: "bullet" }),
      ]),
    );
  });
});

describe("fuzzyMatch", () => {
  it("harus true untuk string mirip", () => {
    expect(fuzzyMatch("workflow:read", "workflow:read")).toBe(true);
    expect(fuzzyMatch("workflow:read", "workflow:reed")).toBe(true);
    expect(fuzzyMatch("workflow:read", "workflow:lead")).toBe(true);
    expect(fuzzyMatch("workflow:read", "workflow:write")).toBe(false);
  });
});

describe("detectRouteInSource", () => {
  it("harus true jika route ada di source", () => {
    const source = 'app.get("/api/data", handler)';
    expect(detectRouteInSource(source, "/api/data")).toBe(true);
  });
  it("harus false jika route tidak ada di source", () => {
    const source = 'app.get("/api/info", handler)';
    expect(detectRouteInSource(source, "/api/data")).toBe(false);
  });
});

describe("parseMarkdownTables", () => {
  it("harus mengekstrak tabel dari markdown", () => {
    const content = `| Field | Tipe Data | Mandatory |\n| --- | --- | --- |\n| id_layanan | UUID | Y |\n| kode_layanan | VARCHAR(12) | Y |`;
    const tables = parseMarkdownTables(content);
    expect(tables.length).toBe(1);
    expect(tables[0].headers).toEqual(["Field", "Tipe Data", "Mandatory"]);
    expect(tables[0].rows).toEqual([
      ["id_layanan", "UUID", "Y"],
      ["kode_layanan", "VARCHAR(12)", "Y"],
    ]);
  });
});
describe("extractRequirementsFromMarkdownContent - heading & bullet", () => {
  it("harus mengekstrak heading dan bullet dari markdown", () => {
    const content = `\n## Modul Layanan\n\n- id_layanan harus unik\n* kode_layanan wajib diisi\n+ status_layanan harus valid\n### Submodul\n- submodul_1\n`;
    const requirements = extractRequirementsFromMarkdownContent(content);
    // Heading
    expect(requirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "heading",
          level: 2,
          text: "Modul Layanan",
        }),
        expect.objectContaining({
          type: "heading",
          level: 3,
          text: "Submodul",
        }),
      ]),
    );
    // Bullet
    expect(requirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "bullet",
          text: "id_layanan harus unik",
        }),
        expect.objectContaining({
          type: "bullet",
          text: "kode_layanan wajib diisi",
        }),
        expect.objectContaining({
          type: "bullet",
          text: "status_layanan harus valid",
        }),
        expect.objectContaining({ type: "bullet", text: "submodul_1" }),
      ]),
    );
  });
});
