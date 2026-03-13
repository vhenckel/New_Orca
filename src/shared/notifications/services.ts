import { getDefaultCompanyId } from "@/shared/config/env";
import { spotJson } from "@/shared/api/http-client";
import type { NotificationsResponse } from "@/shared/notifications/types";

const NOTIFICATIONS_PATH = "/notifications";

export async function fetchNotifications(includeRead = false, companyId?: number): Promise<NotificationsResponse> {
  const id = companyId ?? getDefaultCompanyId();
  const search = new URLSearchParams({
    companyId: String(id),
    includeRead: includeRead ? "true" : "false",
  });
  return spotJson<NotificationsResponse>(`${NOTIFICATIONS_PATH}?${search.toString()}`);
}

export async function markNotificationRead(notificationId: string, companyId?: number): Promise<{ success: boolean }> {
  const id = companyId ?? getDefaultCompanyId();
  return spotJson<{ success: boolean }>(`${NOTIFICATIONS_PATH}/${notificationId}/read?companyId=${id}`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead(companyId?: number): Promise<{ count: number }> {
  const id = companyId ?? getDefaultCompanyId();
  return spotJson<{ count: number }>(`${NOTIFICATIONS_PATH}/mark-all-read?companyId=${id}`, {
    method: "PATCH",
  });
}

