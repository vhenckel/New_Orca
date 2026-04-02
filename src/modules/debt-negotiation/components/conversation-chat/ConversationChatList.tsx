import { Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { ConversationChat, MediaAtt } from "@/modules/debt-negotiation/types/conversation-history";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/ui/empty";
import { ConversationChatBubble } from "./ConversationChatBubble";
import { CHAT_SCROLL_SURFACE_CLASS } from "./chat-message.utils";

interface ConversationChatListProps {
  chats: ConversationChat[];
  mediasAtt: MediaAtt[];
  isPending: boolean;
  canRevealChatList: boolean;
  isNextPending: boolean;
  hasNextPage: boolean;
  error: unknown;
  fetchNextPage: () => void;
}

export function ConversationChatList({
  chats,
  mediasAtt,
  isPending,
  canRevealChatList,
  isNextPending,
  hasNextPage,
  error,
  fetchNextPage,
}: ConversationChatListProps) {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollRoot = scrollRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isNextPending) {
          fetchNextPage();
        }
      },
      { root: scrollRoot, rootMargin: "80px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isNextPending, fetchNextPage, chats.length]);

  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root || chats.length === 0) return;
    const scrollToEnd = () => {
      root.scrollTop = root.scrollHeight;
    };
    scrollToEnd();
    const outerRaf = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToEnd);
    });
    return () => cancelAnimationFrame(outerRaf);
  }, [chats.length, canRevealChatList]);

  const showInitialLoader =
    isPending || (!error && chats.length > 0 && !canRevealChatList);

  if (showInitialLoader) {
    return (
      <div
        className={cn(
          "flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-sm text-muted-foreground",
          CHAT_SCROLL_SURFACE_CLASS,
        )}
      >
        <Loader2 className="size-8 animate-spin opacity-80" aria-hidden />
        <span>{t("pages.debtNegotiation.debts.conversationHistory.loading")}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-4 py-4",
          CHAT_SCROLL_SURFACE_CLASS,
        )}
      >
        <div className="flex flex-col gap-3">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>
                {t("pages.debtNegotiation.debts.conversationHistory.error")}
              </AlertDescription>
            </Alert>
          ) : null}

          {!error && chats.length === 0 ? (
            <Empty className="border-border/50 py-8">
              <EmptyHeader>
                <EmptyTitle>{t("pages.debtNegotiation.debts.conversationHistory.empty")}</EmptyTitle>
                <EmptyDescription />
              </EmptyHeader>
            </Empty>
          ) : null}

          {chats.map((chat) => (
            <ConversationChatBubble key={chat.id} chat={chat} mediasAtt={mediasAtt} />
          ))}

          <div ref={sentinelRef} className="h-4" />

          {isNextPending ? (
            <div className="flex justify-center py-2 text-xs text-muted-foreground">
              {t("pages.debtNegotiation.debts.conversationHistory.loading")}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
