export const PRODUCT_UNIT_TYPES = ["kg", "un"] as const;
export type ProductUnitType = (typeof PRODUCT_UNIT_TYPES)[number];

export const PACKAGING_UNITS = ["g", "kg", "l", "ml", "un"] as const;
export type PackagingUnitType = (typeof PACKAGING_UNITS)[number];

export const APPROVAL_STATUSES = ["approved", "pending", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const EMPTY_VARIANT_ID = "empty-variant";

export const PRODUCT_UNIT_OPTIONS: { value: ProductUnitType; labelKey: string }[] = [
  { value: "kg", labelKey: "modules.product.form.unitType.kg" },
  { value: "un", labelKey: "modules.product.form.unitType.un" },
];

export const PACKAGING_UNIT_OPTIONS: { value: PackagingUnitType; labelKey: string }[] = [
  { value: "g", labelKey: "modules.product.form.packaging.g" },
  { value: "kg", labelKey: "modules.product.form.packaging.kg" },
  { value: "l", labelKey: "modules.product.form.packaging.l" },
  { value: "ml", labelKey: "modules.product.form.packaging.ml" },
  { value: "un", labelKey: "modules.product.form.packaging.un" },
];
