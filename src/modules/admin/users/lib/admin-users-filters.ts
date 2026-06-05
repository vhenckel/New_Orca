import { parseAsInteger, parseAsString } from "nuqs";

import type { AdminUserProfile, AdminUserStatus } from "@/modules/admin/users/types";

export const ADMIN_USERS_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const ADMIN_USER_PROFILE_OPTIONS: AdminUserProfile[] = [
  "establishment",
  "supplier",
  "administrative",
];

export const ADMIN_USER_STATUS_OPTIONS: AdminUserStatus[] = ["active", "inactive"];

export const adminUsersFilterParsers = {
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  userId: parseAsString,
  status: parseAsString.withDefault(""),
  profile: parseAsString.withDefault(""),
};

export function parseFilterList<T extends string>(value: string, allowed: readonly T[]): T[] {
  if (!value) return [];
  return value.split(",").filter((item): item is T => allowed.includes(item as T));
}

export function serializeFilterList<T extends string>(items: T[]): string | null {
  return items.length > 0 ? items.join(",") : null;
}
