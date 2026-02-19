export default function Table({ children, className = "" }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table
        className={`min-w-full divide-y divide-slate-200 ${className}`.trim()}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <thead className={`bg-slate-50 text-slate-600 ${className}`.trim()}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }) {
  return (
    <tbody className={`bg-white divide-y divide-slate-200 ${className}`.trim()}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "" }) {
  return <tr className={`transition ${className}`.trim()}>{children}</tr>;
}

export function TableCell({ children, className = "", as = "td" }) {
  const CellTag = as;
  const baseClass = as === "th" ? "px-6 py-3" : "px-6 py-4";
  return (
    <CellTag className={`${baseClass} ${className}`.trim()}>{children}</CellTag>
  );
}
