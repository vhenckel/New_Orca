import { Ban, Pencil, Plus, RefreshCw, Play } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import type { ChannelModel } from "@/modules/settings/types/channel";
import {
  getChannelRowStatus,
  type ChannelRowStatus,
} from "@/modules/settings/lib/channel-status";
import { useUpdateChannelWeightMutation } from "@/modules/settings/hooks/useChannelMutations";
import type { TranslationKey } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
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
import { toast } from "@/shared/ui/sonner";
import { cn } from "@/shared/lib/utils";

function usageProgressValue(channel: ChannelModel): number {
  const m = channel.metrics;
  if (m?.usagePercent != null) return Math.min(100, Math.max(0, m.usagePercent));
  const limit = channel.templateDailyLimit ?? 0;
  const today = m?.messagesToday ?? 0;
  if (limit > 0 && limit !== -1) return Math.min(100, (today / limit) * 100);
  return 0;
}

function channelStatusLabel(
  t: (key: TranslationKey) => string,
  status: ChannelRowStatus,
): string {
  const map: Record<ChannelRowStatus, TranslationKey> = {
    paused: "modules.settings.channels.status.paused",
    at_limit: "modules.settings.channels.status.at_limit",
    near_limit: "modules.settings.channels.status.near_limit",
    warmup: "modules.settings.channels.status.warmup",
    normal: "modules.settings.channels.status.normal",
  };
  return t(map[status]);
}

function statusBadgeClass(status: ChannelRowStatus): string {
  switch (status) {
    case "paused":
      return "border-transparent bg-muted text-muted-foreground";
    case "at_limit":
      return "border-transparent bg-destructive/15 text-destructive";
    case "near_limit":
      return "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400";
    case "warmup":
      return "border-transparent bg-orange-500/15 text-orange-700 dark:text-orange-400";
    default:
      return "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  }
}

/** Badge que preenche a célula (padrão visual próximo à tabela de dívidas). */
function FullWidthPillBadge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "flex w-full min-h-7 shrink-0 justify-center rounded-full border px-3 py-1.5 text-center text-xs font-normal leading-tight",
        className,
      )}
    >
      {children}
    </Badge>
  );
}

export function ChannelTableSection({
  channels,
  isLoading,
  companyId,
  onAdd,
  onRefresh,
  onEdit,
}: {
  channels: ChannelModel[];
  isLoading: boolean;
  companyId: number | null;
  onAdd: () => void;
  onRefresh: () => void;
  onEdit: (c: ChannelModel) => void;
}) {
  const { t } = useI18n();
  const weightMutation = useUpdateChannelWeightMutation(companyId);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [weightDialog, setWeightDialog] = useState<{
    channel: ChannelModel;
    nextWeight: number;
  } | null>(null);

  const total = channels.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount));
  }, [pageCount]);
  const slice = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return channels.slice(start, start + pageSize);
  }, [channels, safePage, pageSize]);

  const applyWeight = () => {
    if (!weightDialog) return;
    const { channel, nextWeight } = weightDialog;
    weightMutation.mutate(
      { channelId: channel.id, weight: nextWeight },
      {
        onSuccess: () => {
          toast.success(
            nextWeight === 0
              ? t("modules.settings.channels.toast.paused")
              : t("modules.settings.channels.toast.activated"),
          );
          setWeightDialog(null);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : t("modules.settings.channels.toast.weightError"),
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} data-icon="inline-start" />
          {t("modules.settings.channels.actions.refresh")}
        </Button>
        <Button type="button" onClick={onAdd}>
          <Plus className="size-4" data-icon="inline-start" />
          {t("modules.settings.channels.actions.add")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">{t("modules.settings.channels.table.actions")}</TableHead>
                  <TableHead className="w-14">{t("modules.settings.channels.table.id")}</TableHead>
                  <TableHead>{t("modules.settings.channels.table.name")}</TableHead>
                  <TableHead>{t("modules.settings.channels.table.number")}</TableHead>
                  <TableHead className="min-w-[140px]">
                    {t("modules.settings.channels.table.status")}
                  </TableHead>
                  <TableHead className="text-right">{t("modules.settings.channels.table.weight")}</TableHead>
                  <TableHead className="min-w-[140px]">{t("modules.settings.channels.table.usageToday")}</TableHead>
                  <TableHead className="text-right">{t("modules.settings.channels.table.dailyLimit")}</TableHead>
                  <TableHead className="text-right">{t("modules.settings.channels.table.msgMin")}</TableHead>
                  <TableHead className="min-w-[120px]">
                    {t("modules.settings.channels.table.restrictions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      {t("modules.settings.channels.loading")}
                    </TableCell>
                  </TableRow>
                ) : slice.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      {t("modules.settings.channels.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  slice.map((ch) => {
                    const status = getChannelRowStatus(ch);
                    const progress = usageProgressValue(ch);
                    const today = ch.metrics?.messagesToday ?? 0;
                    const limit = ch.templateDailyLimit;
                    const limitLabel =
                      limit == null ? "—" : limit === -1 ? "∞" : String(limit);

                    return (
                      <TableRow key={ch.id}>
                        <TableCell className="text-left">
                          <div className="flex justify-start gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={t("modules.settings.channels.actions.edit")}
                              onClick={() => onEdit(ch)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            {ch.weight === 0 ? (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label={t("modules.settings.channels.actions.activate")}
                                disabled={weightMutation.isPending}
                                onClick={() =>
                                  setWeightDialog({ channel: ch, nextWeight: 100 })
                                }
                              >
                                <Play className="size-4" />
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label={t("modules.settings.channels.actions.pause")}
                                disabled={weightMutation.isPending}
                                onClick={() => setWeightDialog({ channel: ch, nextWeight: 0 })}
                              >
                                <Ban className="size-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{ch.id}</TableCell>
                        <TableCell className="max-w-[160px] truncate font-medium">{ch.name}</TableCell>
                        <TableCell className="font-mono text-sm">{ch.phoneNumber ?? "—"}</TableCell>
                        <TableCell className="align-middle">
                          <div className="flex w-full min-w-0">
                            <FullWidthPillBadge className={statusBadgeClass(status)}>
                              {channelStatusLabel(t, status)}
                            </FullWidthPillBadge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{ch.weight}%</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {today}/{limitLabel}
                            </span>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{limitLabel}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {ch.messagesPerMinute ?? "—"}
                        </TableCell>
                        <TableCell className="align-middle">
                          {(ch.blockedMessageTypes ?? []).length > 0 ? (
                            <div className="flex w-full min-w-0 flex-col gap-1">
                              {(ch.blockedMessageTypes ?? []).map((x) => (
                                <FullWidthPillBadge
                                  key={x}
                                  className="border-transparent bg-destructive/15 text-destructive"
                                >
                                  {x}
                                </FullWidthPillBadge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {t("modules.settings.channels.pagination.total", { n: total })}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </Button>
              <span className="text-sm tabular-nums">
                {safePage} / {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                ›
              </Button>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / {t("modules.settings.channels.pagination.perPage")}</SelectItem>
                  <SelectItem value="20">20 / {t("modules.settings.channels.pagination.perPage")}</SelectItem>
                  <SelectItem value="50">50 / {t("modules.settings.channels.pagination.perPage")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={weightDialog != null}
        onOpenChange={(o) => {
          if (!o) setWeightDialog(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {weightDialog?.nextWeight === 0
                ? t("modules.settings.channels.confirmPause.title")
                : t("modules.settings.channels.confirmActivate.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {weightDialog?.nextWeight === 0
                ? t("modules.settings.channels.confirmPause.description")
                : t("modules.settings.channels.confirmActivate.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("modules.settings.channels.actions.cancel")}</AlertDialogCancel>
            <Button
              type="button"
              disabled={weightMutation.isPending}
              onClick={() => applyWeight()}
            >
              {t("modules.settings.channels.actions.confirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
