import express from "express";
import multer from "multer";

import { handleChatbotUpload } from "../services/aiService.js";

const router = express.Router();
const upload = multer();

// Endpoint untuk upload dokumen/surat ke AI Chatbot
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    let textContent = req.body.textContent || "";
    if (req.file) {
      // Jika file PDF, ekstrak isi PDF
      if (req.file.mimetype === "application/pdf") {
        let pdfParse;
        try {
          pdfParse = (await import("pdf-parse")).default || (await import("pdf-parse"));
        } catch (e) {
          throw new Error("pdf-parse module not found");
        }
        const data = await pdfParse(req.file.buffer);
        textContent = data.text;
      } else {
        // Untuk txt/docx, baca buffer sebagai string (sederhana)
        textContent = req.file.buffer.toString();
      }
    }
    const metadata = {
      pengirim: req.body.pengirim,
      tanggal: req.body.tanggal,
    };
    // Proses dokumen dengan AI
    const result = await handleChatbotUpload(textContent, metadata);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
