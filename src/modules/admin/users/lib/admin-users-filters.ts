import { parseAsInteger, parseAsString } from "nuqs";

import {
  USERS_LIST_DEFAULT_PARAMS,
  type FetchUsersListParams,
  type SortOrder,
  type UserSortField,
} from "@/modules/admin/users/types";
import { profileToRole } from "@/modules/admin/users/lib/admin-user-mappers";
import type { AdminUserProfile, AdminUserStatus } from "@/modules/admin/users/types";

export const ADMIN_USERS_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const ADMIN_USER_PROFILE_OPTIONS: AdminUserProfile[] = [
  "establishment",
  "supplier",
  "administrative",
];

export const ADMIN_USER_STATUS_OPTIONS: AdminUserStatus[] = ["active", "inactive"];

export const adminUsersFilterParsers = {
  name: parseAsString.withDefault(""),
  email: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(USERS_LIST_DEFAULT_PARAMS.totalPerPage),
  userId: parseAsString,
  status: parseAsString.withDefault(""),
  profile: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  order: parseAsString.withDefault(""),
};

export const adminUsersFilterUrlKeys = {
  name: "usr_name",
  email: "usr_email",
  page: "usr_page",
  pageSize: "usr_pageSize",
  userId: "usr_userId",
  status: "usr_status",
  profile: "usr_profile",
  sort: "usr_sort",
  order: "usr_order",
} as const;

export type AdminUsersListQueryState = {
  name: string;
  email: string;
  page: number;
  pageSize: number;
  userId: string | null;
  status: string;
  profile: string;
  sort: string;
  order: string;
};

export function toUsersFetchParams(query: AdminUsersListQueryState): FetchUsersListParams {
  const params: FetchUsersListParams = {
    page: query.page,
    totalPerPage: query.pageSize,
    sort: (query.sort as UserSortField) || USERS_LIST_DEFAULT_PARAMS.sort,
    order: (query.order as SortOrder) || USERS_LIST_DEFAULT_PARAMS.order,
  };

  if (query.name.trim()) params.name = query.name.trim();
  if (query.email.trim()) params.email = query.email.trim();
  if (query.status === "active") params.active = true;
  if (query.status === "inactive") params.active = false;
  if (query.profile && ADMIN_USER_PROFILE_OPTIONS.includes(query.profile as AdminUserProfile)) {
    params.role = profileToRole(query.profile as AdminUserProfile);
  }

  return params;
}

export function countActiveUserFilters(query: Pick<AdminUsersListQueryState, "name" | "email" | "status" | "profile">): number {
  let count = 0;
  if (query.name.trim()) count += 1;
  if (query.email.trim()) count += 1;
  if (query.status) count += 1;
  if (query.profile) count += 1;
  return count;
}

export function clearUserListFilters(): Pick<AdminUsersListQueryState, "name" | "email" | "status" | "profile"> {
  return {
    name: "",
    email: "",
    status: "",
    profile: "",
  };
}

export function toggleSort(
  currentSort: string,
  currentOrder: string,
  field: UserSortField,
): { sort: string; order: SortOrder } {
  if (currentSort !== field) return { sort: field, order: "ASC" };
  return { sort: field, order: currentOrder === "ASC" ? "DESC" : "ASC" };
}
