import {
  extractRequirementsFromMarkdownContent,
  fuzzyMatch,
  detectRouteInSource,
} from "../../scripts/matcher";
import fs from "fs";
import path from "path";

describe("extractRequirementsFromMarkdownContent", () => {
  it("harus mendeteksi permission workflow:read dari markdown", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../fixtures/requirement-workflow-read.md"),
      "utf8",
    );
    const requirements = extractRequirementsFromMarkdownContent(content);
    expect(requirements).toEqual([
      expect.objectContaining({
        type: "permission",
        name: "workflow:read",
      }),
    ]);
  });

  it("harus mengembalikan array kosong jika tidak ada requirement", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../fixtures/empty.md"),
      "utf8",
    );
    const requirements = extractRequirementsFromMarkdownContent(content);
    expect(requirements).toEqual([]);
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
