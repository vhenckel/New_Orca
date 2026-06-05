interface OrcaOrangeGradientProps {
  id?: string;
}

export function OrcaOrangeGradient({ id = "orcaOrangeGradient" }: OrcaOrangeGradientProps) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
    </linearGradient>
  );
}
