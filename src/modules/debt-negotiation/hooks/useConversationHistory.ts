import { useState, useEffect, useCallback, useRef } from "react";
import {
  CONVERSATION_HISTORY_TAKE,
  fetchConversationHistory,
} from "@/modules/debt-negotiation/services/conversation-history";
import type { ConversationChat, MediaAtt } from "@/modules/debt-negotiation/types/conversation-history";

/** Tempo mínimo com loader ao abrir o painel quando há mensagens (evita ver o scroll “a correr” até ao fim). */
export const CONVERSATION_HISTORY_MIN_REVEAL_MS = 1000;

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
  const [canRevealChatList, setCanRevealChatList] = useState(false);

  const sessionStartRef = useRef(0);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRevealAfterFirstPage = useCallback((holdIfHasMessages: boolean) => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (!holdIfHasMessages) {
      setCanRevealChatList(true);
      return;
    }
    const elapsed = Date.now() - sessionStartRef.current;
    const remaining = Math.max(0, CONVERSATION_HISTORY_MIN_REVEAL_MS - elapsed);
    if (remaining <= 0) {
      setCanRevealChatList(true);
      return;
    }
    revealTimeoutRef.current = setTimeout(() => {
      revealTimeoutRef.current = null;
      setCanRevealChatList(true);
    }, remaining);
  }, []);

  const loadPage = useCallback(
    async (cursorParam?: string) => {
      if (!contactId) return;
      const isFirst = !cursorParam;
      if (isFirst) setIsPending(true);
      else setIsNextPending(true);
      setError(null);
      let firstHadError = false;
      let holdRevealForMessages = false;
      try {
        const res = await fetchConversationHistory(contactId, cursorParam ? { cursor: cursorParam } : undefined);
        const pageChats = res.chats.filter((chat) => chat.sender === 1 || chat.sender === 2);
        if (isFirst) {
          setChats(pageChats);
          setMediasAtt(res.mediasAtt ?? []);
          holdRevealForMessages = pageChats.length > 0;
        } else {
          setChats((prev) => [...prev, ...pageChats]);
          setMediasAtt((prev) => mergeMediasAtt(prev, res.mediasAtt ?? []));
        }
        /** Página cheia na resposta bruta ⇒ provável próxima página (alinhado ao `take` da API). */
        setHasNextPage(res.chats.length >= CONVERSATION_HISTORY_TAKE);
        setCursor(res.chats.length > 0 ? res.chats[res.chats.length - 1].id : null);
      } catch (e) {
        firstHadError = true;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setIsPending(false);
        setIsNextPending(false);
        if (isFirst) {
          if (firstHadError) scheduleRevealAfterFirstPage(false);
          else scheduleRevealAfterFirstPage(holdRevealForMessages);
        }
      }
    },
    [contactId, scheduleRevealAfterFirstPage],
  );

  useEffect(() => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (open && contactId) {
      sessionStartRef.current = Date.now();
      setCanRevealChatList(false);
      setChats([]);
      setMediasAtt([]);
      setCursor(null);
      setHasNextPage(true);
      loadPage();
    }
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
    };
  }, [open, contactId, loadPage]);

  const fetchNextPage = useCallback(() => {
    if (cursor && hasNextPage && !isNextPending && contactId) loadPage(cursor);
  }, [cursor, hasNextPage, isNextPending, contactId, loadPage]);

  return {
    chats,
    mediasAtt,
    isPending,
    isNextPending,
    error,
    fetchNextPage,
    hasNextPage,
    canRevealChatList,
  };
}
