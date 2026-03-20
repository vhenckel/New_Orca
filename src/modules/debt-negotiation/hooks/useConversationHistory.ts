import { useState, useEffect, useCallback } from "react";
import {
  CONVERSATION_HISTORY_TAKE,
  fetchConversationHistory,
} from "@/modules/debt-negotiation/services/conversation-history";
import type { ConversationChat, MediaAtt } from "@/modules/debt-negotiation/types/conversation-history";

function mergeMediasAtt(prev: MediaAtt[], next: MediaAtt[]): MediaAtt[] {
  const byMediaId = new Map(prev.map((m) => [m.mediaId, m]));
  next.forEach((m) => byMediaId.set(m.mediaId, m));
  return Array.from(byMediaId.values());
}

export function useConversationHistory(contactId: number | null, open: boolean) {
  const [chats, setChats] = useState<ConversationChat[]>([]);
  const [mediasAtt, setMediasAtt] = useState<MediaAtt[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isNextPending, setIsNextPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const loadPage = useCallback(
    async (cursorParam?: string) => {
      if (!contactId) return;
      const isFirst = !cursorParam;
      if (isFirst) setIsPending(true);
      else setIsNextPending(true);
      setError(null);
      try {
        const res = await fetchConversationHistory(contactId, cursorParam ? { cursor: cursorParam } : undefined);
        const pageChats = res.chats.filter((chat) => chat.sender === 1 || chat.sender === 2);
        if (isFirst) {
          setChats(pageChats);
          setMediasAtt(res.mediasAtt ?? []);
        } else {
          setChats((prev) => [...prev, ...pageChats]);
          setMediasAtt((prev) => mergeMediasAtt(prev, res.mediasAtt ?? []));
        }
        /** Página cheia na resposta bruta ⇒ provável próxima página (alinhado ao `take` da API). */
        setHasNextPage(res.chats.length >= CONVERSATION_HISTORY_TAKE);
        setCursor(res.chats.length > 0 ? res.chats[res.chats.length - 1].id : null);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setIsPending(false);
        setIsNextPending(false);
      }
    },
    [contactId]
  );

  useEffect(() => {
    if (open && contactId) {
      setChats([]);
      setMediasAtt([]);
      setCursor(null);
      setHasNextPage(true);
      loadPage();
    }
  }, [open, contactId, loadPage]);

  const fetchNextPage = useCallback(() => {
    if (cursor && hasNextPage && !isNextPending && contactId) loadPage(cursor);
  }, [cursor, hasNextPage, isNextPending, contactId, loadPage]);

  return { chats, mediasAtt, isPending, isNextPending, error, fetchNextPage, hasNextPage };
}
