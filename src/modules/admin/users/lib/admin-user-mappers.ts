import type {
  AdminUser,
  AdminUserProfile,
  AdminUserStatus,
  CreateUserPayload,
  UpdateUserPayload,
  UserDto,
} from "@/modules/admin/users/types";
import type { ApiUserRole } from "@/shared/auth/types";

export function roleToProfile(role: ApiUserRole): AdminUserProfile {
  if (role === "admin") return "administrative";
  return role;
}

export function profileToRole(profile: AdminUserProfile): ApiUserRole {
  if (profile === "administrative") return "admin";
  return profile;
}

export function activeToStatus(active: boolean): AdminUserStatus {
  return active ? "active" : "inactive";
}

export function statusToActive(status: AdminUserStatus): boolean {
  return status === "active";
}

export function mapUserDtoToAdminUser(dto: UserDto): AdminUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? "",
    profile: roleToProfile(dto.role),
    status: activeToStatus(dto.active),
    role: dto.role,
  };
}

export function toUpdateUserPayload(values: {
  name: string;
  phone: string;
  active: boolean;
}): UpdateUserPayload {
  const phone = values.phone.trim();
  return {
    name: values.name.trim(),
    active: values.active,
    ...(phone ? { phone } : {}),
  };
}

export function toCreateUserPayload(values: {
  name: string;
  email: string;
  phone: string;
}): CreateUserPayload {
  const phone = values.phone.trim();
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    ...(phone ? { phone } : {}),
  };
}

export function isUserNameEditable(role: ApiUserRole): boolean {
  return role === "admin";
}

export function isUserDeletable(role: ApiUserRole): boolean {
  return role === "admin";
}
