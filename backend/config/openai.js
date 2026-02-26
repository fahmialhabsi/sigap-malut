import OpenAI from "openai";

// OpenAI Configuration
export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  model: process.env.OPENAI_MODEL || "gpt-4",
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
  enabled: process.env.OPENAI_ENABLED === "true" || false,
};

// Initialize OpenAI client (lazy loading)
let openaiClient = null;

export const getOpenAIClient = () => {
  if (!openaiConfig.enabled) {
    console.warn(
      "OpenAI is disabled. Set OPENAI_ENABLED=true in .env to enable.",
    );
    return null;
  }

  if (!openaiConfig.apiKey) {
    console.warn("OpenAI API key not found. Set OPENAI_API_KEY in .env");
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: openaiConfig.apiKey,
      organization: openaiConfig.organization,
    });
  }

  return openaiClient;
};

// AI Prompts for SIGAP Malut
export const aiPrompts = {
  // Analisis data pangan
  analyzeDataPangan: (data) => `
Anda adalah asisten AI untuk Dinas Pangan Maluku Utara.
Analisis data berikut dan berikan insight:

Data: ${JSON.stringify(data, null, 2)}

Berikan analisis dalam format:
1. Ringkasan situasi
2. Temuan penting
3. Rekomendasi aksi
4. Alert/peringatan (jika ada)
`,

  // Rekomendasi kebijakan
  recommendPolicy: (context) => `
Berdasarkan data ketahanan pangan berikut:
${context}

Berikan rekomendasi kebijakan yang:
1. Sesuai dengan kondisi Maluku Utara
2. Actionable dan praktis
3. Berbasis data
4. Mempertimbangkan aspek sosial-ekonomi
`,

  // Prediksi kerawanan pangan
  predictKerawanan: (historicalData) => `
Berdasarkan data historis:
${JSON.stringify(historicalData, null, 2)}

Prediksi tingkat kerawanan pangan untuk 3 bulan ke depan.
Berikan:
1. Skor prediksi (1-5)
2. Wilayah yang perlu perhatian khusus
3. Faktor penyebab
4. Intervensi yang disarankan
`,

  // Analisis harga
  analyzePriceInflation: (priceData) => `
Analisis data harga pangan berikut:
${JSON.stringify(priceData, null, 2)}

Berikan:
1. Tren harga per komoditas
2. Kontribusi inflasi
3. Komoditas yang perlu stabilisasi
4. Rekomendasi operasi pasar
`,

  // Generate laporan
  generateReport: (data, reportType) => `
Generate laporan ${reportType} berbasis data:
${JSON.stringify(data, null, 2)}

Format laporan:
1. Executive Summary
2. Data & Analisis
3. Kesimpulan
4. Rekomendasi

Gunakan bahasa Indonesia formal untuk laporan pemerintahan.
`,
};

// AI Features configuration
export const aiFeatures = {
  dataAnalysis: {
    enabled: true,
    modules: ["BKT-KRW", "BDS-HRG", "BKT-PGD"],
  },
  policyRecommendation: {
    enabled: true,
    modules: ["BKT-KBJ", "BDS-KBJ", "BKS-KBJ"],
  },
  reportGeneration: {
    enabled: true,
    modules: ["*"], // All modules
  },
  chatbot: {
    enabled: true,
    context: "Dinas Pangan Maluku Utara",
    maxHistory: 10,
  },
  autoClassification: {
    enabled: true,
    modules: ["SEK-ADM"], // Auto classify surat masuk
  },
};

// Cost tracking
export const trackUsage = (tokens, model) => {
  const costs = {
    "gpt-4": { input: 0.03, output: 0.06 }, // per 1K tokens
    "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
  };

  const modelCost = costs[model] || costs["gpt-3.5-turbo"];
  const estimatedCost = (tokens / 1000) * modelCost.input;

  console.log(`AI Usage: ${tokens} tokens, ~$${estimatedCost.toFixed(4)}`);

  // TODO: Save to database for cost tracking
  return estimatedCost;
};

export default {
  openaiConfig,
  getOpenAIClient,
  aiPrompts,
  aiFeatures,
  trackUsage,
};
