export type AdminUserProfile = "establishment" | "supplier" | "administrative";

export type AdminUserStatus = "active" | "inactive";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile: AdminUserProfile;
  status: AdminUserStatus;
}

export type AdminUserFormValues = Omit<AdminUser, "id">;
