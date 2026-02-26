import { expect } from "chai";
import BDSMON from "../models/BDS-MON.js";
import Komoditas from "../models/komoditas.js";

describe("BDS-MON Master Data", () => {
  it("loads BDS-MON model", async () => {
    expect(BDSMON).to.be.ok;
  });
});
