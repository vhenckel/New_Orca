import { useEffect, useRef } from "react";
import type { ConversationChat, MediaAtt } from "@/modules/debt-negotiation/types/conversation-history";
import { useI18n } from "@/shared/i18n/useI18n";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/ui/empty";
import { ConversationChatBubble } from "./ConversationChatBubble";

interface ConversationChatListProps {
  chats: ConversationChat[];
  mediasAtt: MediaAtt[];
  isPending: boolean;
  isNextPending: boolean;
  hasNextPage: boolean;
  error: unknown;
  fetchNextPage: () => void;
}

export function ConversationChatList({
  chats,
  mediasAtt,
  isPending,
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

  useEffect(() => {
    if (scrollRef.current && chats.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats.length]);

  return (
    <div
      ref={scrollRef}
      className="h-full min-h-0 flex-1 overflow-y-auto bg-background px-4 py-4"
    >
      <div className="flex flex-col gap-3">
        {isPending ? (
          <div className="flex justify-center py-8 text-sm text-muted-foreground">
            {t("pages.debtNegotiation.debts.conversationHistory.loading")}
          </div>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>
              {t("pages.debtNegotiation.debts.conversationHistory.error")}
            </AlertDescription>
          </Alert>
        ) : null}

        {!isPending && !error && chats.length === 0 ? (
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
  );
}
