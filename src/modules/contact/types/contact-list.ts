/** Item de contato retornado pela API /trinity/contact/query com transformer=to-frontend-list. */
export interface ContactListItem {
  id: string;
  name: string;
  cpf?: string | null;
  cnpj?: string | null;
  nps: number | null;
  egr: number | null;
  ltv: number | null;
  whatsapp: string;
  optStatus: number;
  lifeCycle: string;
  firstConversation: string;
  lastContract: string;
  updatedAt: string;
}

export type ContactListOrderDirection = "ASC" | "DESC";

export interface ContactListResponse {
  total: number;
  count: number;
  data: ContactListItem[];
}

export interface ContactListParams {
  take: number;
  skip: number;
  companyId: number;
  usePerson?: boolean;
  /** Filtros adicionais (where). Default: contractDate, conversationDate, isInBlackList: false */
  where?: Record<string, unknown>;
  /** Ordenação server-side (quando suportada pelo endpoint). */
  orderBy?: keyof ContactListItem | string;
  orderDirection?: ContactListOrderDirection;
}
