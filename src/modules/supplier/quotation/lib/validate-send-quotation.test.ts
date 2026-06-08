import { describe, expect, it } from "vitest";

import { validateSendQuotation } from "@/modules/supplier/quotation/lib/validate-send-quotation";
import type { SupplierQuotationDetailItem } from "@/modules/supplier/quotation/types/quotation-detail";

function tomorrowInput(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const baseItem: SupplierQuotationDetailItem = {
  id: "item-1",
  productId: "product-1",
  productName: "Produto",
  requestedPackaging: "1 un",
  segments: [],
  quantity: 1,
  unitLabel: "un",
  isBlocked: false,
};

describe("validateSendQuotation", () => {
  it("accepts quotation with only a priced alternative line", () => {
    const result = validateSendQuotation({
      commercialTerms: {
        paymentMethod: "Pix",
        paymentDeadline: "30 dias",
        delivery: "24h",
        quotationValidUntil: tomorrowInput(),
      },
      items: [baseItem],
      responses: {
        "alt-item-1": { unitPrice: "10,00" },
      },
      alternativeLines: [
        {
          id: "alt-item-1",
          parentItemId: "item-1",
          brand: "Marca X",
          packagingAmount: "500",
          packagingUnit: "g",
        },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects when no priced line exists", () => {
    const result = validateSendQuotation({
      commercialTerms: {
        paymentMethod: "Pix",
        paymentDeadline: "30 dias",
        delivery: "24h",
        quotationValidUntil: tomorrowInput(),
      },
      items: [baseItem],
      responses: {},
      alternativeLines: [],
    });

    expect(result.valid).toBe(false);
    expect(result.firstInvalidField).toBe("items");
  });
});
