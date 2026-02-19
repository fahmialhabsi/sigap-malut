export default function Stat({ label, value, helper, className = "" }) {
  return (
    <div className={`flex items-baseline justify-between ${className}`.trim()}>
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {helper && <p className="text-xs text-muted">{helper}</p>}
      </div>
      <span className="text-sm font-semibold text-muted">{value}</span>
    </div>
  );
}
