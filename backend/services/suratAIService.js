import axios from "axios";
import SuratMasuk from "../models/SuratMasuk.js";

export const processWithAI = async (suratId, filePath) => {
  try {
    // Update ai_status ke 'processing'
    await SuratMasuk.update({ ai_status: "processing" }, { where: { id: suratId } });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY tidak dikonfigurasi");
    }

    const prompt = `Anda adalah asisten pengolahan surat untuk Dinas Ketahanan Pangan Provinsi Maluku Utara (SIGAP-MALUT).
Analisis surat berikut dan ekstrak informasi penting dalam format JSON.

Path file: ${filePath}

Kembalikan JSON dengan struktur berikut:
{
  "nomor_surat": "nomor surat jika ada",
  "tanggal_surat": "YYYY-MM-DD jika ada",
  "asal_surat": "nama instansi/pengirim",
  "perihal": "perihal/subjek surat",
  "isi_ringkas": "ringkasan isi surat maksimal 200 kata",
  "jenis_surat": "Biasa|Penting|Rahasia|Sangat Rahasia",
  "sifat_surat": "Segera|Biasa|Sangat Segera",
  "routing_target": "unit tujuan yang direkomendasikan (Sekretariat/Bidang Ketersediaan/Bidang Distribusi/Bidang Konsumsi/UPTD)",
  "kode_klasifikasi": "kode arsip berdasarkan Perka ANRI No.19/2012",
  "urgency": "rendah|normal|tinggi",
  "confidence": 0.95
}`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah asisten AI untuk sistem manajemen surat pemerintahan SIGAP-MALUT. Selalu kembalikan respons dalam format JSON yang valid.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    const content = response.data.choices[0].message.content;
    let aiResult;
    try {
      // Coba parse JSON dari respons
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      aiResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      throw new Error("Gagal mem-parse respons JSON dari AI");
    }

    // Update record surat_masuk dengan hasil AI
    await SuratMasuk.update(
      {
        ai_status: "done",
        nomor_surat: aiResult.nomor_surat || null,
        tanggal_surat: aiResult.tanggal_surat || null,
        asal_surat: aiResult.asal_surat || null,
        perihal: aiResult.perihal || null,
        isi_ringkas: aiResult.isi_ringkas || null,
        jenis_surat: aiResult.jenis_surat || "Biasa",
        sifat_surat: aiResult.sifat_surat || "Biasa",
        ai_klasifikasi: aiResult.kode_klasifikasi || null,
        ai_routing: aiResult.routing_target || null,
        ai_confidence: aiResult.confidence || null,
        ai_ekstrak_data: aiResult,
      },
      { where: { id: suratId } },
    );
  } catch (error) {
    console.error(`[suratAIService] Error processing surat ${suratId}:`, error.message);
    await SuratMasuk.update(
      { ai_status: "failed" },
      { where: { id: suratId } },
    ).catch((updateErr) =>
      console.error("[suratAIService] Failed to update ai_status to failed:", updateErr.message),
    );
  }
};
