/** GET /contact/person/query */
export interface PersonContactClusterResponse {
  personId: number | null;
  contacts: PersonContactListItem[];
}

export interface PersonContactListItem {
  id: number;
  name: string;
  appkey: string | null;
  main: boolean;
  isInBlackList: boolean;
  linkedAt?: string;
}

/** GET /contact/person/:personId/details */
export interface PersonDetailsResponse {
  person: PersonDetailsPayload;
  contacts: PersonContactListItem[];
}

export interface PersonDetailsPayload {
  id: number;
  companyId: number;
  name: string;
  cpf: string | null;
  cnpj: string | null;
  externalId?: string | null;
  pix?: string | null;
  birthDate?: string | null;
  email?: string | null;
  genreId?: number | null;
  incomeId?: number | null;
  incomeValue?: number | null;
  schoolingId?: number | null;
  maritalStatusId?: number | null;
  profession?: string | null;
  professionalSituationId?: number | null;
  employerName?: string | null;
  motherName?: string;
  fatherName?: string;
  bornCity?: string;
  bornState?: string;
  deathYear?: string;
  deathDesc?: string;
  document_number?: string;
  documentOrgaoEmissor?: string;
  documentEstadoEmissao?: string;
  documentDataEmissao?: string | null;
  addressCountry?: string;
  addressState?: string;
  addressCity?: string;
  addressNeighborhood?: string;
  addressZipcode?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressAdjunct?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonContactQueryParams {
  companyId: number;
  /** Preferência: query param dedicado (espelha backend). */
  contactId: number;
}
