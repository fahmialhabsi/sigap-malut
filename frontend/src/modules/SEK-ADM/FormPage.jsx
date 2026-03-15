import React, { useState } from "react";
import { createItem, updateItem } from "./api";
import FormField from "../../components/FormField";
import PageLayout from "../../components/PageLayout";
import { useNavigate } from "react-router-dom";

const fields = [{"field_name":"id","field_label":"ID","field_type":"auto_increment","field_length":"11","is_required":"true","is_unique":"true","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Primary Key"},{"field_name":"unit_kerja","field_label":"Unit Kerja","field_type":"enum","field_length":"NULL","is_required":"true","is_unique":"false","default_value":"Sekretariat","validation":"none","dropdown_options":"Sekretariat,UPTD,Bidang Ketersediaan,Bidang Distribusi,Bidang Konsumsi","help_text":"Unit yang mengelola surat (BARU - untuk integrasi multi-unit)"},{"field_name":"layanan_id","field_label":"Layanan","field_type":"varchar","field_length":"10","is_required":"true","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"FK ke layanan_menpanrb (LY001-LY006)"},{"field_name":"nomor_surat","field_label":"Nomor Surat","field_type":"varchar","field_length":"100","is_required":"false","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Nomor surat/dokumen"},{"field_name":"jenis_naskah","field_label":"Jenis Naskah","field_type":"enum","field_length":"NULL","is_required":"false","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"Surat Masuk,Surat Keluar,SK,SE,ST,SU,ND,MEMO,BA,Nota Dinas,Lainnya","help_text":"Jenis naskah dinas"},{"field_name":"tanggal_surat","field_label":"Tanggal Surat","field_type":"date","field_length":"NULL","is_required":"true","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Tanggal surat dibuat"},{"field_name":"pengirim_penerima","field_label":"Pengirim/Penerima","field_type":"varchar","field_length":"255","is_required":"false","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Dari atau kepada siapa"},{"field_name":"perihal","field_label":"Perihal","field_type":"text","field_length":"NULL","is_required":"true","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Perihal/subjek surat"},{"field_name":"isi_ringkas","field_label":"Isi Ringkas","field_type":"text","field_length":"NULL","is_required":"false","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Ringkasan isi surat"},{"field_name":"disposisi","field_label":"Disposisi","field_type":"text","field_length":"NULL","is_required":"false","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Instruksi disposisi pimpinan"},{"field_name":"ditujukan_kepada","field_label":"Ditujukan Kepada","field_type":"varchar","field_length":"255","is_required":"false","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Unit/bidang tujuan"},{"field_name":"file_surat","field_label":"File Surat","field_type":"varchar","field_length":"255","is_required":"false","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Upload file PDF/scan"},{"field_name":"file_lampiran","field_label":"File Lampiran","field_type":"json","field_length":"NULL","is_required":"false","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Array path file lampiran"},{"field_name":"arsip_code","field_label":"Kode Arsip","field_type":"varchar","field_length":"50","is_required":"false","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Kode klasifikasi arsip"},{"field_name":"is_rahasia","field_label":"Rahasia","field_type":"boolean","field_length":"NULL","is_required":"true","is_unique":"false","default_value":"0","validation":"none","dropdown_options":"NULL","help_text":"Surat rahasia atau tidak"},{"field_name":"penanggung_jawab","field_label":"Penanggung Jawab","field_type":"varchar","field_length":"255","is_required":"true","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"PIC layanan"},{"field_name":"pelaksana","field_label":"Pelaksana","field_type":"varchar","field_length":"255","is_required":"true","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Yang melaksanakan"},{"field_name":"is_sensitive","field_label":"Tingkat Sensitivitas","field_type":"enum","field_length":"NULL","is_required":"true","is_unique":"false","default_value":"Biasa","validation":"none","dropdown_options":"Biasa,Sensitif","help_text":"Klasifikasi data"},{"field_name":"status","field_label":"Status","field_type":"enum","field_length":"NULL","is_required":"true","is_unique":"false","default_value":"pending","validation":"none","dropdown_options":"pending,proses,selesai,arsip","help_text":"Status proses"},{"field_name":"keterangan","field_label":"Keterangan","field_type":"text","field_length":"NULL","is_required":"false","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"Catatan tambahan"},{"field_name":"created_by","field_label":"Dibuat Oleh","field_type":"int","field_length":"11","is_required":"true","is_unique":"false","default_value":"NULL","validation":"none","dropdown_options":"NULL","help_text":"User ID"},{"field_name":"created_at","field_label":"Dibuat Pada","field_type":"timestamp","field_length":"NULL","is_required":"true","is_unique":"false","default_value":"CURRENT_TIMESTAMP","validation":"none","dropdown_options":"NULL","help_text":""},{"field_name":"updated_at","field_label":"Diperbarui Pada","field_type":"timestamp","field_length":"NULL","is_required":"true","is_unique":"false","default_value":"CURRENT_TIMESTAMP","validation":"none","dropdown_options":"NULL","help_text":""}];

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
    action(form.id, form).then(() => navigate("/" + "sek-adm"));
  }
  return (
    <PageLayout>
      <h1>{isEdit ? "Edit" : "Tambah"} SEK-ADM</h1>
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
