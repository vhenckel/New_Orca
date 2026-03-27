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
import { FileText } from "lucide-react";

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

/** Prefer `mediasAtt.publicUrl` (same request) over `message.url` (short-lived gateway URL). */
function resolveMedia(
  message: { mediaId?: string; url?: string; fileName?: string },
  mediasAtt: MediaAtt[],
): { url?: string; fileName?: string } {
  if (message.mediaId) {
    const att = mediasAtt.find((m) => m.mediaId === message.mediaId);
    if (att?.publicUrl) {
      return {
        url: att.publicUrl,
        fileName: att.fileName ?? message.fileName,
      };
    }
  }
  if (message.url) {
    return { url: message.url, fileName: message.fileName };
  }
  return {};
}

/**
 * Chat images use a single full-resolution URL. Smaller file size / lower quality
 * needs a thumbnail from the API or a CDN transform — do not append query params
 * to presigned URLs (breaks signature).
 *
 * Here we only defer work: lazy load, async decode, low network priority vs critical CSS/JS.
 */
const CHAT_IMAGE_IMG_PROPS = {
  loading: "lazy" as const,
  decoding: "async" as const,
  fetchPriority: "low" as const,
};

/** Best-effort PDF detection for inline preview (browser iframe). */
function isLikelyPdf(fileName: string | undefined, url: string): boolean {
  const n = fileName?.toLowerCase().trim() ?? "";
  if (n.endsWith(".pdf")) return true;
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".pdf");
  } catch {
    return false;
  }
}

function MessageContent({
  message,
  mediasAtt,
}: {
  message: ChatMessage;
  mediasAtt: MediaAtt[];
}) {
  const { t } = useI18n();
  if (message.type === "text") {
    return (
      <p className="whitespace-pre-wrap break-words text-sm">
        {textWithBold(message.text)}
      </p>
    );
  }
  if (message.type === "image") {
    const { url } = resolveMedia(message, mediasAtt);
    if (!url) {
      return (
        <span className="text-xs text-muted-foreground">
          Imagem não disponível
        </span>
      );
    }
    return (
      <div className="max-h-[min(70vh,560px)] max-w-md overflow-auto rounded-md border border-border">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={url}
            alt=""
            {...CHAT_IMAGE_IMG_PROPS}
            className="h-auto w-full max-h-[min(70vh,560px)] object-contain object-left-top"
          />
        </a>
      </div>
    );
  }
  if (message.type === "document") {
    const { url, fileName } = resolveMedia(message, mediasAtt);
    const label = fileName ?? "Documento";
    if (!url) {
      return (
        <span className="text-xs text-muted-foreground">
          Documento não disponível
        </span>
      );
    }
    const showPdfPreview = isLikelyPdf(fileName, url);
    return (
      <div className="space-y-2">
        {showPdfPreview ? (
          <div className="max-h-[min(45vh,420px)] min-h-[180px] min-w-[260px] max-w-full overflow-hidden rounded-md border border-border bg-muted/20">
            <iframe
              title={t(
                "pages.debtNegotiation.debts.conversationHistory.documentPreviewTitle",
                { name: label },
              )}
              src={url}
              className="h-[min(45vh,420px)] w-full border-0"
            />
          </div>
        ) : null}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-sm underline hover:bg-muted"
        >
          <FileText className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          {label}
        </a>
      </div>
    );
  }
  if (message.type === "audio") {
    const { url, fileName } = resolveMedia(message, mediasAtt);
    const ariaName = fileName ?? t("pages.debtNegotiation.debts.conversationHistory.audioUntitled");
    const previewTitle = t(
      "pages.debtNegotiation.debts.conversationHistory.audioPreviewTitle",
      { name: ariaName },
    );
    if (!url) {
      return (
        <span className="text-xs text-muted-foreground">
          {t("pages.debtNegotiation.debts.conversationHistory.audioUnavailable")}
        </span>
      );
    }
    return (
      <div className="space-y-2 max-w-md">
        <audio
          controls
          preload="metadata"
          src={url}
          className="w-full max-w-full"
          aria-label={previewTitle}
          title={previewTitle}
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-xs text-muted-foreground underline hover:text-foreground"
        >
          {t("pages.debtNegotiation.debts.conversationHistory.audioOpenDownload")}
        </a>
        {message.transcription ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {message.transcription}
          </p>
        ) : null}
      </div>
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
    if (!open) return;
    const sentinel = sentinelRef.current;
    const scrollRoot = scrollRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isNextPending) {
          fetchNextPage();
        }
      },
      /** `root` = área rolável do painel (viewport enganava com painel lateral). */
      { root: scrollRoot, rootMargin: "80px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasNextPage, isNextPending, fetchNextPage, chats.length]);

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
