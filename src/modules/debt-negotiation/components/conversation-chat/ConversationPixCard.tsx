import type { ChatMessagePixDynamicCode } from "@/modules/debt-negotiation/types/conversation-history";
import { useI18n } from "@/shared/i18n/useI18n";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/shared/lib/utils";
import { PixCodeCopyButton } from "./PixCodeCopyButton";
import {
  extractPixCodeFromPixMessage,
  formatMessageTimeShort,
  formatPixAmount,
  PIX_CARD_BACKGROUND_CLASS,
  textWithBold,
} from "./chat-message.utils";

interface ConversationPixCardProps {
  message: ChatMessagePixDynamicCode;
  /** Quando definido, horário no canto do bloco superior (balão bot sem timestamp global). */
  sentAt?: string;
}

export function ConversationPixCard({ message, sentAt }: ConversationPixCardProps) {
  const { t } = useI18n();
  const pixItem = message.items?.[0];
  const pixCode = extractPixCodeFromPixMessage(message);
  const timeShort = sentAt ? formatMessageTimeShort(sentAt) : "";

  return (
    <div className="flex w-full max-w-md flex-col gap-1">
      <div
        className={cn(
          "rounded-lg border px-3 py-3 shadow-none",
          PIX_CARD_BACKGROUND_CLASS,
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">
              {t("pages.debtNegotiation.debts.conversationHistory.pixCharge", {
                id: pixItem?.id ?? "-",
              })}
            </p>
            <p className="text-sm font-medium">{pixItem?.title ?? "-"}</p>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {t("pages.debtNegotiation.debts.conversationHistory.pixTotal")}
            </span>
            <span className="text-sm font-semibold">{formatPixAmount(pixItem?.amount)}</span>
          </div>

          {message.text ? (
            <p className="whitespace-pre-wrap break-words text-sm">{textWithBold(message.text)}</p>
          ) : null}

          {pixCode ? (
            <div className="rounded-md border border-border/50 bg-muted/30 px-2 py-1.5">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("pages.debtNegotiation.debts.conversationHistory.pixCodeLabel")}
              </p>
              <p className="max-h-24 overflow-y-auto break-all font-mono text-[11px] leading-relaxed text-foreground/90">
                {pixCode}
              </p>
            </div>
          ) : null}

          {timeShort ? (
            <div className="flex justify-end pt-0.5">
              <span className="text-xs text-muted-foreground tabular-nums">{timeShort}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg">
        <PixCodeCopyButton value={pixCode} variant="cta" />
      </div>
    </div>
  );
}
