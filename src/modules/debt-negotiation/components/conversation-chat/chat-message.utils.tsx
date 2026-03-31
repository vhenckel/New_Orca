import type { ReactNode } from "react";
import type {
  ChatMessagePixDynamicCode,
  MediaAtt,
} from "@/modules/debt-negotiation/types/conversation-history";
import { cn } from "@/shared/lib/utils";

/** Extrai string copiável (EMV) do item da mensagem Pix; cobre camelCase/snake_case e aliases comuns. */
export function extractPixCodeFromItem(item: unknown): string | undefined {
  if (!item || typeof item !== "object") return undefined;
  const o = item as Record<string, unknown>;
  const pd = (o.pixData ?? o.pix_data) as Record<string, unknown> | undefined;
  if (pd && typeof pd === "object") {
    const raw =
      pd.code ?? pd.copyPaste ?? pd.emv ?? pd.brCode ?? pd.pixCopiaECola ?? pd.pix_copia_e_cola;
    if (typeof raw === "string") {
      const t = raw.trim();
      if (t) return t;
    }
  }
  const flat = o.code ?? o.copyPaste ?? o.emv;
  if (typeof flat === "string") {
    const t = flat.trim();
    if (t) return t;
  }
  return undefined;
}

export function extractPixCodeFromPixMessage(message: ChatMessagePixDynamicCode): string | undefined {
  for (const it of message.items ?? []) {
    const c = extractPixCodeFromItem(it);
    if (c) return c;
  }
  return undefined;
}

/** Área rolável do histórico: levemente distinta do painel (light como referência). */
export const CHAT_SCROLL_SURFACE_CLASS =
  "bg-slate-100/80 dark:bg-background/60";

/** Superfície compartilhada: balão de texto do agente e card Pix (evita fundo “diferente” no dark). */
export const AGENT_MESSAGE_SURFACE_CLASS = cn(
  "border border-slate-200 bg-slate-100/90 dark:border-slate-600/70 dark:bg-slate-800/95",
);

/** Balão do agente: superfície + canto e sombra do chat. */
export const AGENT_MESSAGE_BACKGROUND_CLASS = cn(
  "rounded-br-md text-foreground shadow-sm",
  AGENT_MESSAGE_SURFACE_CLASS,
);

/**
 * CTA primário (Pix “Pagar com PIX agora” e opções `type: "button"` abaixo do card).
 */
export const CHAT_PIX_CTA_BUTTON_CLASS = cn(
  "h-auto min-h-10 w-full whitespace-normal rounded-lg px-3 py-2.5 text-center text-sm font-medium leading-snug shadow-md",
  "border-0 bg-primary text-primary-foreground hover:bg-primary/90",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50",
);

/** Card de conteúdo Pix: mesma base visual do balão de texto do agente. */
export const PIX_CARD_BACKGROUND_CLASS = cn("shadow-sm", AGENT_MESSAGE_SURFACE_CLASS);

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

/** Horário curto para canto do balão (estilo WhatsApp). */
export function formatMessageTimeShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", {
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
