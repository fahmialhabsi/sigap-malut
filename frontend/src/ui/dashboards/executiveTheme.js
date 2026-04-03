export const executiveTheme = {
  shell:
    "relative min-h-[100dvh] w-full min-w-0 overflow-hidden bg-slate-950 text-slate-100 antialiased",
  shellGlowLeft:
    "pointer-events-none absolute -left-8 top-8 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl",
  shellGlowRight:
    "pointer-events-none absolute right-8 top-10 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl",
  shellGlowBottom:
    "pointer-events-none absolute bottom-10 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-sky-500/6 blur-3xl",
  content:
    "relative mx-auto box-border w-full max-w-[100vw] px-3 py-4 pb-10 sm:px-5 sm:py-5 md:px-6 lg:px-8",
  hero:
    "relative overflow-hidden rounded-[30px] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-[0_28px_72px_-38px_rgba(2,6,23,0.92)]",
  heroAccent:
    "pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-amber-300 via-sky-400 to-cyan-300",
  heroGlow:
    "pointer-events-none absolute inset-y-0 right-0 w-72 bg-gradient-to-l from-sky-300/8 to-transparent",
  heroInner:
    "relative flex flex-wrap items-start justify-between gap-4 p-4 pl-6 sm:p-5 sm:pl-7",
  heroKicker:
    "text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400",
  heroTitle:
    "max-w-5xl text-[2rem] font-extrabold tracking-tight text-white sm:text-[2.7rem]",
  heroDescription:
    "mt-3 max-w-3xl text-[15px] leading-7 text-slate-300/90",
  heroMeta:
    "mt-3 inline-flex items-center rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-100",
  heroLoginCard:
    "min-w-[148px] rounded-2xl border border-white/10 bg-slate-800/55 px-4 py-3 text-right shadow-lg shadow-slate-950/30 backdrop-blur",
  heroLoginLabel: "text-[11px] uppercase tracking-[0.2em] text-slate-500",
  heroLoginValue: "mt-1 text-sm font-semibold text-white",
  sidebar:
    "h-fit rounded-[28px] border border-slate-800 bg-slate-900/88 p-4 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.7)] backdrop-blur-xl lg:sticky lg:top-4",
  sidebarTitle:
    "mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500",
  menuButtonBase:
    "w-full rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-200",
  menuButtonActive:
    "border-sky-400/30 bg-sky-500/12 text-white shadow-[0_16px_30px_-24px_rgba(14,165,233,0.35)]",
  menuButtonIdle:
    "border-transparent bg-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/80",
  tile:
    "relative overflow-hidden rounded-[24px] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 shadow-[0_18px_36px_-26px_rgba(2,6,23,0.72)]",
  tileLabel:
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400",
  tileValue:
    "mt-2 text-[2.1rem] font-extrabold tracking-tight text-white tabular-nums",
  tileHint: "mt-1 text-[11px] leading-relaxed text-slate-400",
  panel:
    "overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/88 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.72)] backdrop-blur-xl",
  panelHeader:
    "flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-5 py-4",
  panelTitle: "font-semibold text-slate-100",
  panelSubtitle: "mt-1 text-xs text-slate-400",
  panelMeta: "text-xs text-slate-400",
  itemCard:
    "rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-[0_14px_24px_-22px_rgba(2,6,23,0.75)]",
  itemCardMuted: "rounded-2xl border border-slate-800 bg-slate-900/70 p-4",
  input:
    "rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 shadow-inner shadow-black/30 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15",
  buttonSecondary:
    "rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800",
  buttonPrimary:
    "rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-500",
  buttonInfo:
    "rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500",
  buttonSuccess:
    "rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500",
  buttonWarning:
    "rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-400",
  buttonDanger:
    "rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500",
  badgeNeutral:
    "inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-200",
  badgeInfo:
    "inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-200",
  tileAccent:
    "mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300",
  sidebarNote:
    "mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4",
  sidebarNoteTitle:
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500",
  sidebarNoteText: "mt-2 text-sm font-semibold text-slate-100",
  sidebarNoteCaption: "mt-1 text-xs leading-relaxed text-slate-400",
  subtleText: "text-xs text-slate-400",
  mutedText: "text-sm text-slate-400",
  emphasisText: "text-slate-100",
};
