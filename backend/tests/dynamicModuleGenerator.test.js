import { expect } from "chai";
import generateModule from "../scripts/generateModule.js";

describe("Dynamic Module Generator", () => {
  it("should generate module with correct fields, permissions, and relations", async () => {
    const config = {
      name: "TestModule",
      fields: ["field1", "field2"],
      permissions: ["read", "write"],
      relations: [{ target: "User", type: "fk" }],
    };
    const result = await generateModule(config);
    expect(result.success).to.be.true;
    expect(result.module.name).to.equal("TestModule");
    expect(result.module.fields).to.include("field1");
    expect(result.module.permissions).to.include("read");
    expect(result.module.relations[0].target).to.equal("User");
  });
});
