import { expect } from "chai";
import { sequelize } from "../config/database.js";
const User = sequelize.models.User;

describe("Soft Delete Behavior", () => {
  it("should set deleted_at instead of removing record", async () => {
    const uniq = Date.now();
    const user = await User.create({
      username: `softdelete${uniq}`,
      password: "password123",
      name: "SoftDelete",
      unit_id: "Sekretariat",
      email: `soft${uniq}@delete.com`,
      role_id: "pelaksana",
      jabatan: "Staff",
    });
    console.log(
      "DEBUG: created user instance, softDelete type =",
      typeof user.softDelete,
    );
    const updated = await user.softDelete();
    expect(updated.deleted_at).to.not.be.null;
  });
});
