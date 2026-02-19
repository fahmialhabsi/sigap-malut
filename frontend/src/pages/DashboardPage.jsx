import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import Stat from "../components/ui/Stat";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Section
        eyebrow="Ringkasan Eksekutif"
        title="Dashboard Kendali SIGAP Malut"
        subtitle="Pantau indikator kinerja utama, alur koordinasi, serta kesiapan data lintas bidang untuk keputusan cepat."
        actions={
          <>
            <span className="rounded-full border border-slate-200 bg-accentSoft px-3 py-1 text-xs font-semibold text-accentDark">
              Hub Data Sekretariat
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              190+ Modul
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              Update harian
            </span>
          </>
        }
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Surat Masuk",
            value: "4",
            note: "Tertata",
            tone: "bg-accentSoft text-accentDark",
          },
          {
            label: "Harga Pangan",
            value: "5",
            note: "On Target",
            tone: "bg-amber-50 text-warning",
          },
          {
            label: "Komoditas",
            value: "14",
            note: "Satu sumber",
            tone: "bg-slate-100 text-slate-600",
          },
          {
            label: "Pengguna Aktif",
            value: "15",
            note: "Terkontrol",
            tone: "bg-emerald-50 text-emerald-700",
          },
        ].map((card) => (
          <Card
            key={card.label}
            title={card.label}
            value={card.value}
            note={card.note}
            tone={card.tone}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">
              Alert Prioritas Minggu Ini
            </h3>
            <span className="text-xs text-muted">3 kasus</span>
          </div>
          <div className="mt-4 space-y-4">
            {[
              {
                title: "KGB Terlambat",
                desc: "1 pegawai melewati tenggat 30 hari.",
                status: "Kritis",
                tone: "bg-red-50 text-danger",
              },
              {
                title: "Compliance Koordinasi",
                desc: "2 bypass terdeteksi pada alur Sekretariat.",
                status: "Warning",
                tone: "bg-amber-50 text-warning",
              },
              {
                title: "Inflasi Mendekati Target",
                desc: "Harga cabai naik 5% minggu ini.",
                status: "Monitor",
                tone: "bg-slate-100 text-slate-600",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-slate-200 px-4 py-3"
              >
                <Badge tone={item.tone}>{item.status}</Badge>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-ink">Akses Cepat</h3>
          <p className="mt-1 text-sm text-muted">
            Jalur cepat ke modul prioritas hari ini.
          </p>
          <div className="mt-5 grid gap-3">
            {[
              "Dashboard Inflasi",
              "Ringkasan Kepegawaian",
              "Laporan Distribusi",
              "Data SPPG",
              "Portal Publik",
            ].map((label) => (
              <Button key={label} className="w-full justify-between">
                <span>{label}</span>
                <span className="text-muted">-&gt;</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-ink">Kinerja Bulanan</h3>
          <p className="mt-1 text-sm text-muted">
            Perbandingan capaian KPI lintas bidang.
          </p>
          <div className="mt-6 space-y-4">
            {[
              { label: "Sekretariat", value: "84%" },
              { label: "Ketersediaan", value: "78%" },
              { label: "Distribusi", value: "81%" },
              { label: "Konsumsi", value: "76%" },
            ].map((item) => (
              <div key={item.label}>
                <Stat label={item.label} value={item.value} />
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: item.value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-ink">
            Ringkasan Laporan Strategis
          </h3>
          <p className="mt-1 text-sm text-muted">
            Dashboard untuk Kepala Dinas dan Gubernur.
          </p>
          <div className="mt-6 grid gap-4">
            {[
              {
                title: "Laporan Inflasi",
                desc: "Siap untuk rapat TPID minggu ini.",
              },
              {
                title: "Rekap SPPG",
                desc: "Data valid 100% untuk pelaporan nasional.",
              },
              {
                title: "Kinerja Bidang",
                desc: "Ringkasan KPI bulanan sudah tersusun.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 px-4 py-3"
              >
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
