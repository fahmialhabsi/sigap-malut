import React from "react";

export default function DashboardUPTDLayout({ children }) {
  // Layout khusus UPTD
  return (
    <div className="flex flex-col min-h-screen bg-ink text-surface font-inter">
      {/* Header UPTD */}
      <header className="sticky top-0 z-10 border-b border-muted bg-ink/80 backdrop-blur text-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-2xl font-display text-primary">
              Dashboard UPTD
            </h2>
            <p className="text-sm text-muted">Ringkasan UPTD dan Monitoring</p>
          </div>
        </div>
      </header>
      {/* Konten utama dashboard */}
      <main className="flex-1 px-8 py-8 mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
