import { expect } from "chai";
import User from "../models/User.js";

describe("Soft Delete Behavior", () => {
  it("should set deleted_at instead of removing record", async () => {
    const uniq = Date.now();
    const user = await User.create({
      username: `softdelete${uniq}`,
      name: "SoftDelete",
      password: "password123",
      unit_id: "unit-1",
      role_id: "pelaksana",
      nama_lengkap: "Soft Delete",
      unit_kerja: "Sekretariat",
      email: `soft${uniq}@delete.com`,
      jabatan: "Staff",
    });
    await user.destroy();
    const found = await User.findByPk(user.id, { paranoid: false });
    expect(found.deleted_at).to.not.be.null;
  });
});
