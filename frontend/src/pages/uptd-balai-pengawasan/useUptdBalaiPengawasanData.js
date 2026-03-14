import { useEffect, useState } from "react";
import axios from "axios";

export default function useUptdBalaiPengawasanData() {
  const [summary, setSummary] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get("/api/uptd-balai-pengawasan/summary"),
      axios.get("/api/uptd-balai-pengawasan/latest"),
    ])
      .then(([summaryRes, latestRes]) => {
        setSummary(summaryRes.data?.data || []);
        setLatest(latestRes.data?.data || []);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { summary, latest, loading, error };
}
