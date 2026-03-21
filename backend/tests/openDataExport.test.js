import { expect } from "chai";
import reportingService from "../services/reportingService.js";

describe("Open Data & Export", () => {
  it("should export data to PDF/Excel and validate public access", async () => {
    const pdf = await reportingService.exportPDF();
    const excel = await reportingService.exportExcel();
    expect(pdf).to.have.property("buffer");
    expect(excel).to.have.property("buffer");
    // Cek akses publik
    const access = await reportingService.validatePublicAccess();
    expect(access).to.be.true;
  });
});