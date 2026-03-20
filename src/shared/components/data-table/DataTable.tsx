import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type Updater,
} from "@tanstack/react-table";
import * as React from "react";

import { cn } from "@/shared/lib/utils";
import { Checkbox } from "@/shared/ui/checkbox";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import {
  DataTablePagination,
  type DataTablePaginationChange,
  type DataTablePaginationLabels,
} from "./DataTablePagination";
import type { DataTableResult } from "./types";

export type DataTableProps<T> = {
  columns: ColumnDef<T, unknown>[];
  result: DataTableResult<T>;
  page: number;
  pageSize: number;
  onPaginationChange: (update: DataTablePaginationChange) => void;
  isLoading?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  hidePagination?: boolean;
  /** Identificador estável da linha (obrigatório se usar seleção). */
  getRowId?: (row: T, index: number) => string;
  emptyMessage?: string;
  /** Ex.: `border-0` quando a tabela já está dentro de um card (evita caixa dentro da caixa). */
  tableContainerClassName?: string;
  paginationLabels?: Partial<DataTablePaginationLabels>;
};

function resolveRowId<T>(row: T, index: number, getRowId?: (row: T, i: number) => string): string {
  if (getRowId) return getRowId(row, index);
  const r = row as Record<string, unknown>;
  if (r?.id != null) return String(r.id);
  if (r?.key != null) return String(r.key);
  return String(index);
}

export function DataTable<T>({
  columns,
  result,
  page,
  pageSize,
  onPaginationChange,
  isLoading = false,
  onSelectionChange,
  hidePagination = false,
  getRowId,
  emptyMessage = "Nenhum registro.",
  tableContainerClassName,
  paginationLabels,
}: DataTableProps<T>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const selectionColumn = React.useMemo<ColumnDef<T, unknown> | null>(() => {
    if (!onSelectionChange) return null;
    return {
      id: "__select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Selecionar todas nesta página"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Selecionar linha"
        />
      ),
      size: 40,
    };
  }, [onSelectionChange]);

  const tableColumns = React.useMemo(() => {
    if (selectionColumn) return [selectionColumn, ...columns];
    return columns;
  }, [columns, selectionColumn]);

  const pageCount = Math.max(1, Math.ceil((result.total || 0) / pageSize) || 1);
  const pageIndex = Math.min(Math.max(0, page - 1), pageCount - 1);

  const table = useReactTable({
    data: result.data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: { pageIndex, pageSize },
      rowSelection,
    },
    onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
      setRowSelection((prev) => (typeof updater === "function" ? updater(prev) : updater));
    },
    enableRowSelection: !!onSelectionChange,
    getRowId: (row, index) => resolveRowId(row, index, getRowId),
  });

  React.useEffect(() => {
    if (!onSelectionChange) return;
    const selected: T[] = [];
    result.data.forEach((row, index) => {
      const id = resolveRowId(row, index, getRowId);
      if (rowSelection[id]) selected.push(row);
    });
    onSelectionChange(selected);
  }, [rowSelection, result.data, onSelectionChange, getRowId]);

  React.useEffect(() => {
    setRowSelection({});
  }, [page, pageSize]);

  const showPagination = !hidePagination && result.total > 0;

  return (
    <div className="flex flex-col gap-4" data-testid="data-table">
      <div className={cn("rounded-md border", tableContainerClassName)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {tableColumns.map((col) => (
                    <TableCell key={String(col.id ?? (col as { accessorKey?: string }).accessorKey ?? i)}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-left text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          total={result.total}
          onChange={onPaginationChange}
          labels={paginationLabels}
        />
      )}
    </div>
  );
}
