import { getOpenAIClient, aiPrompts, trackUsage } from "../config/openai.js";

class AIService {
  constructor() {
    this.client = getOpenAIClient();
  }

  // Check if AI is available
  isAvailable() {
    return this.client !== null;
  }

  // Generic completion
  async complete(prompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error("AI service is not enabled");
    }

    try {
      const response = await this.client.chat.completions.create({
        model: options.model || "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "Anda adalah asisten AI untuk Dinas Pangan Maluku Utara. Berikan analisis dan rekomendasi yang akurat, praktis, dan berbasis data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      });

      const result = response.choices[0].message.content;
      const tokens = response.usage.total_tokens;

      trackUsage(tokens, options.model || "gpt-4");

      return {
        success: true,
        result,
        tokens,
        model: options.model || "gpt-4",
      };
    } catch (error) {
      console.error("AI Service Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Analyze data pangan
  async analyzeDataPangan(data) {
    const prompt = aiPrompts.analyzeDataPangan(data);
    return await this.complete(prompt);
  }

  // Recommend policy
  async recommendPolicy(context) {
    const prompt = aiPrompts.recommendPolicy(context);
    return await this.complete(prompt);
  }

  // Predict kerawanan
  async predictKerawanan(historicalData) {
    const prompt = aiPrompts.predictKerawanan(historicalData);
    return await this.complete(prompt);
  }

  // Analyze price & inflation
  async analyzePriceInflation(priceData) {
    const prompt = aiPrompts.analyzePriceInflation(priceData);
    return await this.complete(prompt);
  }

  // Generate report
  async generateReport(data, reportType) {
    const prompt = aiPrompts.generateReport(data, reportType);
    return await this.complete(prompt, { maxTokens: 3000 });
  }

  // Chatbot conversation
  async chat(message, conversationHistory = []) {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: "AI chatbot tidak tersedia",
      };
    }

    try {
      const messages = [
        {
          role: "system",
          content:
            "Anda adalah chatbot untuk Dinas Pangan Maluku Utara. Bantu user dengan pertanyaan terkait ketahanan pangan, data, dan sistem SIGAP Malut.",
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: message,
        },
      ];

      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo", // Use cheaper model for chatbot
        messages,
        temperature: 0.8,
        max_tokens: 500,
      });

      const reply = response.choices[0].message.content;
      const tokens = response.usage.total_tokens;

      trackUsage(tokens, "gpt-3.5-turbo");

      return {
        success: true,
        reply,
        tokens,
      };
    } catch (error) {
      console.error("Chatbot Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Auto-classify surat
  async classifySurat(suratContent) {
    const prompt = `
Klasifikasikan surat berikut:
"${suratContent}"

Berikan dalam format JSON:
{
  "jenis_naskah": "Surat Masuk/Surat Keluar/SK/dll",
  "kategori": "Urgent/Penting/Biasa",
  "topik": "ringkasan topik",
  "tindakan_yang_disarankan": "apa yang harus dilakukan"
}
`;

    const result = await this.complete(prompt, { maxTokens: 300 });

    if (result.success) {
      try {
        // Extract JSON from response
        const jsonMatch = result.result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return {
            success: true,
            classification: JSON.parse(jsonMatch[0]),
          };
        }
      } catch (e) {
        console.error("Failed to parse AI classification:", e);
      }
    }

    return result;
  }
}

export default new AIService();
