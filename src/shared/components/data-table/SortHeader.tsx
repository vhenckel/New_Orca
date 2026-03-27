import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export type SortDirection = "ASC" | "DESC";

type SortHeaderProps = {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  className?: string;
  /**
   * `compact`: uma linha, largura intrínseca (como listas financeiras) — evita header full-width em colunas estreitas com `table-fixed`.
   * `default`: label pode quebrar; ocupa a célula (colunas largas).
   */
  variant?: "default" | "compact";
};

export function SortHeader({
  label,
  active,
  direction,
  onClick,
  className,
  variant = "default",
}: SortHeaderProps) {
  const Icon = !active ? ArrowUpDown : direction === "ASC" ? ArrowUp : ArrowDown;

  if (variant === "compact") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "-ml-3 h-auto min-h-8 shrink-0 px-2 font-medium text-muted-foreground hover:text-foreground",
          className,
        )}
        onClick={onClick}
      >
        {label}
        <Icon data-icon="inline-end" aria-hidden />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-auto min-h-8 w-full min-w-0 max-w-full items-start justify-start gap-2 whitespace-normal px-2 py-1.5 text-left font-medium text-muted-foreground hover:text-foreground",
        className,
      )}
      onClick={onClick}
    >
      <span className="min-w-0 flex-1 break-words text-left leading-snug">{label}</span>
      <Icon data-icon="inline-end" aria-hidden />
    </Button>
  );
}
