import { useState, type MouseEvent } from "react";
import { Copy } from "lucide-react";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { copyTextToClipboard } from "@/shared/lib/copy-to-clipboard";

interface PixCodeCopyButtonProps {
  value?: string;
}

export function PixCodeCopyButton({ value }: PixCodeCopyButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const onCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const text = String(value ?? "").trim();
    if (!text) return;
    const ok = await copyTextToClipboard(text);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
      {copied
        ? t("pages.debtNegotiation.debts.conversationHistory.pixCopied")
        : t("pages.debtNegotiation.debts.conversationHistory.pixCopyCode")}
    </Button>
  );
}
