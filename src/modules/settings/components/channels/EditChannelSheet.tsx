import { Info } from "lucide-react";
import { useEffect, useState } from "react";

import type { ChannelModel } from "@/modules/settings/types/channel";
import {
  useClearChannelCacheMutation,
  useUpdateChannelConfigMutation,
} from "@/modules/settings/hooks/useChannelMutations";
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
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Slider } from "@/shared/ui/slider";
import { toast } from "@/shared/ui/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { Progress } from "@/shared/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

function parseLimitInput(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function blockedFromChannel(channel: ChannelModel | null): { marketing: boolean; utility: boolean } {
  const list = channel?.blockedMessageTypes ?? [];
  return {
    marketing: list.includes("MARKETING"),
    utility: list.includes("UTILITY"),
  };
}

export function EditChannelSheet({
  channel,
  open,
  onOpenChange,
  companyId,
}: {
  channel: ChannelModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number | null;
}) {
  const { t } = useI18n();
  const updateConfig = useUpdateChannelConfigMutation(companyId);
  const clearCache = useClearChannelCacheMutation(companyId);

  const [weight, setWeight] = useState(10);
  const [templateDailyLimit, setTemplateDailyLimit] = useState("1000");
  const [messagesPerMinute, setMessagesPerMinute] = useState("60");
  const [blockMarketing, setBlockMarketing] = useState(false);
  const [blockUtility, setBlockUtility] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clearOpen, setClearOpen] = useState(false);

  useEffect(() => {
    if (!channel || !open) return;
    setWeight(channel.weight);
    setTemplateDailyLimit(String(channel.templateDailyLimit ?? 1000));
    setMessagesPerMinute(String(channel.messagesPerMinute ?? 60));
    const b = blockedFromChannel(channel);
    setBlockMarketing(b.marketing);
    setBlockUtility(b.utility);
    setErrors({});
  }, [channel, open]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const tdl = parseLimitInput(templateDailyLimit);
    if (tdl == null || tdl < -1) e.templateDailyLimit = t("modules.settings.channels.validation.limitMin");
    const mpm = parseLimitInput(messagesPerMinute);
    if (mpm == null || mpm < -1) e.messagesPerMinute = t("modules.settings.channels.validation.limitMin");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!channel || companyId == null) return;
    if (!validate()) return;
    const tdl = parseLimitInput(templateDailyLimit)!;
    const mpm = parseLimitInput(messagesPerMinute)!;
    const blocked: string[] = [];
    if (blockMarketing) blocked.push("MARKETING");
    if (blockUtility) blocked.push("UTILITY");

    updateConfig.mutate(
      {
        channelId: channel.id,
        body: {
          weight,
          templateDailyLimit: tdl,
          messagesPerMinute: mpm,
          blockedMessageTypes: blocked,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("modules.settings.channels.toast.updateSuccess"));
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : t("modules.settings.channels.toast.updateError"),
          );
        },
      },
    );
  };

  const confirmClearCache = () => {
    if (!channel) return;
    clearCache.mutate(channel.id, {
      onSuccess: () => {
        toast.success(t("modules.settings.channels.toast.cacheCleared"));
        setClearOpen(false);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : t("modules.settings.channels.toast.cacheError"),
        );
      },
    });
  };

  const m = channel?.metrics;
  const limit = channel?.templateDailyLimit ?? 0;
  const today = m?.messagesToday ?? 0;
  const minLimit = channel?.messagesPerMinute ?? 0;
  const thisMin = m?.messagesThisMinute ?? 0;

  const usageProgress =
    m?.usagePercent != null
      ? Math.min(100, Math.max(0, m.usagePercent))
      : limit > 0
        ? Math.min(100, (today / limit) * 100)
        : 0;

  const minuteProgress =
    minLimit > 0 ? Math.min(100, (thisMin / minLimit) * 100) : 0;

  const weightHint =
    weight >= 80
      ? t("modules.settings.channels.weightHint.high")
      : weight < 30
        ? t("modules.settings.channels.weightHint.warmup")
        : t("modules.settings.channels.weightHint.normal");

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-border px-6 py-4 text-left">
            <SheetTitle>
              {channel
                ? t("modules.settings.channels.edit.titleWithName", { name: channel.name })
                : t("modules.settings.channels.edit.title")}
            </SheetTitle>
            <SheetDescription>{t("modules.settings.channels.edit.description")}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="max-h-[calc(100vh-10rem)] flex-1 px-6 py-4">
            <FieldGroup className="gap-6">
              <Field>
                <FieldLabel htmlFor="ed-name">{t("modules.settings.channels.fields.name")}</FieldLabel>
                <Input id="ed-name" value={channel?.name ?? ""} disabled readOnly />
                <FieldDescription>{t("modules.settings.channels.edit.nameReadOnlyHint")}</FieldDescription>
              </Field>

              <Field>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <FieldLabel>{t("modules.settings.channels.fields.weight")}</FieldLabel>
                  <span className="text-xs text-muted-foreground">{weightHint}</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={10}
                  value={[weight]}
                  onValueChange={(v) => setWeight(v[0] ?? 0)}
                  className="py-2"
                />
                <FieldDescription>{weight}%</FieldDescription>
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.templateDailyLimit)}>
                  <FieldLabel htmlFor="ed-tdl">{t("modules.settings.channels.fields.templateDailyLimit")}</FieldLabel>
                  <Input
                    id="ed-tdl"
                    type="number"
                    value={templateDailyLimit}
                    onChange={(ev) => setTemplateDailyLimit(ev.target.value)}
                    aria-invalid={Boolean(errors.templateDailyLimit)}
                  />
                  <FieldDescription>{t("modules.settings.channels.fields.msgsPerDaySuffix")}</FieldDescription>
                  {errors.templateDailyLimit ? (
                    <FieldError>{errors.templateDailyLimit}</FieldError>
                  ) : null}
                </Field>
                <Field data-invalid={Boolean(errors.messagesPerMinute)}>
                  <FieldLabel htmlFor="ed-mpm">{t("modules.settings.channels.fields.messagesPerMinute")}</FieldLabel>
                  <Input
                    id="ed-mpm"
                    type="number"
                    value={messagesPerMinute}
                    onChange={(ev) => setMessagesPerMinute(ev.target.value)}
                    aria-invalid={Boolean(errors.messagesPerMinute)}
                  />
                  <FieldDescription>{t("modules.settings.channels.fields.msgsPerMinSuffix")}</FieldDescription>
                  {errors.messagesPerMinute ? (
                    <FieldError>{errors.messagesPerMinute}</FieldError>
                  ) : null}
                </Field>
              </div>
              <FieldDescription>{t("modules.settings.channels.unlimitedHint")}</FieldDescription>

              <div className="flex flex-col gap-4">
                <p className="text-sm font-medium">{t("modules.settings.channels.restrictionsTitle")}</p>
                <Field orientation="horizontal" className="items-start gap-3">
                  <Checkbox
                    id="ed-bm"
                    checked={blockMarketing}
                    onCheckedChange={(c) => setBlockMarketing(c === true)}
                  />
                  <FieldLabel htmlFor="ed-bm" className="inline-flex items-center gap-1 font-normal">
                    {t("modules.settings.channels.blockMarketing")}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex cursor-help">
                          <Info className="size-3.5 text-muted-foreground" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs" side="right">
                        {t("modules.settings.channels.blockMarketingHint")}
                      </TooltipContent>
                    </Tooltip>
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal" className="items-start gap-3">
                  <Checkbox
                    id="ed-bu"
                    checked={blockUtility}
                    onCheckedChange={(c) => setBlockUtility(c === true)}
                  />
                  <FieldLabel htmlFor="ed-bu" className="inline-flex items-center gap-1 font-normal">
                    {t("modules.settings.channels.blockUtility")}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex cursor-help">
                          <Info className="size-3.5 text-muted-foreground" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs" side="right">
                        {t("modules.settings.channels.blockUtilityHint")}
                      </TooltipContent>
                    </Tooltip>
                  </FieldLabel>
                </Field>
              </div>

              {channel ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">{t("modules.settings.channels.usageCurrent")}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t("modules.settings.channels.usageToday")}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        <p className="text-sm tabular-nums">
                          {today} / {limit === -1 ? "∞" : limit}
                        </p>
                        <Progress value={usageProgress} className="h-2" />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {t("modules.settings.channels.usageThisMinute")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        <p className="text-sm tabular-nums">
                          {thisMin} / {minLimit === -1 ? "∞" : minLimit}
                        </p>
                        <Progress value={minuteProgress} className="h-2" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : null}
            </FieldGroup>
          </ScrollArea>
          <SheetFooter className="flex flex-col gap-2 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              className="sm:mr-auto"
              onClick={() => setClearOpen(true)}
              disabled={!channel || clearCache.isPending}
            >
              {t("modules.settings.channels.actions.clearCache")}
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("modules.settings.channels.actions.cancel")}
              </Button>
              <Button type="button" onClick={save} disabled={!channel || updateConfig.isPending}>
                {updateConfig.isPending
                  ? t("modules.settings.channels.actions.saving")
                  : t("modules.settings.channels.actions.save")}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("modules.settings.channels.clearCache.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("modules.settings.channels.clearCache.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("modules.settings.channels.actions.cancel")}</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={clearCache.isPending}
              onClick={() => confirmClearCache()}
            >
              {t("modules.settings.channels.clearCache.confirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
