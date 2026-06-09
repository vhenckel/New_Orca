import { ArrowUpDown, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { copyUsersTsv } from "@/modules/admin/users/api/users-api";
import { AdminUsersFiltersPopover } from "@/modules/admin/users/components/AdminUsersFiltersPopover";
import { AdminUsersListSkeleton } from "@/modules/admin/users/components/AdminUsersListSkeleton";
import { UserDeleteConfirmDialog } from "@/modules/admin/users/components/UserDeleteConfirmDialog";
import { UserEditSheet } from "@/modules/admin/users/components/UserEditSheet";
import { useUserDetailQuery } from "@/modules/admin/users/hooks/useUserDetailQuery";
import { useUserMutations } from "@/modules/admin/users/hooks/useUserMutations";
import { useUsersQuery } from "@/modules/admin/users/hooks/useUsersQuery";
import {
  isUserDeletable,
  mapUserDtoToAdminUser,
  toUpdateUserPayload,
} from "@/modules/admin/users/lib/admin-user-mappers";
import {
  ADMIN_USERS_PAGE_SIZE_OPTIONS,
  adminUsersFilterParsers,
  adminUsersFilterUrlKeys,
  clearUserListFilters,
  countActiveUserFilters,
  toggleSort,
  toUsersFetchParams,
} from "@/modules/admin/users/lib/admin-users-filters";
import type { AdminUser, AdminUserEditFormValues, UserSortField } from "@/modules/admin/users/types";
import { ApiError } from "@/shared/api/http-client";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { toast } from "@/shared/ui/sonner";

function statusBadgeClass(status: AdminUser["status"]) {
  return status === "active"
    ? "border-success/20 bg-success/10 text-success"
    : "border-muted bg-muted/50 text-muted-foreground";
}

export function AdminUsersPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const role = useApiUserRole();
  const [copying, setCopying] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const [query, setQuery] = useQueryStates(adminUsersFilterParsers, {
    urlKeys: adminUsersFilterUrlKeys,
  });

  const fetchParams = useMemo(() => toUsersFetchParams(query), [query]);
  const listQuery = useUsersQuery(fetchParams, { enabled: role === "admin" });
  const { updateMutation, deleteMutation } = useUserMutations(fetchParams);

  const detailQuery = useUserDetailQuery(query.userId ?? undefined, {
    enabled: role === "admin" && Boolean(query.userId),
  });

  const rows = useMemo(
    () => (listQuery.data?.data ?? []).map(mapUserDtoToAdminUser),
    [listQuery.data?.data],
  );

  const editingUser = useMemo(() => {
    if (!query.userId) return null;
    if (detailQuery.data) return mapUserDtoToAdminUser(detailQuery.data);
    return rows.find((u) => u.id === query.userId) ?? null;
  }, [detailQuery.data, query.userId, rows]);

  const totalRows = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / query.pageSize));
  const currentPage = Math.min(query.page, totalPages);
  const fromRow = totalRows === 0 ? 0 : (currentPage - 1) * query.pageSize + 1;
  const toRow = totalRows === 0 ? 0 : Math.min(currentPage * query.pageSize, totalRows);
  const activeFilterCount = countActiveUserFilters(query);

  useEffect(() => {
    if (listQuery.isError) {
      toast.error(t("modules.admin.users.list.toast.loadError"));
    }
  }, [listQuery.isError, t]);

  useEffect(() => {
    if (currentPage !== query.page) {
      void setQuery({ page: currentPage });
    }
  }, [currentPage, query.page, setQuery]);

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

  if (role !== "admin") {
    return <Navigate to="/404" replace />;
  }

  const handleToggleSort = (field: UserSortField) => {
    const next = toggleSort(query.sort, query.order, field);
    void setQuery({ sort: next.sort, order: next.order, page: 1 });
  };

  const clearAllFilters = () => {
    const cleared = clearUserListFilters();
    void setQuery({ ...cleared, page: 1 });
  };

  const openEdit = (id: string) => {
    void setQuery({ userId: id });
  };

  const closeEdit = () => {
    void setQuery({ userId: null });
  };

  const handleSave = (id: string, values: AdminUserEditFormValues) => {
    updateMutation.mutate(
      { id, payload: toUpdateUserPayload(values) },
      {
        onSuccess: () => {
          toast.success(t("modules.admin.users.form.toast.updateSuccess"));
          closeEdit();
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : t("modules.admin.users.form.toast.updateError");
          toast.error(message);
        },
      },
    );
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      const { page: _page, totalPerPage: _size, ...copyParams } = fetchParams;
      const tsv = await copyUsersTsv(copyParams);
      await navigator.clipboard.writeText(tsv);
      toast.success(t("modules.admin.users.list.toast.copySuccess"));
    } catch {
      toast.error(t("modules.admin.users.list.toast.copyError"));
    } finally {
      setCopying(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t("modules.admin.users.list.toast.deleteSuccess"));
        setDeleteTarget(null);
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : t("modules.admin.users.list.toast.deleteError");
        toast.error(message);
      },
    });
  };

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={copying}
        onClick={() => void handleCopy()}
      >
        <Copy className="size-4" />
        {t("modules.admin.users.list.copy")}
      </Button>
      <Button type="button" className="gap-2 text-white" onClick={() => navigate("/admin/users/create")}>
        <Plus className="size-4" />
        {t("modules.admin.users.list.add")}
      </Button>
    </div>
  );

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.admin.users.title")}
      subtitle={t("modules.admin.users.description")}
      headerActions={headerActions}
    >
      {listQuery.isLoading ? (
        <AdminUsersListSkeleton />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-2">
              <AdminUsersFiltersPopover
                name={query.name}
                email={query.email}
                status={query.status}
                profile={query.profile}
                activeFilterCount={activeFilterCount}
                onNameChange={(value) => void setQuery({ name: value, page: 1 })}
                onEmailChange={(value) => void setQuery({ email: value, page: 1 })}
                onStatusChange={(value) => void setQuery({ status: value || null, page: 1 })}
                onProfileChange={(value) => void setQuery({ profile: value || null, page: 1 })}
              />
              {activeFilterCount > 0 ? (
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
                  <TableHead>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 gap-1 font-medium"
                      onClick={() => handleToggleSort("name")}
                    >
                      {t("modules.admin.users.table.name")}
                      <ArrowUpDown className="size-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 gap-1 font-medium"
                      onClick={() => handleToggleSort("email")}
                    >
                      {t("modules.admin.users.table.email")}
                      <ArrowUpDown className="size-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">{t("modules.admin.users.table.phone")}</TableHead>
                  <TableHead>{t("modules.admin.users.table.profile")}</TableHead>
                  <TableHead>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 gap-1 font-medium"
                      onClick={() => handleToggleSort("active")}
                    >
                      {t("modules.admin.users.table.status")}
                      <ArrowUpDown className="size-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[140px] text-right">{t("modules.admin.users.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {t("modules.admin.users.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const canDelete = isUserDeletable(row.role);
                    return (
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
                          <div className="flex justify-end gap-1">
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      disabled={!canDelete}
                                      onClick={() => setDeleteTarget(row)}
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                {!canDelete ? (
                                  <TooltipContent>
                                    {t("modules.admin.users.list.deleteDisabled")}
                                  </TooltipContent>
                                ) : null}
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("modules.admin.users.pagination.rowsPerPage")}</span>
              <Select
                value={String(query.pageSize)}
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
      )}

      <UserEditSheet
        user={editingUser}
        open={Boolean(query.userId && editingUser)}
        isLoading={Boolean(query.userId) && detailQuery.isLoading && !editingUser}
        isSaving={updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
        onSave={handleSave}
      />

      <UserDeleteConfirmDialog
        userName={deleteTarget?.name ?? ""}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </DashboardPageLayout>
  );
}
