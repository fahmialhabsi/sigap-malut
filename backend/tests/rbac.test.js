import { expect } from "chai";
import { authorize } from "../middleware/roleCheck.js";

describe("RBAC Enforcement", () => {
  it("should allow access for permitted role", (done) => {
    const req = { user: { role: "admin" } };
    const res = {};
    authorize("admin")(req, res, () => {
      expect(true).to.be.true;
      done();
    });
  });

  it("should deny access for non-permitted role", (done) => {
    const req = { user: { role: "user" } };
    const res = {
      status: (code) => {
        expect(code).to.equal(403);
        return { json: () => done() };
      },
    };
    authorize("admin")(req, res, () => {
      done(new Error("Should not call next for forbidden"));
    });
  });
});
