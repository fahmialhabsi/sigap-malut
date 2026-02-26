import React from "react";
import DataTable from "../components/DataTable";

export default {
  title: "Komponen/DataTable",
  component: DataTable,
};

const Template = (args) => <DataTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  columns: [
    { Header: "Nama", accessor: "nama" },
    { Header: "Nilai", accessor: "nilai" },
    { Header: "Status", accessor: "status" },
  ],
  data: [
    { nama: "Siti", nilai: 85, status: "Terlewat" },
    { nama: "Joko", nilai: 90, status: "Selesai" },
  ],
};
