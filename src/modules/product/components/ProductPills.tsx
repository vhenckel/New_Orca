import { Badge } from "@/shared/ui/badge";

const MAX_BRAND_PILLS = 4;
const MAX_SEGMENT_PILLS = 3;

interface ProductPillsProps {
  items: string[];
  moreLabel: (count: number) => string;
  variant: "brand" | "segment";
}

export function ProductPills({ items, moreLabel, variant }: ProductPillsProps) {
  if (items.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const max = variant === "brand" ? MAX_BRAND_PILLS : MAX_SEGMENT_PILLS;
  const vis = items.slice(0, max);
  const rest = items.length - vis.length;

  const pillClass =
    variant === "brand"
      ? "inline-flex items-center rounded-full border border-info/20 bg-info/10 px-2 py-0.5 text-xs font-medium text-info dark:border-info/30 dark:bg-info/10 dark:text-info"
      : "inline-flex items-center rounded-full border border-orange-200/80 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-950 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-100";

  return (
    <div className="flex flex-wrap gap-1.5">
      {vis.map((label) => (
        <span key={label} className={pillClass}>
          {label}
        </span>
      ))}
      {rest > 0 ? (
        <Badge variant="secondary" className="font-normal">
          {moreLabel(rest)}
        </Badge>
      ) : null}
    </div>
  );
}
