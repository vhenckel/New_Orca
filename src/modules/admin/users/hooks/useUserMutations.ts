import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createUser,
  deleteUser,
  updateUser,
} from "@/modules/admin/users/api/users-api";
import { userDetailQueryKey } from "@/modules/admin/users/hooks/useUserDetailQuery";
import { usersQueryKey } from "@/modules/admin/users/hooks/useUsersQuery";
import type {
  CreateUserPayload,
  FetchUsersListParams,
  UpdateUserPayload,
} from "@/modules/admin/users/types";

export function useUserMutations(listParams?: FetchUsersListParams) {
  const queryClient = useQueryClient();
  const listKey = listParams ? usersQueryKey(listParams) : ["users", "list"];

  const invalidate = async (detailId?: string) => {
    await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    if (detailId) {
      await queryClient.invalidateQueries({ queryKey: userDetailQueryKey(detailId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => invalidate(),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    listKey,
  };
}
