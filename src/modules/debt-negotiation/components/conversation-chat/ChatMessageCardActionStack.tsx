import type { ReactNode } from "react";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { PIX_CARD_BACKGROUND_CLASS } from "./chat-message.utils";

export interface ChatMessageCardActionStackProps {
  /** Conteúdo do card (texto, etc.). */
  body: ReactNode;
  /** Bloco abaixo do card (ex.: lista estilo WhatsApp), alinhado ao CTA Pix. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Card de mensagem + ações como irmãos (`gap-1`), mesmo padrão visual do bloco Pix.
 */
export function ChatMessageCardActionStack({
  body,
  actions,
  className,
}: ChatMessageCardActionStackProps) {
  return (
    <div className={cn("flex w-full max-w-md flex-col gap-1", className)}>
      <Card
        className={cn(
          "gap-0 px-3 py-3 shadow-none",
          PIX_CARD_BACKGROUND_CLASS,
        )}
      >
        {body}
      </Card>
      {actions != null ? (
        <div className="overflow-hidden rounded-lg">{actions}</div>
      ) : null}
    </div>
  );
}
