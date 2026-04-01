import React from "react";

export default function DashboardPublikLayout({ children }) {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full min-w-0 bg-gradient-to-b from-exec-canvas via-white to-exec-canvas2 text-exec-ink font-inter antialiased">
      <header className="sticky top-0 z-10 border-b border-exec-border bg-white/90 backdrop-blur-md shadow-sm">
        <div className="w-full max-w-[100vw] mx-auto box-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 md:px-8 py-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-teal-700 via-teal-600 to-rose-600 bg-clip-text text-transparent">
              Dashboard Publik
            </h2>
            <p className="text-sm text-exec-muted mt-0.5">
              Ringkasan data terbuka — Provinsi Maluku Utara
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-[100vw] mx-auto box-border px-4 sm:px-6 md:px-8 py-6 sm:py-8 pb-12">
        {children}
      </main>
    </div>
  );
}
