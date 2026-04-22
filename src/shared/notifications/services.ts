import { getCompanyIdFromToken } from "@/shared/auth/jwt";
import { getStoredToken } from "@/shared/auth/token-store";
import { getDefaultCompanyId } from "@/shared/config/env";
import type { NotificationItem, NotificationsResponse } from "@/shared/notifications/types";

/** CompanyId da sessão (token → default do env), para query keys e mocks. */
export function resolveSessionCompanyId(override?: number): number {
  if (override != null) return override;
  const token = getStoredToken();
  return token ? (getCompanyIdFromToken(token) ?? getDefaultCompanyId()) : getDefaultCompanyId();
}

const initialNotifications: NotificationItem[] = [
  {
    id: "n-001",
    userId: 1,
    companyId: "316",
    type: "quotation",
    title: "Orçamento atualizado",
    message: "O orçamento #142 recebeu nova resposta de fornecedor.",
    read: false,
    createdAt: new Date().toISOString(),
    expiresAt: null,
  },
  {
    id: "n-002",
    userId: 1,
    companyId: "316",
    type: "supplier",
    title: "Fornecedor cadastrado",
    message: "Novo fornecedor adicionado na base Orca.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    expiresAt: null,
  },
];

let notificationsStore: NotificationItem[] = [...initialNotifications];

function buildResponse(includeRead: boolean): NotificationsResponse {
  const all = includeRead ? notificationsStore : notificationsStore.filter((n) => !n.read);
  return {
    notifications: all,
    unreadCount: notificationsStore.filter((n) => !n.read).length,
    totalCount: notificationsStore.length,
  };
}

export async function fetchNotifications(includeRead = false, companyId?: number): Promise<NotificationsResponse> {
  void resolveSessionCompanyId(companyId);
  return Promise.resolve(buildResponse(includeRead));
}

export async function markNotificationRead(notificationId: string, companyId?: number): Promise<{ success: boolean }> {
  void resolveSessionCompanyId(companyId);
  notificationsStore = notificationsStore.map((notification) =>
    notification.id === notificationId ? { ...notification, read: true } : notification,
  );
  return Promise.resolve({ success: true });
}

export async function markAllNotificationsRead(companyId?: number): Promise<{ count: number }> {
  void resolveSessionCompanyId(companyId);
  const count = notificationsStore.filter((n) => !n.read).length;
  notificationsStore = notificationsStore.map((notification) => ({ ...notification, read: true }));
  return Promise.resolve({ count });
}

