import fs from "fs";
import path from "path";
import * as compare from "../../scripts/compare-with-dokumenSistem";
const { extractRequirementsFromMarkdown } = compare;

describe("extractRequirementsFromMarkdown", () => {
  it("harus mendeteksi permission workflow:read dari markdown", () => {
    const mdPath = path.resolve(
      process.cwd(),
      "tests/unit/fixtures/requirement-workflow-read.md",
    );
    const requirements = extractRequirementsFromMarkdown(mdPath);
    expect(requirements).toEqual([
      expect.objectContaining({
        type: "permission",
        name: "workflow:read",
      }),
    ]);
  });

  it("harus mengembalikan array kosong jika tidak ada requirement", () => {
    const mdPath = path.resolve(process.cwd(), "tests/unit/fixtures/empty.md");
    const requirements = extractRequirementsFromMarkdown(mdPath);
    expect(requirements).toEqual([]);
  });
});
