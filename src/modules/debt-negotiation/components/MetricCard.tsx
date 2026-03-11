interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  delay?: number;
}

export function MetricCard({ label, value, subtitle, delay = 0 }: MetricCardProps) {
  return (
    <div className="card-surface animate-fade-in p-4 opacity-0" style={{ animationDelay: `${delay}ms` }}>
      <span className="kpi-label">{label}</span>
      <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground">{value}</div>
      {subtitle && <span className="mt-1 text-xs text-muted-foreground">{subtitle}</span>}
    </div>
  );
}
