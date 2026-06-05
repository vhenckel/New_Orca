import { getStoredUser } from "@/shared/auth/token-store";
import type { ApiUser, ApiUserRole } from "@/shared/auth/types";

export function useApiUser(): ApiUser | null {
  return getStoredUser();
}

export function useApiUserRole(): ApiUserRole | null {
  return getStoredUser()?.role ?? null;
}
