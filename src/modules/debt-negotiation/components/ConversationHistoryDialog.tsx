import { useEffect, useRef } from "react";
import { useConversationHistory } from "@/modules/debt-negotiation/hooks/useConversationHistory";
import type {
  ConversationChat,
  ChatMessage,
  MediaAtt,
} from "@/modules/debt-negotiation/types/conversation-history";
import { useI18n } from "@/shared/i18n/useI18n";
import { SidePanelLayout } from "@/shared/ui/side-panel-layout";
import {
  SidePanel,
  SidePanelContent,
  SidePanelFooter,
  SidePanelTitle,
} from "@/shared/ui/side-panel";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

function formatMessageDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Renderiza texto com *palavra* em negrito. */
function textWithBold(text: string | undefined | null): React.ReactNode[] {
  if (text == null || typeof text !== "string") return [];
  const parts = text.split("*");
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function resolveMediaUrl(
  message: { mediaId?: string; url?: string },
  mediasAtt: MediaAtt[],
): string | undefined {
  if (message.url) return message.url;
  if (message.mediaId) {
    const att = mediasAtt.find((m) => m.mediaId === message.mediaId);
    return att?.publicUrl;
  }
  return undefined;
}

function MessageContent({
  message,
  mediasAtt,
}: {
  message: ChatMessage;
  mediasAtt: MediaAtt[];
}) {
  if (message.type === "text") {
    return (
      <p className="whitespace-pre-wrap break-words text-sm">
        {textWithBold(message.text)}
      </p>
    );
  }
  if (message.type === "image") {
    const url = resolveMediaUrl(message, mediasAtt);
    if (!url) {
      return (
        <span className="text-xs text-muted-foreground">
          Imagem não disponível
        </span>
      );
    }
    return (
      <div className="max-h-[70vh] min-w-[400px] max-w-full overflow-auto rounded-md border border-border">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={url}
            alt=""
            className="min-w-[400px] w-full object-contain object-left-top"
          />
        </a>
      </div>
    );
  }
  if (message.type === "document") {
    const url = resolveMediaUrl(message, mediasAtt);
    const label = message.fileName ?? "Documento";
    if (!url) {
      return (
        <span className="text-xs text-muted-foreground">
          Documento não disponível
        </span>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-sm underline hover:bg-muted"
      >
        <span className="shrink-0">📄</span>
        {label}
      </a>
    );
  }
  return (
    <div className="space-y-2">
      <p className="whitespace-pre-wrap break-words text-sm">
        {textWithBold(message.title)}
      </p>
      {message.items?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.items.map((item, i) => (
            <span
              key={i}
              className="inline-flex rounded-md border border-current/30 px-2 py-1 text-xs"
            >
              {item.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatBubble({
  chat,
  mediasAtt,
}: {
  chat: ConversationChat;
  mediasAtt: MediaAtt[];
}) {
  const { t } = useI18n();
  const isBot = chat.sender === 2;
  return (
    <div className={cn("flex w-full", isBot ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-0.5 rounded-lg px-3 py-2 shadow-sm",
          isBot
            ? "bg-muted rounded-br-md"
            : "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100 rounded-bl-md",
        )}
      >
        <span className="text-xs font-medium opacity-80">
          {isBot
            ? t("pages.debtNegotiation.debts.conversationHistory.botLabel")
            : t("pages.debtNegotiation.debts.conversationHistory.userLabel")}
        </span>
        <MessageContent message={chat.message} mediasAtt={mediasAtt} />
        <span className="text-right text-xs text-muted-foreground">
          {formatMessageDate(chat.date)}
        </span>
      </div>
    </div>
  );
}

interface ConversationHistoryDialogProps {
  contactId: number | null;
  contactName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConversationHistoryDialog({
  contactId,
  contactName,
  open,
  onOpenChange,
}: ConversationHistoryDialogProps) {
  const { t } = useI18n();
  const {
    chats,
    mediasAtt,
    isPending,
    isNextPending,
    error,
    fetchNextPage,
    hasNextPage,
  } = useConversationHistory(contactId, open);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !open) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isNextPending) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "80px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, hasNextPage, isNextPending, fetchNextPage]);

  useEffect(() => {
    if (open && scrollRef.current && chats.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, chats.length]);

  return (
    <SidePanel open={open} onOpenChange={onOpenChange}>
      <SidePanelContent size="xl">
        <SidePanelLayout
          header={
            <SidePanelTitle className="text-base">
              {t("pages.debtNegotiation.debts.conversationHistory.title")}
              {contactName ? ` – ${contactName}` : ""}
            </SidePanelTitle>
          }
          bodyClassName="p-0"
          footerLeft={
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.actions.cancel")}
            </Button>
          }
        >
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 h-full space-y-3 overflow-y-auto bg-background px-4 py-4"
          >
            {isPending && (
              <div className="flex justify-center py-8 text-sm text-muted-foreground">
                {t("pages.debtNegotiation.debts.conversationHistory.loading")}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {t("pages.debtNegotiation.debts.conversationHistory.error")}
              </div>
            )}
            {!isPending && !error && chats.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t("pages.debtNegotiation.debts.conversationHistory.empty")}
              </div>
            )}
            {chats.map((chat) => (
              <ChatBubble key={chat.id} chat={chat} mediasAtt={mediasAtt} />
            ))}
            <div ref={sentinelRef} className="h-4" />
            {isNextPending && (
              <div className="flex justify-center py-2 text-xs text-muted-foreground">
                {t("pages.debtNegotiation.debts.conversationHistory.loading")}
              </div>
            )}
          </div>
        </SidePanelLayout>
      </SidePanelContent>
    </SidePanel>
  );
}
