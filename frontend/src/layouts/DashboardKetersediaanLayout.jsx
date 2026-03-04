    return (
      <div className="min-h-screen font-inter" style={{ background: '#fff' }}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside
            className="flex flex-col items-center py-6"
            style={{ width: 72, backgroundColor: "#06A657" }}
          >
            {/* LOGO */}
            <div
              className="bg-white rounded-lg flex items-center justify-center mb-8"
              style={{ width: 36, height: 36 }}
            >
              <span className="text-[#06A657] font-bold text-xs">LOGO</span>
            </div>
            {/* Sidebar menu modul, urutan dan warna sesuai SVG */}
            <SidebarItem label="Dash" textColor="#06A657" />
            <SidebarItem label="Stok" textColor="#06A657" />
            <SidebarItem label="Gudang" textColor="#0B5FFF" />
            <SidebarItem label="Produksi" textColor="#F59E0B" />
            <SidebarItem label="Target" textColor="#EF4444" />
            <SidebarItem label="Laporan" textColor="#0B5FFF" />
            <SidebarItem label="Approve" textColor="#06A657" />
            <SidebarItem label="Agenda" textColor="#0B5FFF" />
          </aside>

          {/* Main area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header
              className="flex items-center px-6"
              style={{ height: 60, backgroundColor: "#07723A", boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
            >
              {/* Logo kiri (36x36) */}
              <div className="flex items-center">
                <div
                  className="bg-white rounded-lg flex items-center justify-center"
                  style={{ width: 36, height: 36 }}
                >
                  <span className="text-[#07723A] font-bold text-xs">LOGO</span>
                </div>
                <span className="ml-6 text-2xl text-white font-bold font-inter">Ketersediaan</span>
              </div>
              <div className="flex-1" />
              {/* Notifikasi bulat kuning kanan */}
              <div className="flex items-center space-x-4 mr-6">
                <NotificationBell />
                <ProfileAvatar />
              </div>
            </header>

            <main className="flex-1 px-8 py-6" style={{ background: '#fff' }}>
              {/* HERO ROW (6 cards, 160x60) */}
              <div className="grid grid-cols-6 gap-4 mb-6">
                <KpiCard title="Stok Total" color="green" />
                <KpiCard title="Stok Kritis" color="blue" />
                <KpiCard title="Produksi Hr." color="yellow" />
                <KpiCard title="Target Bulan" color="red" />
                <KpiCard title="Backlog" color="blue" />
                <KpiCard title="Approve" color="yellow" />
              </div>

              {/* PANEL ROW 1 */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <PanelBox title="Tabel Stok By Komoditas" color="green">
                  <FakeTable label1="Komoditas" label2="Stok" />
                </PanelBox>
                <PanelBox title="Grafik Tren Stok" color="blue">
                  <PlaceholderChart />
                </PanelBox>
              </div>

              {/* PANEL ROW 2 */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <PanelBox title="Log Produksi/Mutasi" color="yellow">
                  <FakeList />
                </PanelBox>
                <PanelBox title="Approval Stok" color="red">
                  <FakeTable label1="Nama" label2="Status" />
                </PanelBox>
              </div>

              {/* NOTIF KRITIS (full width) */}
              <PanelBox title="Notifikasi Kritis" color="yellow" fullWidth>
                <ul className="text-red-700 space-y-1">
                  <li>
                    Stok Beras di Gudang A <span className="font-semibold">di bawah minimum!</span>
                  </li>
                  <li>Pengajuan Mutasi belum approve 2 hari</li>
                  <li>Perubahan target produksi bulan ini</li>
                </ul>
              </PanelBox>
            </main>

            {/* Footer */}
            <footer
              style={{ height: 30, backgroundColor: "#07723A" }}
              className="flex items-center px-6"
            >
              <span className="text-white text-xs">
                SIGAP Malut v1 | Bidang Ketersediaan
              </span>
            </footer>
          </div>
        </div>
      </div>
    );
            </div>

            {/* PANEL ROW 2 */}
            <div className="grid grid-cols-2 gap-6">
              <PanelBox title="Log Produksi/Mutasi" color="yellow">
                <FakeList />
              </PanelBox>
              <PanelBox title="Approval Stok" color="red">
                <FakeTable label1="Nama" label2="Status" />
              </PanelBox>
            </div>

            {/* NOTIF KRITIS (full width) */}
            <PanelBox title="Notifikasi Kritis" color="yellow" fullWidth>
              <ul className="text-red-700 space-y-1">
                <li>
                  Stok Beras di Gudang A{" "}
                  <span className="font-semibold">di bawah minimum!</span>
                </li>
                <li>Pengajuan Mutasi belum approve 2 hari</li>
                <li>Perubahan target produksi bulan ini</li>
              </ul>
            </PanelBox>
          </main>

          {/* Footer (height 30, same green as header) */}
          <footer
            style={{ height: 30, backgroundColor: "#07723A" }}
            className="flex items-center px-6"
          >
            <span className="text-white text-xs">
              SIGAP Malut v1 | Bidang Ketersediaan
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable components ---------- */

function SidebarItem({ label, textColor = "#06A657" }) {
  return (
    <button
      className="mb-2 flex items-center justify-center rounded-lg"
      style={{
        width: 40,
        height: 40,
        backgroundColor: "#f4f4f4",
        color: textColor,
        fontSize: 11,
      }}
      aria-label={label}
    >
      {label}
    </button>
  );
}

function KpiCard({ title, color }) {
  const mapping = {
    green: { border: "#06A657", title: "#06A657" },
    blue: { border: "#0B5FFF", title: "#0B5FFF" },
    yellow: { border: "#FACC15", title: "#FACC15" },
    red: { border: "#EF4444", title: "#EF4444" },
  };
  const c = mapping[color] || mapping.green;

  return (
    <div
      className="rounded-lg border-2 shadow flex flex-col items-center justify-center"
      style={{ height: 60, borderColor: c.border, backgroundColor: "#fff" }}
    >
      <div
        className="font-semibold mb-1"
        style={{ color: c.title, fontSize: 12 }}
      >
        {title}
      </div>
      <div className="text-2xl font-bold text-gray-800">123</div>
    </div>
  );
}

function PanelBox({ title, children, color = "green", fullWidth = false }) {
  const mapping = {
    green: { border: "#06A657", title: "#06A657" },
    blue: { border: "#0B5FFF", title: "#0B5FFF" },
    yellow: { border: "#FACC15", title: "#FACC15" },
    red: { border: "#EF4444", title: "#EF4444" },
  };
  const c = mapping[color] || mapping.green;

  return (
    <section
      className="rounded-xl bg-white shadow p-4 mb-2"
      style={{
        border: `2px solid ${c.border}`,
        minHeight: fullWidth ? 48 : 120,
      }}
    >
      <h2 className="font-bold mb-3" style={{ color: c.title }}>
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function FakeTable({ label1, label2 }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <th className="text-left pr-4">{label1}</th>
          <th className="text-left">{label2}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-1">Beras</td>
          <td className="py-1">2.100 kg</td>
        </tr>
        <tr>
          <td className="py-1">Jagung</td>
          <td className="py-1">700 kg</td>
        </tr>
      </tbody>
    </table>
  );
}

function FakeList() {
  return (
    <ul className="pl-4 text-xs list-disc">
      <li>Mutasi masuk Gudang A</li>
      <li>Produksi Jagung 500kg</li>
      <li>Input OP</li>
    </ul>
  );
}

function PlaceholderChart() {
  return (
    <div
      className="w-full h-32 rounded-md flex items-center justify-center text-sm text-gray-500"
      style={{ backgroundColor: "#ffffff" }}
    >
      Grafik (placeholder)
    </div>
  );
}

function NotificationBell() {
  // yellow circular indicator similar to the circle on the header in the SVG
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: 36,
        height: 36,
        backgroundColor: "#FACC15",
        color: "#7a5a00",
      }}
      aria-hidden
    >
      🔔
    </div>
  );
}

function ProfileAvatar() {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: 36,
        height: 36,
        backgroundColor: "#D1FAE5",
        color: "#065f46",
      }}
    >
      KB
    </div>
  );
}
