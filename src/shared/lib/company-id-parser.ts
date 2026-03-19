import { parseAsInteger } from "nuqs";

/** Parser para companyId na URL (ex.: debug). Multi-tenant: normalmente vem do auth. */
export const companyIdParser = parseAsInteger.withDefault(0);
