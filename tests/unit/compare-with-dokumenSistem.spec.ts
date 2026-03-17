import { extractRequirementsFromMarkdown } from "../../scripts/compare-with-dokumenSistem";
import fs from "fs";
import path from "path";

describe("extractRequirementsFromMarkdown", () => {
  it("harus mendeteksi permission workflow:read dari markdown", () => {
    const mdPath = path.join(
      __dirname,
      "../fixtures/requirement-workflow-read.md",
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
    const mdPath = path.join(__dirname, "../fixtures/empty.md");
    const requirements = extractRequirementsFromMarkdown(mdPath);
    expect(requirements).toEqual([]);
  });
});
