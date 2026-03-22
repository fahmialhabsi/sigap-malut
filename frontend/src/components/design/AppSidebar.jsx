/**
 * AppSidebar — Reusable sidebar component sesuai design system SIGAP MALUT
 *
 * Design tokens:
 *   Expanded : 280px  (var --sidebar-width)
 *   Collapsed: 72px   (var --sidebar-collapsed)
 *   Primary  : #0B5FFF
 *
 * Usage:
 *   <AppSidebar
 *     open={sidebarOpen}
 *     onToggle={() => setSidebarOpen(v => !v)}
 *     isMobile={isMobile}
 *     navItems={NAV_ITEMS}
 *     logo={{ icon: "📊", title: "SIGAP MALUT", subtitle: "Nama Dashboard" }}
 *   />
 *
 * NAV_ITEMS shape: [{ label, path, icon, end? }]
 */

import { NavLink } from "react-router-dom";

// Design token constants — sinkron dengan tailwind.config.js & index.css
export const SIDEBAR_EXPANDED = "w-[280px]";
export const SIDEBAR_COLLAPSED = "w-[72px]";
export const MAIN_MARGIN_EXPANDED = "ml-[280px]";
export const MAIN_MARGIN_COLLAPSED = "ml-[72px]";

export default function AppSidebar({
  open,
  onToggle,
  isMobile = false,
  navItems = [],
  logo = { icon: "📊", title: "SIGAP MALUT", subtitle: "Dashboard" },
  colorClass = "bg-gradient-to-b from-blue-900 to-blue-800",
  activeClass = "bg-[#0B5FFF] text-white font-semibold",
  hoverClass = "text-blue-100 hover:bg-blue-700",
}) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 flex flex-col ${colorClass} text-white shadow-xl transition-all duration-300 ${
        open ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED
      } ${isMobile && !open ? "-translate-x-full" : ""}`}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0">
        <span className="text-2xl shrink-0">{logo.icon}</span>
        {open && (
          <div className="overflow-hidden">
            <div className="font-bold text-sm leading-tight truncate">
              {logo.title}
            </div>
            <div className="text-xs text-blue-200 truncate">
              {logo.subtitle}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end ?? item.path === navItems[0]?.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? activeClass : hoverClass
              }`
            }
          >
            <span className="text-base shrink-0">{item.icon}</span>
            {open && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse/expand toggle */}
      <button
        onClick={onToggle}
        className="mx-auto mb-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 transition-colors"
        aria-label={open ? "Tutup sidebar" : "Buka sidebar"}
      >
        {open ? "◀" : "▶"}
      </button>
    </aside>
  );
}
