// frontend/src/modules/UPT-TKN/DetailPage.jsx

import React, { useEffect, useState } from "react";
import { fetchDetail } from "./api";
import PageLayout from "../../components/PageLayout";
import { useParams } from "react-router-dom";

const fields = [
  {
    field_name: "status",
    field_label: "Status",
    field_type: "enum",
    field_length: "NULL",
    is_required: "true",
    is_unique: "false",
    default_value: "pending",
    validation: "none",
    dropdown_options: "pending,proses,selesai,verifikasi,approved",
    help_text: "Status",
  },
  {
    field_name: "keterangan",
    field_label: "Keterangan",
    field_type: "text",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Catatan",
  },
  {
    field_name: "created_by",
    field_label: "Dibuat Oleh",
    field_type: "int",
    field_length: "11",
    is_required: "true",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "User ID",
  },
  {
    field_name: "created_at",
    field_label: "Dibuat Pada",
    field_type: "timestamp",
    field_length: "NULL",
    is_required: "true",
    is_unique: "false",
    default_value: "CURRENT_TIMESTAMP",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "",
  },
  // Tambahan field audit
  {
    field_name: "tim_auditor",
    field_label: "Tim Auditor",
    field_type: "text",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Nama-nama tim auditor",
  },
  {
    field_name: "checklist_audit",
    field_label: "Checklist Audit",
    field_type: "json",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "JSON checklist audit",
  },
  {
    field_name: "skor_audit",
    field_label: "Skor Audit",
    field_type: "decimal",
    field_length: "5,2",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Skor hasil audit",
  },
  {
    field_name: "hasil_audit",
    field_label: "Hasil Audit",
    field_type: "enum",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "Lulus,Tidak Lulus,Lulus Bersyarat",
    help_text: "Hasil audit",
  },
  {
    field_name: "catatan_audit",
    field_label: "Catatan Audit",
    field_type: "text",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Catatan hasil audit",
  },
  {
    field_name: "tindakan_korektif",
    field_label: "Tindakan Korektif",
    field_type: "text",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Tindakan korektif yang diperlukan",
  },
  {
    field_name: "batas_waktu_perbaikan",
    field_label: "Batas Waktu Perbaikan",
    field_type: "date",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Deadline perbaikan",
  },
  {
    field_name: "status_sertifikat",
    field_label: "Status Sertifikat",
    field_type: "enum",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "Proses,Diterbitkan,Ditolak,Dicabut",
    help_text: "Status penerbitan sertifikat",
  },
  {
    field_name: "nomor_sertifikat",
    field_label: "Nomor Sertifikat",
    field_type: "varchar",
    field_length: "100",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Nomor sertifikat yang diterbitkan",
  },
  {
    field_name: "tanggal_terbit_sertifikat",
    field_label: "Tanggal Terbit",
    field_type: "date",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Tanggal sertifikat diterbitkan",
  },
  {
    field_name: "masa_berlaku_sertifikat",
    field_label: "Masa Berlaku",
    field_type: "date",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Tanggal kadaluarsa sertifikat",
  },
  {
    field_name: "jenis_produk_audit",
    field_label: "Jenis Produk",
    field_type: "enum",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "Domestik,Impor",
    help_text: "Produk domestik atau impor",
  },
  {
    field_name: "negara_asal",
    field_label: "Negara Asal",
    field_type: "varchar",
    field_length: "100",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Negara asal produk",
  },
];

export default function DetailPage() {
  const { id } = useParams();
  const [data, setData] = useState({});
  useEffect(() => {
    if (id && id !== "undefined" && id !== null && id !== "") {
      fetchDetail(id).then((res) => setData(res.data));
    }
  }, [id]);
  return (
    <PageLayout>
      <h1>Detail UPT-TKN</h1>
      <ul>
        {fields.map((field) => (
          <li key={field.field_name}>
            <b>{field.field_label}:</b>{" "}
            {data[field.field_name] !== undefined &&
            data[field.field_name] !== null &&
            data[field.field_name] !== ""
              ? data[field.field_name]
              : "-"}
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}
