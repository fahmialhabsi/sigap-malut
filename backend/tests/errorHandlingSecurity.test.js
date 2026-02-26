import { expect } from "chai";
import { validateInput, generateJWT, checkRBAC } from "../middleware/auth.js";

describe("Error Handling & Security", () => {
  it("should reject invalid input and protect endpoint dengan JWT/RBAC", async () => {
    let error = null;
    try {
      await validateInput({ username: "", password: "" });
    } catch (e) {
      error = e;
    }
    expect(error).to.not.be.null;
    // Cek proteksi endpoint
    const token = await generateJWT({ id: 1, role: "admin" });
    const access = await checkRBAC(token, "admin");
    expect(access).to.be.true;
  });
});
