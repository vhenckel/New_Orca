/** Resposta de POST /contact-black-list/list-grid (alinhado ao Spot). */
export interface ContactBlocklistItem {
  id: number;
  name: string;
  cpf: string;
  /** WhatsApp (appkey); preferir exibir formatado. */
  appkey?: string | null;
  phone?: string | null;
  date: string;
  reason: string;
  blockScope: string;
}

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
}

export interface RemoveContactsFromBlocklistResponse {
  removed: number;
}
