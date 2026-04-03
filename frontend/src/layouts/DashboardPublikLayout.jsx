import React from "react";
import { Link } from "react-router-dom";
import { executiveTheme } from "../ui/dashboards/executiveTheme";

export default function DashboardPublikLayout({ children }) {
  return (
    <div className={executiveTheme.shell}>
      <div className={executiveTheme.shellGlowLeft} aria-hidden />
      <div className={executiveTheme.shellGlowRight} aria-hidden />
      <div className={executiveTheme.shellGlowBottom} aria-hidden />

      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/88 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[100vw] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
          <div>
            <div className={executiveTheme.heroKicker}>Portal Data Terbuka</div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
              Dashboard Publik
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Ringkasan data terbuka Provinsi Maluku Utara
            </p>
          </div>

          <Link to="/" className={executiveTheme.buttonSecondary}>
            Kembali ke Landing Page
          </Link>
        </div>
      </header>

      <main className={executiveTheme.content}>{children}</main>
    </div>
  );
}
