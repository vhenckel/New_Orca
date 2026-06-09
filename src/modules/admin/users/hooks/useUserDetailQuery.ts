import { useQuery } from "@tanstack/react-query";

import { fetchUserById } from "@/modules/admin/users/api/users-api";

export function userDetailQueryKey(id: string) {
  return ["users", "detail", id] as const;
}

export function useUserDetailQuery(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userDetailQueryKey(id ?? ""),
    queryFn: () => fetchUserById(id!),
    enabled: (options?.enabled ?? true) && Boolean(id),
    retry: false,
  });
}
