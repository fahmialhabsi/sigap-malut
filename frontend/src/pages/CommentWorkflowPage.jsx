import React, { useEffect } from "react";
import { getAllCommentsAPI } from "../services/commentService";
import api from "../services/apiClient";

export default function CommentWorkflowPage() {
  const [comments, setComments] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await getAllCommentsAPI();
      setComments((res.data || []).slice().reverse());
    } catch {
      setComments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Kolaborasi & Komentar</h2>
        <button
          className="bg-red-100 text-red-700 px-4 py-2 rounded font-semibold shadow"
          onClick={async () => {
            setLoading(true);
            try {
              await api.delete("/comment");
              setComments([]);
            } catch {}
            setLoading(false);
          }}
        >
          Hapus Semua
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Memuat data komentar...</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Waktu</th>
                <th className="border px-2 py-1">User</th>
                <th className="border px-2 py-1">Modul</th>
                <th className="border px-2 py-1">Data ID</th>
                <th className="border px-2 py-1">Komentar</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    Tidak ada komentar.
                  </td>
                </tr>
              ) : (
                comments.map((c, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {c.time}
                    </td>
                    <td className="border px-2 py-1">{c.user}</td>
                    <td className="border px-2 py-1">{c.modulId}</td>
                    <td className="border px-2 py-1">{c.dataId}</td>
                    <td className="border px-2 py-1">{c.komentar}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
