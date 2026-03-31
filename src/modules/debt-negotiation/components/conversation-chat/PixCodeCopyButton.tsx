import { useState, type MouseEvent } from "react";
import { Copy } from "lucide-react";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { copyTextToClipboard } from "@/shared/lib/copy-to-clipboard";
import { toast } from "@/shared/ui/sonner";
import { CHAT_PIX_CTA_BUTTON_CLASS } from "./chat-message.utils";

interface PixCodeCopyButtonProps {
  value?: string;
  /** `cta`: faixa full-width estilo WhatsApp; `default`: pill compacto */
  variant?: "default" | "cta";
}

export function PixCodeCopyButton({
  value,
  variant = "default",
}: PixCodeCopyButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const onCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const text = String(value ?? "").trim();
    if (!text) return;
    const ok = await copyTextToClipboard(text);
    if (!ok) {
      toast.error(
        t("pages.debtNegotiation.debts.conversationHistory.pixCopyFailed"),
      );
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const labelCopied = t(
    "pages.debtNegotiation.debts.conversationHistory.pixCopied",
  );
  const labelDefault = t(
    "pages.debtNegotiation.debts.conversationHistory.pixCopyCode",
  );
  const labelCta = t(
    "pages.debtNegotiation.debts.conversationHistory.pixPayWithPixNow",
  );

  if (variant === "cta") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={onCopy}
        disabled={!String(value ?? "").trim()}
        className={CHAT_PIX_CTA_BUTTON_CLASS}
      >
        {copied ? labelCopied : labelCta}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={onCopy}
      disabled={!String(value ?? "").trim()}
      className="h-8 rounded-full border border-emerald-500/40 px-3 text-xs text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
    >
      <Copy data-icon="inline-start" aria-hidden />
      {copied ? labelCopied : labelDefault}
    </Button>
  );
}
