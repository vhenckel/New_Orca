interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  delay?: number;
}

export function MetricCard({ label, value, subtitle, delay = 0 }: MetricCardProps) {
  return (
    <div
      className="card-surface p-4 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="kpi-label">{label}</span>
      <div className="mt-1 text-2xl font-bold tracking-tight text-foreground font-mono">{value}</div>
      {subtitle && <span className="mt-1 text-xs text-muted-foreground">{subtitle}</span>}
    </div>
  );
}
