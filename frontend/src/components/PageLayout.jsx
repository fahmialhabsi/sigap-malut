import React from "react";

/**
 * PageLayout - Layout sederhana reusable untuk semua modul SIGAP
 * Props:
 *   - children: konten utama
 *   - title: (opsional) judul halaman
 *   - className: (opsional) styling tambahan
 */
export default function PageLayout({ children, title, className = "" }) {
  return (
    <div className={`max-w-5xl mx-auto px-4 py-8 ${className}`}>
      {title && (
        <h1 className="text-2xl font-bold mb-6 text-blue-900 dark:text-white">
          {title}
        </h1>
      )}
      <div>{children}</div>
    </div>
  );
}
