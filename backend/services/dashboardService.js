// Mock dashboardService.js
export async function getAggregatedData() {
  // Simulasi data agregasi real-time
  return [
    { id: 1, value: 100, updated_at: new Date() },
    { id: 2, value: 200, updated_at: new Date() },
  ];
}

export default { getAggregatedData };
