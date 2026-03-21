import { useEffect, useState } from "react";
import { fetchPegawaiMaster } from "../../api/masterData";
export default function FormSPJ() {
  const [pegawai, setPegawai] = useState([]);
  useEffect(() => {
    fetchPegawaiMaster().then((d) => setPegawai(d));
  }, []);
  // PATCH: hanya bisa pilih dari master!
  return (
    <select name="bendahara_id" required>
      <option value="">Pilih Bendahara...</option>
      {pegawai.map((peg) => (
        <option key={peg.id} value={peg.id}>
          {peg.nama_lengkap} - {peg.nip}
        </option>
      ))}
    </select>
  );
}
