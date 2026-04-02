import { useEffect, useRef } from "react";

/**
 * Reseta página para 1 quando startDate/endDate mudam (ignora o primeiro mount).
 * `setPagination` não entra nas deps — no nuqs ele muda a cada render e faria reset a cada re-render.
 * `listRangeKey` — ex.: `full` ou `period` quando a listagem usa `range=full` na URL.
 */
export function useResetPaginationOnDateRangeChange(
  startDate: string,
  endDate: string,
  setPagination: (u: { page?: number }) => void,
  listRangeKey?: string | null,
) {
  const seen = useRef(false);
  const setPageRef = useRef(setPagination);
  setPageRef.current = setPagination;

  useEffect(() => {
    if (!seen.current) {
      seen.current = true;
      return;
    }
    setPageRef.current({ page: 1 });
  }, [startDate, endDate, listRangeKey]);
}
