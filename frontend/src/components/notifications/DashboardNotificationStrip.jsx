// Strip tipis untuk dashboard standalone — menyamai bilah notifikasi di DashboardLayout
import NotificationCenter from "./NotificationCenter";

export default function DashboardNotificationStrip() {
  return (
    <div className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shrink-0 z-50 relative">
      <div className="max-w-[1800px] mx-auto w-full flex items-center justify-end gap-2 px-3 sm:px-4 py-2 min-h-[40px] pt-[max(0.5rem,env(safe-area-inset-top))]">
        <NotificationCenter />
      </div>
    </div>
  );
}
