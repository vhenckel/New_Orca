import type { ConversationChat, MediaAtt } from "@/modules/debt-negotiation/types/conversation-history";
import { cn } from "@/shared/lib/utils";
import { ChatMessageRoleLabel } from "./ChatMessageRoleLabel";
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

function isButtonMessageType(message: ConversationChat["message"]): boolean {
  return message.type === "button";
}

export function ConversationChatBubble({ chat, mediasAtt }: ConversationChatBubbleProps) {
  const isBot = chat.sender === 2;
  const splitBotShell =
    isBot && (isPixMessageType(chat.message) || isButtonMessageType(chat.message));

  return (
    <div className={cn("flex w-full", isBot ? "justify-end" : "justify-start")}>
      <div
        className="flex max-w-[85%] flex-col items-start gap-1"
      >
        <ChatMessageRoleLabel variant={isBot ? "bot" : "user"} />
        {splitBotShell ? (
          <ConversationMessageContent
            message={chat.message}
            mediasAtt={mediasAtt}
            messageSentAt={chat.date}
          />
        ) : (
          <div
            className={cn(
              "flex min-w-0 max-w-full flex-col gap-0.5 rounded-lg px-3 py-2 shadow-sm",
              isBot
                ? AGENT_MESSAGE_BACKGROUND_CLASS
                : "rounded-bl-md border border-green-200/80 bg-green-100 text-green-900 dark:border-green-800/50 dark:bg-green-900/50 dark:text-green-100",
            )}
          >
            <ConversationMessageContent
              message={chat.message}
              mediasAtt={mediasAtt}
              messageSentAt={undefined}
            />
            <span className="text-right text-xs text-muted-foreground">
              {formatMessageDate(chat.date)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
