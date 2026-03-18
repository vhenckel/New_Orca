import { ChevronRight } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

import type { FilterConfig } from "./types";

interface FilterCategoryProps {
  filter: FilterConfig;
  isHovered: boolean;
  isSelected: boolean;
  count: number;
  onHover: (filter: FilterConfig | null) => void;
  onClick: (filter: FilterConfig) => void;
}

export function FilterCategory({
  filter,
  isHovered,
  isSelected,
  count,
  onHover,
  onClick,
}: FilterCategoryProps) {
  const active = isSelected || isHovered;
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
        active ? "bg-accent" : "hover:bg-accent/60",
      )}
      onMouseEnter={() => onHover(filter)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(filter)}
    >
      <span className="flex-1 text-sm font-medium text-foreground">{filter.label}</span>
      <span className="flex items-center gap-2">
        {count > 0 && (
          <Badge
            variant={isSelected ? "outline" : "secondary"}
            className="h-6 min-w-6 justify-center rounded-full px-2 py-0 text-xs font-semibold"
          >
            {count}
          </Badge>
        )}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </span>
    </button>
  );
}
