// Fuzzy match: Levenshtein distance sederhana
export function fuzzyMatch(a: string, b: string, threshold = 2): boolean {
  if (a === b) return true;
  // Levenshtein distance
  const matrix = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length] <= threshold;
}

// Detect route in source code (regex sederhana)
export function detectRouteInSource(source: string, route: string): boolean {
  // Contoh: route '/api/data' akan dicari di source
  const regex = new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return regex.test(source);
}
// scripts/matcher.ts
export function extractRequirementsFromMarkdownContent(content: string): any[] {
  const requirements: any[] = [];
  // Contoh: deteksi permission workflow:read
  if (content.match(/workflow:read/)) {
    requirements.push({
      type: "permission",
      name: "workflow:read",
    });
  }
  return requirements;
}
