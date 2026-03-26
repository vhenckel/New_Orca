/** Detalhes completos de um contato retornados pela API /trinity/contact/:id/details. */
export interface ContactDetails {
  createdByUser: string;
  ownerUserName: string;
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  /** String ou objeto serializado (ex.: `{ originOption: { name } }`). */
  origin: string | null | Record<string, unknown>;
  lastPipelineStage: string | null;
  persona: string | null;
  genre: string | null;
  maritalStatus: string | null;
  schooling: string | null;
  birthDate: string | null;
  professionalSituation: string | null;
  income: number | null;
  profession: string | null;
  optin: Array<{
    label: string;
    validated: boolean | number;
  }>;
  deals: unknown[];
  addressState: string | null;
  addressCity: string | null;
  addressNeighborhood: string | null;
  addressZipcode: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  contactListName: string | null;
}

