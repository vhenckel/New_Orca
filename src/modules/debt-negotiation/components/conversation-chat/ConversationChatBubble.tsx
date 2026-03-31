import type { ConversationChat, MediaAtt } from "@/modules/debt-negotiation/types/conversation-history";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { ConversationMessageContent } from "./ConversationMessageContent";
import { AGENT_MESSAGE_BACKGROUND_CLASS, formatMessageDate } from "./chat-message.utils";

interface ConversationChatBubbleProps {
  chat: ConversationChat;
  mediasAtt: MediaAtt[];
}

function isPixMessageType(
  message: ConversationChat["message"],
): message is ConversationChat["message"] & { type: "pix_dynamic_code" | "dynamic_pix_message" } {
  return message.type === "pix_dynamic_code" || message.type === "dynamic_pix_message";
}

export function ConversationChatBubble({ chat, mediasAtt }: ConversationChatBubbleProps) {
  const { t } = useI18n();
  const isBot = chat.sender === 2;
  const neutralPixBotShell = isBot && isPixMessageType(chat.message);

  return (
    <div className={cn("flex w-full", isBot ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[85%] flex-col",
          neutralPixBotShell
            ? "gap-1"
            : cn(
                "gap-0.5 rounded-lg px-3 py-2 shadow-sm",
                isBot
                  ? AGENT_MESSAGE_BACKGROUND_CLASS
                  : "rounded-bl-md border border-green-200/80 bg-green-100 text-green-900 dark:border-green-800/50 dark:bg-green-900/50 dark:text-green-100",
              ),
        )}
      >
        <span className="text-xs font-medium opacity-80">
          {isBot
            ? t("pages.debtNegotiation.debts.conversationHistory.botLabel")
            : t("pages.debtNegotiation.debts.conversationHistory.userLabel")}
        </span>
        <ConversationMessageContent
          message={chat.message}
          mediasAtt={mediasAtt}
          messageSentAt={neutralPixBotShell ? chat.date : undefined}
        />
        {!neutralPixBotShell ? (
          <span className="text-right text-xs text-muted-foreground">{formatMessageDate(chat.date)}</span>
        ) : null}
      </div>
    </div>
  );
}
