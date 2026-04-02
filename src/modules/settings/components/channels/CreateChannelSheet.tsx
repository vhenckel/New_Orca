import { Eye, EyeOff, Info } from "lucide-react";
import { useCallback, useState } from "react";

import type { BotDto } from "@/modules/settings/types/channel";
import { useCreateChannelMutation } from "@/modules/settings/hooks/useChannelMutations";
import { useI18n } from "@/shared/i18n/useI18n";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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

function parseLimitInput(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

export function CreateChannelSheet({
  open,
  onOpenChange,
  companyId,
  bots,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number | null;
  bots: BotDto[];
}) {
  const { t } = useI18n();
  const createMutation = useCreateChannelMutation(companyId);

  const [name, setName] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [botId, setBotId] = useState<string>("");
  const [connectionToken, setConnectionToken] = useState("");
  const [connectionUrl, setConnectionUrl] = useState("");
  const [weight, setWeight] = useState(10);
  const [templateDailyLimit, setTemplateDailyLimit] = useState("1000");
  const [messagesPerMinute, setMessagesPerMinute] = useState("60");
  const [blockMarketing, setBlockMarketing] = useState(false);
  const [blockUtility, setBlockUtility] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = useCallback(() => {
    setName("");
    setPhoneNumberId("");
    setPhoneNumber("");
    setBotId("");
    setConnectionToken("");
    setConnectionUrl("");
    setWeight(10);
    setTemplateDailyLimit("1000");
    setMessagesPerMinute("60");
    setBlockMarketing(false);
    setBlockUtility(false);
    setShowToken(false);
    setErrors({});
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (name.trim().length < 3) e.name = t("modules.settings.channels.validation.nameMin");
    if (!phoneNumberId.trim()) e.phoneNumberId = t("modules.settings.channels.validation.required");
    if (!phoneNumber.trim()) e.phoneNumber = t("modules.settings.channels.validation.required");
    if (!botId) e.botId = t("modules.settings.channels.validation.required");
    if (!connectionToken.trim()) e.connectionToken = t("modules.settings.channels.validation.required");
    if (!connectionUrl.trim()) e.connectionUrl = t("modules.settings.channels.validation.required");
    const tdl = parseLimitInput(templateDailyLimit);
    if (tdl == null || tdl < -1) e.templateDailyLimit = t("modules.settings.channels.validation.limitMin");
    const mpm = parseLimitInput(messagesPerMinute);
    if (mpm == null || mpm < -1) e.messagesPerMinute = t("modules.settings.channels.validation.limitMin");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (companyId == null) return;
    if (!validate()) return;
    const tdl = parseLimitInput(templateDailyLimit)!;
    const mpm = parseLimitInput(messagesPerMinute)!;
    const blocked: string[] = [];
    if (blockMarketing) blocked.push("MARKETING");
    if (blockUtility) blocked.push("UTILITY");

    createMutation.mutate(
      {
        name: name.trim(),
        phoneNumberId: phoneNumberId.trim(),
        phoneNumber: phoneNumber.trim(),
        weight,
        templateDailyLimit: tdl,
        messagesPerMinute: mpm,
        companyId,
        botId: Number(botId),
        connectionToken: connectionToken.trim(),
        connectionUrl: connectionUrl.trim(),
        blockedMessageTypes: blocked.length ? blocked : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("modules.settings.channels.toast.createSuccess"));
          handleOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : t("modules.settings.channels.toast.createError"),
          );
        },
      },
    );
  };

  const weightHint =
    weight >= 80
      ? t("modules.settings.channels.weightHint.high")
      : weight < 30
        ? t("modules.settings.channels.weightHint.warmup")
        : t("modules.settings.channels.weightHint.normal");

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle>{t("modules.settings.channels.create.title")}</SheetTitle>
          <SheetDescription>{t("modules.settings.channels.create.description")}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 px-6 py-4">
          <FieldGroup className="gap-6">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="ch-name">{t("modules.settings.channels.fields.name")}</FieldLabel>
              <Input
                id="ch-name"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? <FieldError>{errors.name}</FieldError> : null}
            </Field>

            <Field data-invalid={Boolean(errors.phoneNumberId)}>
              <FieldLabel htmlFor="ch-pnid" className="inline-flex items-center gap-1">
                {t("modules.settings.channels.fields.phoneNumberId")}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex cursor-help">
                      <Info className="size-3.5 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs" side="right">
                    {t("modules.settings.channels.fields.phoneNumberIdHint")}
                  </TooltipContent>
                </Tooltip>
              </FieldLabel>
              <Input
                id="ch-pnid"
                value={phoneNumberId}
                onChange={(ev) => setPhoneNumberId(ev.target.value)}
                aria-invalid={Boolean(errors.phoneNumberId)}
              />
              {errors.phoneNumberId ? <FieldError>{errors.phoneNumberId}</FieldError> : null}
            </Field>

            <Field data-invalid={Boolean(errors.phoneNumber)}>
              <FieldLabel htmlFor="ch-phone">{t("modules.settings.channels.fields.phoneNumber")}</FieldLabel>
              <Input
                id="ch-phone"
                value={phoneNumber}
                onChange={(ev) => setPhoneNumber(ev.target.value)}
                aria-invalid={Boolean(errors.phoneNumber)}
              />
              {errors.phoneNumber ? <FieldError>{errors.phoneNumber}</FieldError> : null}
            </Field>

            <Field data-invalid={Boolean(errors.botId)}>
              <FieldLabel>{t("modules.settings.channels.fields.bot")}</FieldLabel>
              <Select value={botId || undefined} onValueChange={setBotId}>
                <SelectTrigger aria-invalid={Boolean(errors.botId)}>
                  <SelectValue placeholder={t("modules.settings.channels.fields.botPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {bots.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name?.trim() ? b.name : `#${b.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.botId ? <FieldError>{errors.botId}</FieldError> : null}
            </Field>

            <Field data-invalid={Boolean(errors.connectionToken)}>
              <FieldLabel htmlFor="ch-token" className="inline-flex items-center gap-1">
                {t("modules.settings.channels.fields.connectionToken")}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex cursor-help">
                      <Info className="size-3.5 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs" side="right">
                    {t("modules.settings.channels.fields.connectionTokenHint")}
                  </TooltipContent>
                </Tooltip>
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="ch-token"
                  type={showToken ? "text" : "password"}
                  autoComplete="new-password"
                  value={connectionToken}
                  onChange={(ev) => setConnectionToken(ev.target.value)}
                  aria-invalid={Boolean(errors.connectionToken)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowToken((s) => !s)}
                  aria-label={showToken ? t("modules.settings.channels.hideSecret") : t("modules.settings.channels.showSecret")}
                >
                  {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              {errors.connectionToken ? <FieldError>{errors.connectionToken}</FieldError> : null}
            </Field>

            <Field data-invalid={Boolean(errors.connectionUrl)}>
              <FieldLabel htmlFor="ch-url" className="inline-flex items-center gap-1">
                {t("modules.settings.channels.fields.connectionUrl")}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex cursor-help">
                      <Info className="size-3.5 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs" side="right">
                    {t("modules.settings.channels.fields.connectionUrlHint")}
                  </TooltipContent>
                </Tooltip>
              </FieldLabel>
              <Input
                id="ch-url"
                value={connectionUrl}
                onChange={(ev) => setConnectionUrl(ev.target.value)}
                aria-invalid={Boolean(errors.connectionUrl)}
              />
              {errors.connectionUrl ? <FieldError>{errors.connectionUrl}</FieldError> : null}
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
                <FieldLabel htmlFor="ch-tdl">{t("modules.settings.channels.fields.templateDailyLimit")}</FieldLabel>
                <Input
                  id="ch-tdl"
                  type="number"
                  value={templateDailyLimit}
                  onChange={(ev) => setTemplateDailyLimit(ev.target.value)}
                  aria-invalid={Boolean(errors.templateDailyLimit)}
                />
                {errors.templateDailyLimit ? (
                  <FieldError>{errors.templateDailyLimit}</FieldError>
                ) : null}
              </Field>
              <Field data-invalid={Boolean(errors.messagesPerMinute)}>
                <FieldLabel htmlFor="ch-mpm">{t("modules.settings.channels.fields.messagesPerMinute")}</FieldLabel>
                <Input
                  id="ch-mpm"
                  type="number"
                  value={messagesPerMinute}
                  onChange={(ev) => setMessagesPerMinute(ev.target.value)}
                  aria-invalid={Boolean(errors.messagesPerMinute)}
                />
                {errors.messagesPerMinute ? (
                  <FieldError>{errors.messagesPerMinute}</FieldError>
                ) : null}
              </Field>
            </div>
            <FieldDescription>{t("modules.settings.channels.unlimitedHint")}</FieldDescription>

            <RestrictionsFields
              title={t("modules.settings.channels.restrictionsTitle")}
              blockMarketing={blockMarketing}
              blockUtility={blockUtility}
              onMarketing={setBlockMarketing}
              onUtility={setBlockUtility}
            />
          </FieldGroup>
        </ScrollArea>
        <SheetFooter className="border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {t("modules.settings.channels.actions.cancel")}
          </Button>
          <Button type="button" onClick={submit} disabled={createMutation.isPending}>
            {createMutation.isPending
              ? t("modules.settings.channels.actions.creating")
              : t("modules.settings.channels.actions.create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function RestrictionsFields({
  title,
  blockMarketing,
  blockUtility,
  onMarketing,
  onUtility,
}: {
  title: string;
  blockMarketing: boolean;
  blockUtility: boolean;
  onMarketing: (v: boolean) => void;
  onUtility: (v: boolean) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium">{title}</p>
      <Field orientation="horizontal" className="items-start gap-3">
        <Checkbox
          id="ch-bm"
          checked={blockMarketing}
          onCheckedChange={(c) => onMarketing(c === true)}
        />
        <div className="flex flex-1 flex-col gap-1">
          <FieldLabel htmlFor="ch-bm" className="inline-flex items-center gap-1 font-normal">
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
        </div>
      </Field>
      <Field orientation="horizontal" className="items-start gap-3">
        <Checkbox
          id="ch-bu"
          checked={blockUtility}
          onCheckedChange={(c) => onUtility(c === true)}
        />
        <div className="flex flex-1 flex-col gap-1">
          <FieldLabel htmlFor="ch-bu" className="inline-flex items-center gap-1 font-normal">
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
        </div>
      </Field>
    </div>
  );
}
