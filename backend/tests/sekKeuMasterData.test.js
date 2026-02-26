import { expect } from "chai";
import SekKeu from "../models/SEK-KEU.js";
import User from "../models/User.js";

describe("SekKeu Master Data", () => {
  it("loads SekKeu model", async () => {
    expect(SekKeu).to.be.ok;
  });
});
