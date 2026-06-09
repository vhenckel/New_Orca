import type {
  CreateUserPayload,
  FetchUsersListParams,
  UpdateUserPayload,
  UserDto,
  UsersListPage,
} from "@/modules/admin/users/types";
import { apiRequest, apiRequestBlob } from "@/shared/api/http-client";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

function appendUsersFilterParams(
  search: URLSearchParams,
  params: Omit<FetchUsersListParams, "page">,
): void {
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.email?.trim()) search.set("email", params.email.trim());
  if (params.role) search.set("role", params.role);
  if (params.active !== undefined) search.set("active", String(params.active));
}

function buildUsersQuery(params: FetchUsersListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("totalPerPage", String(params.totalPerPage ?? DEFAULT_PAGE_SIZE));
  appendUsersFilterParams(search, params);
  return search.toString();
}

function buildUsersCopyQuery(params: Omit<FetchUsersListParams, "page" | "totalPerPage">): string {
  const search = new URLSearchParams();
  appendUsersFilterParams(search, params);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchUsersPage(params: FetchUsersListParams): Promise<UsersListPage> {
  return apiRequest<UsersListPage>(`/users?${buildUsersQuery(params)}`);
}

export async function fetchUserById(id: string): Promise<UserDto> {
  return apiRequest<UserDto>(`/users/${id}`);
}

export async function copyUsersTsv(
  params: Omit<FetchUsersListParams, "page" | "totalPerPage">,
): Promise<string> {
  const blob = await apiRequestBlob(`/users/copy${buildUsersCopyQuery(params)}`);
  return blob.text();
}

export async function createUser(payload: CreateUserPayload): Promise<UserDto> {
  return apiRequest<UserDto>("/users", {
    method: "POST",
    body: payload,
  });
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserDto> {
  return apiRequest<UserDto>(`/users/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(`/users/${id}`, {
    method: "DELETE",
  });
}
