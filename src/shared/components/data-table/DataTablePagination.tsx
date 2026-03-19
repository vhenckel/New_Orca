import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";
import { Field, FieldLabel } from "@/shared/ui/field";
import { cn } from "@/shared/lib/utils";

import { DEFAULT_PAGE_SIZE_OPTIONS } from "./types";

/** Parcial de estado de paginação enviado ao pai. */
export type DataTablePaginationChange = {
  page?: number;
  pageSize?: number;
};

/**
 * Rótulos padrão (EN + PT misto). Sobrescreva via prop `labels` no DataTable / DataTablePagination.
 */
export const defaultPaginationLabels = {
  previous: "Previous",
  next: "Next",
  rowsPerPage: "Linhas por página",
  range: (from: number, to: number, total: number) => `${from}–${to} de ${total} itens`,
};

export type DataTablePaginationLabels = typeof defaultPaginationLabels;

type DataTablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (update: DataTablePaginationChange) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
  labels?: Partial<DataTablePaginationLabels>;
};

/**
 * Lista de páginas a exibir + marcadores `"ellipsis"`.
 * @param current — página atual (1-based)
 * @param totalPages — total de páginas
 */
function buildPageItems(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pageNumbers = new Set<number>([1, totalPages]);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= totalPages) pageNumbers.add(p);
  }

  const segments: (number | "ellipsis")[] = [];
  let previousPage = 0;
  for (const p of [...pageNumbers].sort((a, b) => a - b)) {
    if (p - previousPage > 1) segments.push("ellipsis");
    segments.push(p);
    previousPage = p;
  }
  return segments;
}

/** Estado desativado em links `<a>` da paginação (sem `href` real). */
const disabledNavLinkClass = "pointer-events-none aria-disabled:opacity-50";

function preventAndRun(e: React.MouseEvent, disabled: boolean, run: () => void) {
  e.preventDefault();
  if (!disabled) run();
}

/** Paginação server-side: números + ellipsis, linhas por página, intervalo de itens. */
export function DataTablePagination({
  page,
  pageSize,
  total,
  onChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
  labels: labelsOverride = {},
}: DataTablePaginationProps) {
  const labels = { ...defaultPaginationLabels, ...labelsOverride };
  /** Evita divisão por zero / Infinity; não altera o valor exibido no Select. */
  const take = pageSize > 0 ? pageSize : (pageSizeOptions[0] ?? 10);
  const pageCount = Math.max(1, Math.ceil(total / take));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const from = total === 0 ? 0 : (safePage - 1) * take + 1;
  const to = Math.min(safePage * take, total);
  const items = buildPageItems(safePage, pageCount);

  const isPrevDisabled = safePage <= 1;
  const isNextDisabled = safePage >= pageCount;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-border/60 px-4 pb-6 pt-5 sm:px-5 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
      data-testid="data-table-pagination"
    >
      <Field orientation="horizontal" className="w-fit gap-2">
        <FieldLabel className="whitespace-nowrap text-muted-foreground">
          {labels.rowsPerPage}
        </FieldLabel>
        <Select
          value={String(pageSize > 0 ? pageSize : take)}
          onValueChange={(v) => onChange({ page: 1, pageSize: Number(v) })}
        >
          <SelectTrigger className="h-8 w-[4.5rem]" aria-label={labels.rowsPerPage}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="whitespace-nowrap pl-2 text-sm text-muted-foreground">
          {labels.range(from, to, total)}
        </span>
      </Field>

      <Pagination className="mx-0 w-full justify-center lg:w-auto lg:justify-end">
        <PaginationContent className="flex-wrap justify-center">
          <PaginationItem>
            <PaginationPrevious
              text={labels.previous}
              aria-disabled={isPrevDisabled}
              className={cn(isPrevDisabled && disabledNavLinkClass)}
              onClick={(e) =>
                preventAndRun(e, isPrevDisabled, () => onChange({ page: safePage - 1 }))
              }
            />
          </PaginationItem>

          {items.map((item, i) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-before-${items[i + 1]}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  isActive={item === safePage}
                  aria-label={`Página ${item}`}
                  onClick={(e) => preventAndRun(e, false, () => onChange({ page: item }))}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              text={labels.next}
              aria-disabled={isNextDisabled}
              className={cn(isNextDisabled && disabledNavLinkClass)}
              onClick={(e) =>
                preventAndRun(e, isNextDisabled, () => onChange({ page: safePage + 1 }))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
