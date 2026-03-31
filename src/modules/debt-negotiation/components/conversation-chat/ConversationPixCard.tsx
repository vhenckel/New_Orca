import type { ChatMessagePixDynamicCode } from "@/modules/debt-negotiation/types/conversation-history";
import { useI18n } from "@/shared/i18n/useI18n";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/shared/lib/utils";
import { PixCodeCopyButton } from "./PixCodeCopyButton";
import { formatPixAmount, PIX_CARD_BACKGROUND_CLASS, textWithBold } from "./chat-message.utils";

interface ConversationPixCardProps {
  message: ChatMessagePixDynamicCode;
}

export function ConversationPixCard({ message }: ConversationPixCardProps) {
  const { t } = useI18n();
  const pixItem = message.items?.[0];

  return (
    <Card className={cn("w-full max-w-md shadow-none", PIX_CARD_BACKGROUND_CLASS)}>
      <CardContent className="flex flex-col gap-3 p-3">
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

        <PixCodeCopyButton value={pixItem?.pixData?.code} />
      </CardContent>
    </Card>
  );
}
