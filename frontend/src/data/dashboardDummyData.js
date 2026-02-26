// Data dummy dashboard SIGAP-MALUT

export const sekretariatData = {
  sidebarItems: [
    { label: "Dashboard", path: "/dashboard/sekretariat", icon: "🏠" },
    { label: "Administrasi Umum", path: "/admin-umum", icon: "📁" },
    { label: "Kepegawaian", path: "/kepegawaian", icon: "🗃️" },
    { label: "Keuangan", path: "/keuangan", icon: "💰" },
    { label: "Aset & BMD", path: "/aset-bmd", icon: "🏢" },
    { label: "Rumah Tangga", path: "/rumah-tangga", icon: "🏡" },
  ],
  kpiList: [
    { label: "Total Dokumen", value: 120, color: "primary", icon: "📄" },
    { label: "Validasi", value: "98%", color: "green", icon: "✅" },
    { label: "Alert", value: 3, color: "red", icon: "⚠️" },
    { label: "Audit Log", value: 250, color: "yellow", icon: "📝" },
  ],
  tableColumns: [
    { Header: "Nama Dokumen", accessor: "nama" },
    { Header: "Status", accessor: "status" },
    { Header: "Tanggal", accessor: "tanggal" },
  ],
  tableData: [
    { nama: "Surat Masuk", status: "Valid", tanggal: "2026-02-22" },
    { nama: "SPJ", status: "Pending", tanggal: "2026-02-21" },
    { nama: "Laporan Bulanan", status: "Valid", tanggal: "2026-02-20" },
  ],
  activityList: [
    "Upload dokumen KGB ASN a.n. Siti",
    "SPJ #2401 disetujui Bendahara",
    "Laporan Bulanan due besok",
  ],
  aiInboxList: [
    { label: "Surat Masuk", summary: "AI: Berkas SK baru masuk" },
    { label: "SPJ", summary: "AI Deteksi, perlu verifikasi" },
  ],
};

export const ketersediaanData = {
  sidebarItems: [
    { label: "Dashboard", path: "/dashboard/ketersediaan", icon: "🏠" },
    { label: "Stok Pangan", path: "/stok-pangan", icon: "🌾" },
    { label: "Gudang", path: "/gudang", icon: "🏢" },
    { label: "Distribusi", path: "/distribusi", icon: "🚚" },
  ],
  kpiList: [
    { label: "Stok Beras", value: "1.200 ton", color: "primary", icon: "🌾" },
    { label: "Gudang Aktif", value: 12, color: "green", icon: "🏢" },
    { label: "Alert", value: 2, color: "red", icon: "⚠️" },
    { label: "Distribusi", value: "92%", color: "yellow", icon: "🚚" },
  ],
  tableColumns: [
    { Header: "Nama Gudang", accessor: "nama" },
    { Header: "Stok", accessor: "stok" },
    { Header: "Status", accessor: "status" },
  ],
  tableData: [
    { nama: "Gudang A", stok: "500 ton", status: "Aktif" },
    { nama: "Gudang B", stok: "300 ton", status: "Aktif" },
    { nama: "Gudang C", stok: "400 ton", status: "Perlu Validasi" },
  ],
  activityList: [
    "Distribusi ke Kecamatan X selesai",
    "Stok Gudang B diperbarui",
    "Alert: Gudang C perlu validasi",
  ],
  aiInboxList: [
    { label: "Stok", summary: "AI: Stok optimal" },
    { label: "Distribusi", summary: "AI: Distribusi lancar" },
  ],
};

export const distribusiData = {
  sidebarItems: [
    { label: "Dashboard", path: "/dashboard/distribusi", icon: "🏠" },
    { label: "Rute Distribusi", path: "/rute", icon: "🛣️" },
    { label: "Armada", path: "/armada", icon: "🚚" },
    { label: "Monitoring", path: "/monitoring", icon: "📊" },
  ],
  kpiList: [
    { label: "Total Armada", value: 24, color: "primary", icon: "🚚" },
    { label: "Rute Aktif", value: 8, color: "green", icon: "🛣️" },
    { label: "Alert", value: 1, color: "red", icon: "⚠️" },
    { label: "Monitoring", value: "98%", color: "yellow", icon: "📊" },
  ],
  tableColumns: [
    { Header: "Nama Armada", accessor: "nama" },
    { Header: "Rute", accessor: "rute" },
    { Header: "Status", accessor: "status" },
  ],
  tableData: [
    { nama: "Armada 1", rute: "Rute A", status: "Aktif" },
    { nama: "Armada 2", rute: "Rute B", status: "Aktif" },
    { nama: "Armada 3", rute: "Rute C", status: "Perlu Validasi" },
  ],
  activityList: [
    "Armada 1 tiba di tujuan",
    "Monitoring distribusi Rute B",
    "Alert: Armada 3 perlu validasi",
  ],
  aiInboxList: [
    { label: "Armada", summary: "AI: Armada optimal" },
    { label: "Monitoring", summary: "AI: Monitoring lancar" },
  ],
};

export const konsumsiData = {
  sidebarItems: [
    { label: "Dashboard", path: "/dashboard/konsumsi", icon: "🏠" },
    { label: "Konsumsi Pangan", path: "/konsumsi-pangan", icon: "🍽️" },
    { label: "Survey", path: "/survey", icon: "📋" },
    { label: "Analisis", path: "/analisis", icon: "📊" },
  ],
  kpiList: [
    { label: "Total Survey", value: 320, color: "primary", icon: "📋" },
    { label: "Konsumsi", value: "98%", color: "green", icon: "🍽️" },
    { label: "Alert", value: 2, color: "red", icon: "⚠️" },
    { label: "Analisis", value: "92%", color: "yellow", icon: "📊" },
  ],
  tableColumns: [
    { Header: "Nama Survey", accessor: "nama" },
    { Header: "Status", accessor: "status" },
    { Header: "Tanggal", accessor: "tanggal" },
  ],
  tableData: [
    { nama: "Survey A", status: "Valid", tanggal: "2026-02-22" },
    { nama: "Survey B", status: "Pending", tanggal: "2026-02-21" },
    { nama: "Survey C", status: "Valid", tanggal: "2026-02-20" },
  ],
  activityList: [
    "Survey A selesai",
    "Analisis konsumsi pangan",
    "Alert: Survey B pending",
  ],
  aiInboxList: [
    { label: "Survey", summary: "AI: Survey optimal" },
    { label: "Analisis", summary: "AI: Analisis lancar" },
  ],
};

export const uptdData = {
  sidebarItems: [
    { label: "Dashboard", path: "/dashboard/uptd", icon: "🏠" },
    { label: "Pengawasan", path: "/pengawasan", icon: "🔍" },
    { label: "Laporan", path: "/laporan", icon: "📄" },
    { label: "Data Balai", path: "/data-balai", icon: "🏢" },
  ],
  kpiList: [
    { label: "Total Pengawasan", value: 42, color: "primary", icon: "🔍" },
    { label: "Laporan", value: 12, color: "green", icon: "📄" },
    { label: "Alert", value: 1, color: "red", icon: "⚠️" },
    { label: "Data Balai", value: 5, color: "yellow", icon: "🏢" },
  ],
  tableColumns: [
    { Header: "Nama Balai", accessor: "nama" },
    { Header: "Status", accessor: "status" },
    { Header: "Tanggal", accessor: "tanggal" },
  ],
  tableData: [
    { nama: "Balai A", status: "Valid", tanggal: "2026-02-22" },
    { nama: "Balai B", status: "Pending", tanggal: "2026-02-21" },
    { nama: "Balai C", status: "Valid", tanggal: "2026-02-20" },
  ],
  activityList: [
    "Pengawasan Balai A selesai",
    "Laporan Balai B pending",
    "Alert: Balai C perlu validasi",
  ],
  aiInboxList: [
    { label: "Pengawasan", summary: "AI: Pengawasan optimal" },
    { label: "Laporan", summary: "AI: Laporan lancar" },
  ],
};

export const superAdminData = {
  sidebarItems: [
    { label: "Dashboard", path: "/dashboard/superadmin", icon: "🏠" },
    { label: "User Management", path: "/user-management", icon: "👤" },
    { label: "Audit Trail", path: "/audit-trail", icon: "📝" },
    { label: "Settings", path: "/settings", icon: "⚙️" },
  ],
  kpiList: [
    { label: "Total User", value: 120, color: "primary", icon: "👤" },
    { label: "Audit Log", value: 250, color: "yellow", icon: "📝" },
    { label: "Alert", value: 5, color: "red", icon: "⚠️" },
    { label: "Settings", value: 1, color: "green", icon: "⚙️" },
  ],
  tableColumns: [
    { Header: "Nama User", accessor: "nama" },
    { Header: "Role", accessor: "role" },
    { Header: "Status", accessor: "status" },
  ],
  tableData: [
    { nama: "Admin", role: "super_admin", status: "Aktif" },
    { nama: "Sekretaris", role: "sekretaris", status: "Aktif" },
    { nama: "Kepala Dinas", role: "kepala_dinas", status: "Aktif" },
  ],
  activityList: ["User Admin login", "Audit log updated", "Settings changed"],
  aiInboxList: [
    { label: "User", summary: "AI: User aktif" },
    { label: "Audit", summary: "AI: Audit log updated" },
  ],
};
