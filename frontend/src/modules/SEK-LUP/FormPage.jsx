import React, { useState } from "react";
import { createItem, updateItem } from "./api";
import FormField from "../../components/FormField";
import PageLayout from "../../components/PageLayout";
import { useNavigate } from "react-router-dom";

const fields = [{"11":"11","umkm_tersertifikasi":"industri_pangan_terdaftar","UMKM Tersertifikasi":"Industri Pangan Terdaftar","int":"int","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Jumlah industri pangan"},{"11":"11","umkm_tersertifikasi":"temuan_pangan_tidak_layak","UMKM Tersertifikasi":"Temuan Pangan Tidak Layak","int":"int","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Pangan tidak layak konsumsi"},{"11":"NULL","umkm_tersertifikasi":"tindakan_pengawasan","UMKM Tersertifikasi":"Tindakan Pengawasan","int":"text","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Tindakan yang dilakukan"},{"11":"NULL","umkm_tersertifikasi":"kendala_laboratorium","UMKM Tersertifikasi":"Kendala Laboratorium","int":"text","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Kendala operasional lab"},{"11":"NULL","umkm_tersertifikasi":"kebutuhan_reagen","UMKM Tersertifikasi":"Kebutuhan Reagen","int":"text","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Kebutuhan bahan kimia"},{"11":"NULL","umkm_tersertifikasi":"kebutuhan_alat","UMKM Tersertifikasi":"Kebutuhan Alat","int":"text","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Kebutuhan peralatan lab"},{"11":"NULL","umkm_tersertifikasi":"analisis","UMKM Tersertifikasi":"Analisis","int":"text","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Analisis kinerja UPTD"},{"11":"NULL","umkm_tersertifikasi":"rekomendasi","UMKM Tersertifikasi":"Rekomendasi","int":"text","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Rekomendasi perbaikan"},{"11":"255","umkm_tersertifikasi":"sumber_data","UMKM Tersertifikasi":"Sumber Data","int":"varchar","false":"false","false_1":"false","NULL":"UPTD Balai Pengawasan Mutu","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Dari UPTD"},{"11":"255","umkm_tersertifikasi":"file_laporan","UMKM Tersertifikasi":"File Laporan","int":"varchar","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Upload laporan PDF"},{"11":"NULL","umkm_tersertifikasi":"file_data_pendukung","UMKM Tersertifikasi":"File Data Pendukung","int":"json","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Array file pendukung"},{"11":"255","umkm_tersertifikasi":"penanggung_jawab","UMKM Tersertifikasi":"Penanggung Jawab","int":"varchar","false":"true","false_1":"false","NULL":"Sekretaris","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"PIC"},{"11":"255","umkm_tersertifikasi":"pelaksana","UMKM Tersertifikasi":"Pelaksana","int":"varchar","false":"true","false_1":"false","NULL":"UPTD","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Yang menyusun"},{"11":"NULL","umkm_tersertifikasi":"is_sensitive","UMKM Tersertifikasi":"Tingkat Sensitivitas","int":"enum","false":"true","false_1":"false","NULL":"Sensitif","none":"none","NULL_1":"Biasa,Sensitif","Jumlah UMKM dapat sertifikat":"Data uji lab sensitif"},{"11":"NULL","umkm_tersertifikasi":"status","UMKM Tersertifikasi":"Status","int":"enum","false":"true","false_1":"false","NULL":"draft","none":"none","NULL_1":"draft,review,final","Jumlah UMKM dapat sertifikat":"Status"},{"11":"NULL","umkm_tersertifikasi":"keterangan","UMKM Tersertifikasi":"Keterangan","int":"text","false":"false","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"Catatan"},{"11":"11","umkm_tersertifikasi":"created_by","UMKM Tersertifikasi":"Dibuat Oleh","int":"int","false":"true","false_1":"false","NULL":"NULL","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":"User ID"},{"11":"NULL","umkm_tersertifikasi":"created_at","UMKM Tersertifikasi":"Dibuat Pada","int":"timestamp","false":"true","false_1":"false","NULL":"CURRENT_TIMESTAMP","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":""},{"11":"NULL","umkm_tersertifikasi":"updated_at","UMKM Tersertifikasi":"Diperbarui Pada","int":"timestamp","false":"true","false_1":"false","NULL":"CURRENT_TIMESTAMP","none":"none","NULL_1":"NULL","Jumlah UMKM dapat sertifikat":""}];

export default function FormPage({ isEdit, initialData = {} }) {
  const [form, setForm] = useState(initialData);
  const navigate = useNavigate();
  function handleChange(e) {
    const { name, value, type, files } = e.target;
    setForm(f => ({ ...f, [name]: type === "file" ? files[0] : value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    const action = isEdit ? updateItem : createItem;
    action(form.id, form).then(() => navigate("/" + "sek-lup"));
  }
  return (
    <PageLayout>
      <h1>{isEdit ? "Edit" : "Tambah"} SEK-LUP</h1>
      <form onSubmit={handleSubmit}>
        {fields.map(field => (
          <div key={field.name}>
            <label>{field.label}</label>
            <FormField field={field} value={form[field.name] || ""} onChange={handleChange} />
          </div>
        ))}
        <button type="submit">Simpan</button>
      </form>
    </PageLayout>
  );
}
