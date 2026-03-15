import React, { useEffect, useState } from "react";
import { fetchList, deleteItem } from "./api";
import Table from "../../components/ui/table/Table";
import PageLayout from "../../components/PageLayout";
import { useNavigate } from "react-router-dom";

const columns = [
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
    field_name: "akses_terbatas",
    field_label: "Akses Terbatas",
    field_type: "boolean",
    field_length: "NULL",
    is_required: "true",
    is_unique: "false",
    default_value: "1",
    validation: "none",
    dropdown_options: "NULL",
    help_text: "UPTD hanya bisa akses data sendiri (field khusus UPTD)",
  },
];

export default function ListPage() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchList().then((res) => setData(res.data));
  }, []);
  return (
    <PageLayout>
      <h1>UPT-ADM</h1>
      <button onClick={() => navigate("/uptd/UPT-ADM/new")}>Tambah</button>
      <Table
        columns={columns}
        data={data}
        onView={(row) => navigate("/" + "upt-adm" + "/" + row.id)}
        onEdit={(row) => navigate("/" + "upt-adm" + "/edit/" + row.id)}
        onDelete={(row) => {
          if (window.confirm("Hapus data?"))
            deleteItem(row.id).then(() =>
              setData(data.filter((d) => d.id !== row.id)),
            );
        }}
      />
    </PageLayout>
  );
}
