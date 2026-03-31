import type { ReactNode } from "react";
import type { MediaAtt } from "@/modules/debt-negotiation/types/conversation-history";

export const AGENT_MESSAGE_BACKGROUND_CLASS =
  "bg-muted rounded-br-md text-foreground border border-border/50";
export const PIX_CARD_BACKGROUND_CLASS = "bg-background/40 border border-border/30";

export const CHAT_IMAGE_IMG_PROPS = {
  loading: "lazy" as const,
  decoding: "async" as const,
  fetchPriority: "low" as const,
};

export function formatMessageDate(iso: string): string {
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

export function formatPixAmount(amount?: number): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "-";
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function textWithBold(text: string | undefined | null): ReactNode[] {
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

export function resolveMedia(
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

export function isLikelyPdf(fileName: string | undefined, url: string): boolean {
  const n = fileName?.toLowerCase().trim() ?? "";
  if (n.endsWith(".pdf")) return true;
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".pdf");
  } catch {
    return false;
  }
}
