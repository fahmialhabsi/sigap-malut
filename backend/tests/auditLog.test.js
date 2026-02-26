import { expect } from "chai";
import { randomUUID } from "crypto";
import AuditLog from "../models/auditLog.js";

describe("Audit Log", () => {
  it("should append new log entry", async () => {
    const before = await AuditLog.count();
    await AuditLog.create({
      modul: "testModul",
      entitas_id: randomUUID(),
      aksi: "CREATE",
      pegawai_id: randomUUID(),
      data_lama: {},
      data_baru: {},
    });
    const after = await AuditLog.count();
    expect(after).to.equal(before + 1);
  });

  it("should not allow modification of existing log", async () => {
    const entry = await AuditLog.create({
      modul: "testModul",
      entitas_id: randomUUID(),
      aksi: "CREATE",
      pegawai_id: randomUUID(),
      data_lama: {},
      data_baru: {},
    });
    try {
      entry.aksi = "changed";
      await entry.save();
      throw new Error("Should not allow modification");
    } catch (err) {
      expect(err.message).to.match(/immutable|readonly/i);
    }
  });
});
