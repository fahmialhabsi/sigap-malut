import React, { useEffect, useState } from "react";
import { fetchDetail } from "./api";
import PageLayout from "../../components/PageLayout";
import { useParams } from "react-router-dom";

const fields = [
  {
    field_name: "unit_kerja",
    field_label: "Unit Kerja",
    field_type: "enum",
    field_length: "NULL",
    is_required: "true",
    is_unique: "false",
    default_value: "UPTD",
    validation: "none",
    dropdown_options:
      "Sekretariat,UPTD,Bidang Ketersediaan,Bidang Distribusi,Bidang Konsumsi",
    help_text: "AUTO-SET ke UPTD (field khusus UPTD)",
  },
  {
    field_name: "lokasi_unit",
    field_label: "Lokasi Unit",
    field_type: "varchar",
    field_length: "255",
    is_required: "false",
    is_unique: "false",
    default_value: "UPTD Balai Pengawasan Mutu",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "Lokasi fisik aset UPTD (field khusus UPTD)",
  },
  {
    field_name: "kategori_aset_uptd",
    field_label: "Kategori Aset UPTD",
    field_type: "enum",
    field_length: "NULL",
    is_required: "false",
    is_unique: "false",
    default_value: "NULL",
    validation: "none",
    dropdown_options:
      "Alat Inspeksi,Peralatan Lab,Alat Kantor,Kendaraan,Lainnya",
    help_text: "Kategori khusus aset UPTD (field khusus UPTD)",
  },
  {
    field_name: "akses_terbatas",
    field_label: "Akses Terbatas",
    field_type: "boolean",
    field_length: "NULL",
    is_required: "true",
    is_unique: "false",
    default_value: "1",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "UPTD hanya bisa akses aset sendiri (field khusus UPTD)",
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
      <h1>Detail UPT-AST</h1>
      <ul>
        {fields.map((field) => (
          <li key={field.field_name}>
            <b>{field.field_label}:</b> {data[field.field_name] || "-"}
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}
