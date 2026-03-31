import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";

export type ChatMessageRoleLabelVariant = "bot" | "user";

export interface ChatMessageRoleLabelProps {
  variant: ChatMessageRoleLabelVariant;
  className?: string;
}

/** Rótulo "Agente de IA" / "Usuário" acima do balão (fora do fundo colorido). */
export function ChatMessageRoleLabel({ variant, className }: ChatMessageRoleLabelProps) {
  const { t } = useI18n();
  const text =
    variant === "bot"
      ? t("pages.debtNegotiation.debts.conversationHistory.botLabel")
      : t("pages.debtNegotiation.debts.conversationHistory.userLabel");

  return (
    <span className={cn("text-xs font-medium opacity-80", className)}>{text}</span>
  );
}
