export type ProductFormMode = "create" | "edit";

export function resolveProductFormMode(pathname: string): ProductFormMode {
  return pathname.includes("/edit") ? "edit" : "create";
}

export function isCoreFieldsDisabled(params: {
  isEstablishment: boolean;
  productStatus?: string;
  isCreatingNew: boolean;
}): boolean {
  if (!params.isEstablishment || params.isCreatingNew) return false;
  return params.productStatus?.toLowerCase() === "approved";
}
