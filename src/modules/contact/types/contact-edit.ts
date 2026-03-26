/** Opções retornadas por GET /contact/fields. */
export interface ContactFieldOption {
  label: string;
  value: string;
}

export interface ContactFieldsResponse {
  genre: ContactFieldOption[];
  contactOrigin: ContactFieldOption[];
  incomes: ContactFieldOption[];
  maritalStatus: ContactFieldOption[];
  persona: ContactFieldOption[];
  professionalSituation: ContactFieldOption[];
  schooling: ContactFieldOption[];
  pipelines: ContactFieldOption[];
}

/**
 * Contato bruto da API GET /contact/:id (campos usados no formulário).
 * Relações aninhadas podem vir na resposta; não enviar de volta no save.
 */
export interface ContactEntityForEdit {
  id?: number | string;
  companyId?: number;
  channelTypeId?: number;
  appkey?: string | null;
  phone?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  name?: string | null;
  email?: string | null;
  pix?: string | null;
  birthDate?: string | Date | null;
  lastPipelineStageId?: number | null;
  genreId?: number | null;
  incomeId?: number | null;
  incomeValue?: number | string | null;
  schoolingId?: number | null;
  maritalStatusId?: number | null;
  profession?: string | null;
  professionalSituationId?: number | null;
  employerName?: string | null;
  personaId?: number | null;
  originId?: number | string | null;
  addressCountry?: string | null;
  addressState?: string | null;
  addressCity?: string | null;
  addressNeighborhood?: string | null;
  addressZipcode?: string | null;
  addressStreet?: string | null;
  addressNumber?: string | null;
  addressAdjunct?: string | null;
  motherName?: string | null;
  fatherName?: string | null;
  bornCity?: string | null;
  bornState?: string | null;
  [key: string]: unknown;
}
