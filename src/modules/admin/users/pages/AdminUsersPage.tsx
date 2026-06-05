import { Pencil, Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useMemo, useState } from "react";

import { AdminUsersFiltersPopover } from "@/modules/admin/users/components/AdminUsersFiltersPopover";
import { UserEditSheet } from "@/modules/admin/users/components/UserEditSheet";
import { INITIAL_ADMIN_USERS } from "@/modules/admin/users/data/adminUserMocks";
import {
  ADMIN_USERS_PAGE_SIZE_OPTIONS,
  ADMIN_USER_PROFILE_OPTIONS,
  ADMIN_USER_STATUS_OPTIONS,
  adminUsersFilterParsers,
  parseFilterList,
  serializeFilterList,
} from "@/modules/admin/users/lib/admin-users-filters";
import type { AdminUser, AdminUserFormValues, AdminUserProfile, AdminUserStatus } from "@/modules/admin/users/types";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

function statusBadgeClass(status: AdminUser["status"]) {
  return status === "active"
    ? "border-success/20 bg-success/10 text-success"
    : "border-muted bg-muted/50 text-muted-foreground";
}

export function AdminUsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [query, setQuery] = useQueryStates(adminUsersFilterParsers);

  const { q, page, pageSize, userId, status: statusParam, profile: profileParam } = query;

  const statusFilters = useMemo(
    () => parseFilterList(statusParam, ADMIN_USER_STATUS_OPTIONS),
    [statusParam],
  );
  const profileFilters = useMemo(
    () => parseFilterList(profileParam, ADMIN_USER_PROFILE_OPTIONS),
    [profileParam],
  );

  const setStatusFilters = (next: AdminUserStatus[]) => {
    void setQuery({ status: serializeFilterList(next), page: 1 });
  };

  const setProfileFilters = (next: AdminUserProfile[]) => {
    void setQuery({ profile: serializeFilterList(next), page: 1 });
  };

  const clearAllFilters = () => {
    void setQuery({ q: "", status: null, profile: null, page: 1 });
  };

  const hasActiveFilters = Boolean(q.trim()) || statusFilters.length > 0 || profileFilters.length > 0;

  const filteredRows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((row) => {
      if (statusFilters.length > 0 && !statusFilters.includes(row.status)) return false;
      if (profileFilters.length > 0 && !profileFilters.includes(row.profile)) return false;
      if (!term) return true;
      return (
        row.name.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term) ||
        row.phone.includes(term) ||
        t(`modules.admin.users.profile.${row.profile}`).toLowerCase().includes(term)
      );
    });
  }, [users, q, statusFilters, profileFilters, t]);

  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(pageStart, pageStart + pageSize);
  const fromRow = totalRows === 0 ? 0 : pageStart + 1;
  const toRow = totalRows === 0 ? 0 : Math.min(pageStart + pageSize, totalRows);

  const pageItems = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const items = [1];
    if (currentPage > 3) items.push(-1);
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p += 1) {
      items.push(p);
    }
    if (currentPage < totalPages - 2) items.push(-2);
    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  const editingUser = userId ? (users.find((u) => u.id === userId) ?? null) : null;
  const sheetOpen = Boolean(userId && editingUser);

  const openEdit = (id: string) => {
    void setQuery({ userId: id });
  };

  const closeEdit = () => {
    void setQuery({ userId: null });
  };

  const handleSave = (id: string, values: AdminUserFormValues) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...values } : u)));
  };

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.admin.users.title")}
      subtitle={t("modules.admin.users.description")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => void setQuery({ q: e.target.value, page: 1 })}
              placeholder={t("modules.admin.users.searchPlaceholder")}
              className="pl-9"
              aria-label={t("modules.admin.users.searchPlaceholder")}
            />
          </div>
          <div className="flex items-center gap-2">
            <AdminUsersFiltersPopover
              statusFilters={statusFilters}
              profileFilters={profileFilters}
              onStatusFiltersChange={setStatusFilters}
              onProfileFiltersChange={setProfileFilters}
            />
            {hasActiveFilters ? (
              <Button type="button" variant="ghost" size="sm" onClick={clearAllFilters}>
                {t("modules.admin.users.filters.clearAll")}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("modules.admin.users.table.name")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("modules.admin.users.table.email")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("modules.admin.users.table.phone")}</TableHead>
                <TableHead>{t("modules.admin.users.table.profile")}</TableHead>
                <TableHead>{t("modules.admin.users.table.status")}</TableHead>
                <TableHead className="w-[100px] text-right">{t("modules.admin.users.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t("modules.admin.users.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{row.email}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{row.phone}</TableCell>
                    <TableCell>{t(`modules.admin.users.profile.${row.profile}`)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(row.status)}>
                        {t(`modules.admin.users.status.${row.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => openEdit(row.id)}
                      >
                        <Pencil className="size-3.5" />
                        {t("modules.admin.users.edit.action")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("modules.admin.users.pagination.rowsPerPage")}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => void setQuery({ pageSize: Number(value), page: 1 })}
            >
              <SelectTrigger className="h-8 w-[84px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_USERS_PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("modules.admin.users.pagination.range", {
              from: fromRow,
              to: toRow,
              total: totalRows,
            })}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void setQuery({ page: Math.max(1, currentPage - 1) })}
              disabled={currentPage === 1}
            >
              {t("common.pagination.previous")}
            </Button>
            {pageItems.map((item, idx) =>
              item < 0 ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={item === currentPage ? "default" : "outline"}
                  onClick={() => void setQuery({ page: item })}
                  className={cn("min-w-9", item === currentPage && "text-white")}
                >
                  {item}
                </Button>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void setQuery({ page: Math.min(totalPages, currentPage + 1) })}
              disabled={currentPage === totalPages}
            >
              {t("common.pagination.next")}
            </Button>
          </div>
        </div>
      </div>

      <UserEditSheet
        user={editingUser}
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
        onSave={handleSave}
      />
    </DashboardPageLayout>
  );
}
