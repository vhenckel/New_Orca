export interface NotificationMetadata {
  contactId?: string;
  reasonName?: string;
  [key: string]: unknown;
}

export interface NotificationItem {
  id: string;
  userId: number;
  companyId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  expiresAt: string | null;
  metadata?: NotificationMetadata;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  totalCount: number;
}

