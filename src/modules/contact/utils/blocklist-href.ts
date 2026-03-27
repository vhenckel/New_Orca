/** Rota da listagem de blocklist de contatos. */
export const CONTACT_BLOCKLIST_PATH = "/contacts/blocklist";

/** Query `contactsBlQ` na blocklist (dígitos do appkey, mesmo critério da listagem). */
export function blocklistFilteredHref(appkey: string | null | undefined): string {
  const digits = String(appkey ?? "").replace(/\D/g, "");
  if (!digits) return CONTACT_BLOCKLIST_PATH;
  return `${CONTACT_BLOCKLIST_PATH}?${new URLSearchParams({ contactsBlQ: digits }).toString()}`;
}
