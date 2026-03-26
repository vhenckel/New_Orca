/** GET /contact-black-list/list-black-list-reasons */
export interface ContactBlacklistReason {
  id: number;
  name: string;
  description: string;
  blockScope: string;
  isActive: boolean;
  createdAt: string;
}

/** POST /contact-black-list/add-black-list */
export interface AddContactsToBlocklistInput {
  contactIds: number[];
  contactBlockListReasonIds: number[];
}

export interface AddContactsToBlocklistResponse {
  ids: number[];
}
