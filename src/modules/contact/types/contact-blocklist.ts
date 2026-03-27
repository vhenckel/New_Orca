/** Resposta de POST /contact-black-list/list-grid (alinhado ao Spot). */
export interface ContactBlocklistItem {
  id: number;
  name: string;
  cpf: string;
  cnpj?: string | null;
  /** WhatsApp (appkey); preferir exibir formatado. */
  appkey?: string | null;
  phone?: string | null;
  date: string;
  reason: string;
  blockScope: string;
}

export type ContactBlocklistOrderDirection = "ASC" | "DESC";

export interface ContactBlocklistListResponse {
  count: number;
  total: number;
  data: ContactBlocklistItem[];
}

export interface ContactBlocklistListParams {
  companyId: number;
  take: number;
  skip: number;
  keyword?: string;
  /** Ordenação server-side (quando suportada pelo endpoint). */
  orderBy?: keyof ContactBlocklistItem | string;
  orderDirection?: ContactBlocklistOrderDirection;
}

export interface RemoveContactsFromBlocklistResponse {
  removed: number;
}
