import { expect } from "chai";
import User from "../models/User.js";

describe("Soft Delete Behavior", () => {
  it("should set deleted_at instead of removing record", async () => {
    const uniq = Date.now();
    const user = await User.create({
      username: `softdelete${uniq}`,
      password: "password123",
      nama_lengkap: "SoftDelete",
      unit_kerja: "Sekretariat",
      email: `soft${uniq}@delete.com`,
      role: "pelaksana",
      jabatan: "Staff",
    });
    await user.softDelete();
    const found = await User.findByPk(user.id, { paranoid: false });
    expect(found.deleted_at).to.not.be.null;
  });
});
