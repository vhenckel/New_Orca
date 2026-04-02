import { useI18n } from "@/shared/i18n/useI18n";
import { useConversationHistory } from "@/modules/debt-negotiation/hooks/useConversationHistory";
import { SidePanelLayout } from "@/shared/ui/side-panel-layout";
import {
  SidePanel,
  SidePanelContent,
  SidePanelTitle,
} from "@/shared/ui/side-panel";
import { Button } from "@/shared/ui/button";
import { ConversationChatList } from "@/modules/debt-negotiation/components/conversation-chat";

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
    canRevealChatList,
  } = useConversationHistory(contactId, open);

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
          bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
          footerLeft={
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.actions.cancel")}
            </Button>
          }
        >
          <ConversationChatList
            chats={chats}
            mediasAtt={mediasAtt}
            isPending={isPending}
            canRevealChatList={canRevealChatList}
            isNextPending={isNextPending}
            hasNextPage={hasNextPage}
            error={error}
            fetchNextPage={fetchNextPage}
          />
        </SidePanelLayout>
      </SidePanelContent>
    </SidePanel>
  );
}
