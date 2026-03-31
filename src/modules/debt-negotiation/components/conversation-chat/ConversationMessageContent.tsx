import { FileText } from "lucide-react";
import type { ChatMessage, MediaAtt } from "@/modules/debt-negotiation/types/conversation-history";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { ConversationPixCard } from "./ConversationPixCard";
import {
  CHAT_IMAGE_IMG_PROPS,
  isLikelyPdf,
  resolveMedia,
  textWithBold,
} from "./chat-message.utils";

interface ConversationMessageContentProps {
  message: ChatMessage;
  mediasAtt: MediaAtt[];
}

export function ConversationMessageContent({
  message,
  mediasAtt,
}: ConversationMessageContentProps) {
  const { t } = useI18n();
  const fallbackTitle =
    "title" in message && typeof message.title === "string" ? message.title : undefined;

  if (message.type === "text") {
    return <p className="whitespace-pre-wrap break-words text-sm">{textWithBold(message.text)}</p>;
  }

  if (message.type === "image") {
    const { url } = resolveMedia(message, mediasAtt);
    if (!url) {
      return <span className="text-xs text-muted-foreground">Imagem não disponível</span>;
    }
    return (
      <div className="max-h-[min(70vh,560px)] max-w-md overflow-auto rounded-md border border-border">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
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
      return <span className="text-xs text-muted-foreground">Documento não disponível</span>;
    }

    const showPdfPreview = isLikelyPdf(fileName, url);

    return (
      <div className="flex max-w-md flex-col gap-2">
        {showPdfPreview ? (
          <div className="max-h-[min(45vh,420px)] min-h-[180px] min-w-[260px] max-w-full overflow-hidden rounded-md border border-border bg-muted/20">
            <iframe
              title={t("pages.debtNegotiation.debts.conversationHistory.documentPreviewTitle", {
                name: label,
              })}
              src={url}
              className="h-[min(45vh,420px)] w-full border-0"
            />
          </div>
        ) : null}
        <Button asChild variant="outline" size="sm" className="w-fit">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <FileText data-icon="inline-start" aria-hidden />
            {label}
          </a>
        </Button>
      </div>
    );
  }

  if (message.type === "audio") {
    const { url, fileName } = resolveMedia(message, mediasAtt);
    const ariaName =
      fileName ?? t("pages.debtNegotiation.debts.conversationHistory.audioUntitled");
    const previewTitle = t("pages.debtNegotiation.debts.conversationHistory.audioPreviewTitle", {
      name: ariaName,
    });
    if (!url) {
      return (
        <span className="text-xs text-muted-foreground">
          {t("pages.debtNegotiation.debts.conversationHistory.audioUnavailable")}
        </span>
      );
    }
    return (
      <div className="flex max-w-md flex-col gap-2">
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
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{message.transcription}</p>
        ) : null}
      </div>
    );
  }

  if (message.type === "pix_dynamic_code" || message.type === "dynamic_pix_message") {
    return <ConversationPixCard message={message} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="whitespace-pre-wrap break-words text-sm">{textWithBold(fallbackTitle)}</p>
      {message.items?.length ? (
        <div
          className={cn(
            "flex flex-wrap gap-1.5",
            message.type === "button" && "rounded-md border border-border/60 p-2",
          )}
        >
          {message.items.map((item, i) => (
            <Badge key={i} variant="secondary">
              {item.title}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
