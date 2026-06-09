import type { ApiUserRole } from "@/shared/auth/types";

export type AdminUserProfile = "establishment" | "supplier" | "administrative";

export type AdminUserStatus = "active" | "inactive";

export type UserSortField = "name" | "email" | "active";
export type SortOrder = "ASC" | "DESC";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: ApiUserRole;
  active: boolean;
  phone?: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile: AdminUserProfile;
  status: AdminUserStatus;
  role: ApiUserRole;
}

export interface UsersListPage {
  data: UserDto[];
  total: number;
  page: number;
  totalPerPage: number;
  maxPerPage: number;
}

export interface FetchUsersListParams {
  page: number;
  totalPerPage?: number;
  name?: string;
  email?: string;
  role?: ApiUserRole;
  active?: boolean;
  sort?: UserSortField;
  order?: SortOrder;
}

export const USERS_LIST_DEFAULT_PARAMS = {
  totalPerPage: 10,
  sort: "name" as UserSortField,
  order: "ASC" as SortOrder,
};

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateUserPayload {
  name: string;
  phone?: string;
  active: boolean;
}

export interface AdminUserEditFormValues {
  name: string;
  phone: string;
  active: boolean;
}

export interface AdminUserCreateFormValues {
  name: string;
  email: string;
  phone: string;
}
