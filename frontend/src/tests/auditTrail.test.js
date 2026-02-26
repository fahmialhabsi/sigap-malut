import {
  logAuditTrail,
  getAuditTrail,
  clearAuditTrail,
} from "../utils/auditTrail";

describe("auditTrail utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("logAuditTrail menyimpan entry ke localStorage", () => {
    logAuditTrail({
      user: { username: "tester", role: "admin" },
      action: "login",
      detail: "User login",
    });
    const logs = JSON.parse(localStorage.getItem("auditTrail"));
    expect(logs.length).toBe(1);
    expect(logs[0].user).toBe("tester");
    expect(logs[0].action).toBe("login");
  });

  test("getAuditTrail mengembalikan data yang benar", () => {
    logAuditTrail({
      user: { username: "tester", role: "admin" },
      action: "login",
      detail: "User login",
    });
    const logs = getAuditTrail();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs[0].user).toBe("tester");
  });

  test("clearAuditTrail menghapus auditTrail dari localStorage", () => {
    logAuditTrail({
      user: { username: "tester", role: "admin" },
      action: "login",
      detail: "User login",
    });
    clearAuditTrail();
    expect(localStorage.getItem("auditTrail")).toBe(null);
  });
});
