import { Link } from "react-router-dom";
import { useCallback, useState, type MouseEvent, type ReactNode } from "react";
import { Ban, Copy, FileBadge2, Mail, MessageCircle, Pencil, Phone, Send } from "lucide-react";

import { PermissionGuard } from "@/shared/auth/PermissionGuard";
import { copyTextToClipboard } from "@/shared/lib/copy-to-clipboard";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

type HeaderTexts = {
  addToBlocklist: string;
  blocklist: string;
  viewConversation: string;
  firstConversation: string;
  lastConversation: string;
  emailLabel: string;
  phoneLabel: string;
  documentLabel: string;
  edit: string;
  send: string;
};

type ContactDetailHeaderProps = {
  isPending: boolean;
  name: string;
  initials: string;
  lastPipelineStage: string | null | undefined;
  email: string | null | undefined;
  phoneDisplay: string | null | undefined;
  phoneRaw: string | null | undefined;
  phoneInBlackList: boolean;
  phoneBlocklistHref: string | null;
  documentDisplay: string | null | undefined;
  documentRaw: string | null | undefined;
  firstConversationDate: string;
  lastConversationDate: string;
  texts: HeaderTexts;
  onOpenEdit: () => void;
  onAddToBlocklist: () => void;
  onOpenConversation: () => void;
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const text = String(value ?? "").trim();
      if (!text) return;
      const ok = await copyTextToClipboard(text);
      if (!ok) return;
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    },
    [value],
  );

  if (!value) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      title={copied ? "Copiado" : "Copiar"}
      aria-label={copied ? "Copiado" : "Copiar"}
    >
      <Copy className="size-3.5" />
    </button>
  );
}

function InfoBlock({
  label,
  value,
  icon,
  rawValue,
  className,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  rawValue?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        <span className="truncate">{value || "-"}</span>
        {rawValue ? <CopyButton value={rawValue} /> : null}
      </div>
    </div>
  );
}

export function ContactDetailHeader({
  isPending,
  name,
  initials,
  lastPipelineStage,
  email,
  phoneDisplay,
  phoneRaw,
  phoneInBlackList,
  phoneBlocklistHref,
  documentDisplay,
  documentRaw,
  firstConversationDate,
  lastConversationDate,
  texts,
  onOpenEdit,
  onAddToBlocklist,
  onOpenConversation,
}: ContactDetailHeaderProps) {
  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="text-base">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-foreground">{isPending ? "..." : name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {lastPipelineStage ? (
                  <Badge
                    variant="secondary"
                    className="h-5 rounded-full border border-border/60 px-2 text-[10px] font-medium uppercase tracking-wide"
                  >
                    {lastPipelineStage}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PermissionGuard permissionNames={["editar"]} moduleName="contatos" subModuleName="contatos">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9"
                    aria-label={texts.edit}
                    onClick={onOpenEdit}
                  >
                    <Pencil />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{texts.edit}</TooltipContent>
              </Tooltip>
            </PermissionGuard>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="size-9" aria-label={texts.send}>
                  <Send />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{texts.send}</TooltipContent>
            </Tooltip>

            <PermissionGuard
              permissionNames={["mover_para_blocklist"]}
              moduleName="contatos"
              subModuleName="contatos"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" className="gap-2" onClick={onAddToBlocklist}>
                    <Ban />
                    {texts.addToBlocklist}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{texts.addToBlocklist}</TooltipContent>
              </Tooltip>
            </PermissionGuard>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" onClick={onOpenConversation}>
                  <MessageCircle data-icon="inline-start" />
                  {texts.viewConversation}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{texts.viewConversation}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoBlock label={texts.emailLabel} value={email ?? "-"} icon={<Mail className="size-4" />} rawValue={email} />

          <div>
            <InfoBlock
              label={texts.phoneLabel}
              value={phoneDisplay ?? "-"}
              icon={<Phone className="size-4" />}
              rawValue={phoneRaw}
              className="mb-1"
            />
            {phoneInBlackList && phoneBlocklistHref ? (
              <PermissionGuard permissionNames={["mover_para_blocklist", "retirar_da_blocklist"]}>
                <Link to={phoneBlocklistHref} className="inline-flex items-center gap-1 text-xs text-destructive">
                  <Ban className="size-3.5" />
                  {texts.blocklist}
                </Link>
              </PermissionGuard>
            ) : null}
          </div>

          <InfoBlock
            label={texts.documentLabel}
            value={documentDisplay ?? "-"}
            icon={<FileBadge2 className="size-4" />}
            rawValue={documentRaw}
            className="font-mono"
          />
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            {texts.firstConversation}: {firstConversationDate}
          </p>
          <p>
            {texts.lastConversation}: {lastConversationDate}
          </p>
        </div>
      </CardHeader>
    </Card>
  );
}
