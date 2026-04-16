import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { MOCK_QUOTATIONS, matchesStatus } from "@/modules/quotation/data/quotationMocks";
import type { QuotationStatus } from "@/modules/quotation/types";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
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
import { useI18n } from "@/shared/i18n/useI18n";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: QuotationStatus) {
  if (status === "open") return "border-sky-200 bg-sky-50 text-sky-800";
  if (status === "waiting") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-emerald-200 bg-emerald-50 text-emerald-900";
}

export function QuotationsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "all">("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_QUOTATIONS.filter((row) => matchesStatus(row, statusFilter)).filter((row) => {
      if (!q) return true;
      return (
        String(row.id).includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.total.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter]);

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.quotation.quotations.pageTitle")}
      subtitle={t("modules.quotation.quotations.pageSubtitle")}
      headerActions={
        <Button asChild className="gap-2">
          <Link to="/quotations/new">
            <Plus className="size-4" />
            {t("modules.quotation.quotations.addButton")}
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("modules.quotation.quotations.searchPlaceholder")}
              className="pl-9"
              aria-label={t("modules.quotation.quotations.searchPlaceholder")}
            />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto sm:min-w-[200px]">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as QuotationStatus | "all")}
            >
              <SelectTrigger aria-label={t("modules.quotation.quotations.statusFilterLabel")}>
                <SelectValue placeholder={t("modules.quotation.quotations.statusAll")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("modules.quotation.quotations.statusAll")}</SelectItem>
                <SelectItem value="open">{t("modules.quotation.quotations.status.open")}</SelectItem>
                <SelectItem value="waiting">
                  {t("modules.quotation.quotations.status.waiting")}
                </SelectItem>
                <SelectItem value="finished">
                  {t("modules.quotation.quotations.status.finished")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>{t("modules.quotation.quotations.table.title")}</TableHead>
                <TableHead>{t("modules.quotation.quotations.table.status")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("modules.quotation.quotations.table.createdAt")}
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t("modules.quotation.quotations.table.deadline")}
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  {t("modules.quotation.quotations.table.responses")}
                </TableHead>
                <TableHead className="text-right">{t("modules.quotation.quotations.table.total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {t("modules.quotation.quotations.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(row.status)}>
                        {t(`modules.quotation.quotations.status.${row.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {formatDateTime(row.deadlineAt)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">{row.responses}</TableCell>
                    <TableCell className="text-right font-semibold">{row.total}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
