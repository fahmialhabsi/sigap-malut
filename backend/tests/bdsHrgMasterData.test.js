import { expect } from "chai";
import BDSHRG from "../models/BDS-HRG.js";
import Komoditas from "../models/komoditas.js";

describe("BDS-HRG Master Data", () => {
  it("loads BDS-HRG model", async () => {
    expect(BDSHRG).to.be.ok;
  });
});
