import type { ConversationChat, MediaAtt } from "@/modules/debt-negotiation/types/conversation-history";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { ConversationMessageContent } from "./ConversationMessageContent";
import { AGENT_MESSAGE_BACKGROUND_CLASS, formatMessageDate } from "./chat-message.utils";

interface ConversationChatBubbleProps {
  chat: ConversationChat;
  mediasAtt: MediaAtt[];
}

export function ConversationChatBubble({ chat, mediasAtt }: ConversationChatBubbleProps) {
  const { t } = useI18n();
  const isBot = chat.sender === 2;

  return (
    <div className={cn("flex w-full", isBot ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-0.5 rounded-lg px-3 py-2 shadow-sm",
          isBot
            ? AGENT_MESSAGE_BACKGROUND_CLASS
            : "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100 rounded-bl-md",
        )}
      >
        <span className="text-xs font-medium opacity-80">
          {isBot
            ? t("pages.debtNegotiation.debts.conversationHistory.botLabel")
            : t("pages.debtNegotiation.debts.conversationHistory.userLabel")}
        </span>
        <ConversationMessageContent message={chat.message} mediasAtt={mediasAtt} />
        <span className="text-right text-xs text-muted-foreground">{formatMessageDate(chat.date)}</span>
      </div>
    </div>
  );
}
