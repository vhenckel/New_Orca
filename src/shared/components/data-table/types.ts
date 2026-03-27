export type { ColumnDef } from "@tanstack/react-table";

export type TableFilter = {
  page: number;
  pageSize: number;
};

export type DataTableResult<T> = {
  data: T[];
  total: number;
};

/** Metadados opcionais em `ColumnDef.meta` para alinhar células/headers no DataTable. */
export type DataTableColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
};

/** Opções padrão de linhas por página (alinhado ao plano). */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

