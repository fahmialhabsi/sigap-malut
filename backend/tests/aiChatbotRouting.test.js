// tests/aiChatbotRouting.test.js
import { expect } from "chai";
import chatbotService from "../services/chatbotService.js";

describe("AI Chatbot Routing", () => {
  it("should classify and auto-route user input correctly", async () => {
    const input = "Bagaimana cara mengajukan SPJ?";
    const result = await chatbotService.classifyAndRoute(input);
    expect(result).to.have.property("route");
    expect(result.route).to.be.a("string");
    expect(result).to.have.property("classification");
  });
});