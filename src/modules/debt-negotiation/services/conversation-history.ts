import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { spotJson } from "@/shared/api/http-client";
import type { ConversationHistoryResponse } from "@/modules/debt-negotiation/types/conversation-history";

const CONVERSATION_HISTORY_PATH = "/contact";

const TAKE = 10;
const ORDER = "ASC";

export async function fetchConversationHistory(
  contactId: number,
  params?: { cursor?: string }
): Promise<ConversationHistoryResponse> {
  const companyId = getCurrentCompanyId();
  const search = new URLSearchParams({
    take: String(TAKE),
    order: ORDER,
    "companyIds[]": String(companyId),
  });
  if (params?.cursor) search.set("cursor", params.cursor);

  return spotJson<ConversationHistoryResponse>(
    `${CONVERSATION_HISTORY_PATH}/${contactId}/conversation-history?${search.toString()}`
  );
}
