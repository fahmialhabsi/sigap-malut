// Mock chatbotService.js
export async function classifyAndRoute(input) {
  // Simulasi klasifikasi dan routing
  return {
    route: "SPJ",
    classification: "keuangan",
    input,
  };
}

export default { classifyAndRoute };
