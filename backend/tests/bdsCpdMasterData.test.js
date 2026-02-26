import { expect } from "chai";
import BDSCPD from "../models/BDS-CPD.js";
import Komoditas from "../models/komoditas.js";

describe("BDS-CPD Master Data", () => {
  it("loads BDS-CPD model", async () => {
    expect(BDSCPD).to.be.ok;
  });
});
