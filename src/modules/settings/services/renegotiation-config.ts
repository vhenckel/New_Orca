import { spotFetch, spotJson } from "@/shared/api/http-client";

import type { RenegotiationConfigDto, RenegotiationConfigPayload } from "@/modules/settings/types";

function configUrl(companyId: number): string {
  return `/renegotiation/config?companyId=${companyId}`;
}

export function fetchRenegotiationConfig(companyId: number): Promise<RenegotiationConfigDto> {
  return spotJson<RenegotiationConfigDto>(configUrl(companyId));
}

export async function updateRenegotiationConfig(
  companyId: number,
  payload: RenegotiationConfigPayload,
): Promise<void> {
  await spotFetch(configUrl(companyId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

