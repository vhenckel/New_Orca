import { useQuery } from "@tanstack/react-query";

import { fetchUsersPage } from "@/modules/admin/users/api/users-api";
import type { FetchUsersListParams } from "@/modules/admin/users/types";

export function usersQueryKey(params: FetchUsersListParams) {
  return ["users", "list", params] as const;
}

export function useUsersQuery(
  params: FetchUsersListParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: usersQueryKey(params),
    queryFn: () => fetchUsersPage(params),
    enabled: options?.enabled ?? true,
  });
}
