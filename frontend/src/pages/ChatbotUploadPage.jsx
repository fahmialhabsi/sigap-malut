import React, { useState } from "react";
import axios from "axios";

export default function ChatbotUploadPage() {
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [metadata, setMetadata] = useState({ pengirim: "", tanggal: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (fileName) {
        // Kirim file asli jika ada file
        formData.append("file", document.getElementById("fileInput").files[0]);
      } else {
        // Jika tidak ada file, kirim isi manual
        formData.append("textContent", fileContent);
      }
      formData.append("pengirim", metadata.pengirim);
      formData.append("tanggal", metadata.tanggal);
      const res = await axios.post("/api/chatbot/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.result);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  // Handler upload file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    // Tidak perlu baca file di frontend, biarkan backend yang ekstrak
    setFileContent("");
  };

  const handleReset = () => {
    setFileContent("");
    setFileName("");
    setMetadata({ pengirim: "", tanggal: "" });
    setResult(null);
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 border rounded bg-white shadow">
      <h2 className="text-lg font-bold mb-4">AI Chatbot Routing Dokumen</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-semibold">
          Upload Dokumen (txt/pdf/docx):
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          className="mb-2"
          onChange={handleFileUpload}
        />
        {fileName && (
          <div className="text-xs mb-2 text-gray-500">File: {fileName}</div>
        )}
        <textarea
          className="w-full border p-2 mb-2"
          rows={6}
          placeholder="Isi dokumen/surat..."
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          disabled={!!fileName}
          required={!fileName}
        />
        <input
          className="w-full border p-2 mb-2"
          type="text"
          placeholder="Nama Pengirim"
          value={metadata.pengirim}
          onChange={(e) =>
            setMetadata({ ...metadata, pengirim: e.target.value })
          }
        />
        <input
          className="w-full border p-2 mb-2"
          type="date"
          value={metadata.tanggal}
          onChange={(e) =>
            setMetadata({ ...metadata, tanggal: e.target.value })
          }
        />
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Kirim ke AI Chatbot"}
          </button>
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            type="button"
            onClick={handleReset}
            disabled={loading}
          >
            Batal
          </button>
        </div>
      </form>
      {result && (
        <div className="mt-4 p-3 border bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Hasil Routing:</h3>
          {result.error ? (
            <div className="text-red-600">Error: {result.error}</div>
          ) : (
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
