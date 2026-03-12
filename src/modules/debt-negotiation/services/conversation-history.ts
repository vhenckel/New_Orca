import { getSpotApiHeaders, spotApiBaseUrl, getDefaultCompanyId } from "@/shared/config/env";
import type { ConversationHistoryResponse } from "@/modules/debt-negotiation/types/conversation-history";

const CONVERSATION_HISTORY_PATH = "/trinity/contact";

const TAKE = 10;
const ORDER = "ASC";

export async function fetchConversationHistory(
  contactId: number,
  params?: { cursor?: string }
): Promise<ConversationHistoryResponse> {
  const companyId = getDefaultCompanyId();
  const search = new URLSearchParams({
    take: String(TAKE),
    order: ORDER,
    "companyIds[]": String(companyId),
  });
  if (params?.cursor) search.set("cursor", params.cursor);

  const url = `${spotApiBaseUrl}${CONVERSATION_HISTORY_PATH}/${contactId}/conversation-history?${search.toString()}`;
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Conversation history API error: ${res.status}`);
  }
  return res.json();
}
