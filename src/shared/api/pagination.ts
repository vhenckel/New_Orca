/** Resposta paginada padrão da API Orca. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPerPage: number;
  maxPerPage: number;
}

export const DEFAULT_PAGE_SIZE = 15;
