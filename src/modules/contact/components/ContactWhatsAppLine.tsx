import { Link } from "react-router-dom";
import { useCallback, useState, type MouseEvent } from "react";
import { Ban, Copy, Smartphone } from "lucide-react";

import { PermissionGuard } from "@/shared/auth/PermissionGuard";
import { copyTextToClipboard } from "@/shared/lib/copy-to-clipboard";
import { Badge } from "@/shared/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const text = String(value ?? "").trim();
      if (!text) return;
      const ok = await copyTextToClipboard(text);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    },
    [value],
  );

  if (!value) return null;

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      title={copied ? "Copiado" : "Copiar"}
      aria-label={copied ? "Copiado" : "Copiar"}
    >
      <Copy className="size-3.5" />
    </button>
  );
}

export type ContactWhatsAppBlocklistLinkProps = {
  href: string;
  blocklistTitle: string;
};

/** Link só com ícone Ban + tooltip (mesmo padrão no accordion e no header). */
export function ContactWhatsAppBlocklistLink({
  href,
  blocklistTitle,
}: ContactWhatsAppBlocklistLinkProps) {
  return (
    <PermissionGuard permissionNames={["mover_para_blocklist", "retirar_da_blocklist"]}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={href}
            className="inline-flex shrink-0 items-center justify-center rounded-full p-0.5 text-destructive hover:bg-muted"
            aria-label={blocklistTitle}
          >
            <Ban className="size-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          {blocklistTitle}
        </TooltipContent>
      </Tooltip>
    </PermissionGuard>
  );
}

export type ContactWhatsAppLineProps = {
  appkey: string | null | undefined;
  isInBlackList: boolean;
  main?: boolean;
  blocklistFilteredHref: (appkey: string | null | undefined) => string;
  formatWhatsApp: (phone: string) => string;
  blocklistTitle: string;
  mainContactLabel: string;
};

/** Uma linha read-only: ícone Ban ou Smartphone (nunca os dois), número, badge, copiar. */
export function ContactWhatsAppLine({
  appkey,
  isInBlackList,
  main,
  blocklistFilteredHref,
  formatWhatsApp,
  blocklistTitle,
  mainContactLabel,
}: ContactWhatsAppLineProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {isInBlackList ? (
        <ContactWhatsAppBlocklistLink href={blocklistFilteredHref(appkey)} blocklistTitle={blocklistTitle} />
      ) : (
        <span className="text-muted-foreground">
          <Smartphone className="size-4" />
        </span>
      )}
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-sm font-medium text-foreground">{formatWhatsApp(appkey ?? "")}</span>
        {main ? (
          <Badge
            variant="secondary"
            className="h-5 shrink-0 rounded-full border border-border/60 px-2 text-[10px] font-medium"
          >
            {mainContactLabel}
          </Badge>
        ) : null}
      </div>
      {appkey ? <CopyButton value={appkey} /> : null}
    </div>
  );
}
