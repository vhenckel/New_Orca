import { z } from "zod";

import { PACKAGING_UNITS, PRODUCT_UNIT_TYPES } from "@/modules/product/lib/product-constants";

const gtinSchema = z
  .string()
  .optional()
  .transform((val) => val?.trim() || undefined)
  .refine((val) => !val || /^[0-9]{8}$|^[0-9]{12}$|^[0-9]{13}$|^[0-9]{14}$/.test(val), {
    message: "modules.product.form.errors.gtin",
  });

export const productBrandSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "modules.product.form.errors.brandName")
    .max(250, "modules.product.form.errors.brandNameMax"),
  gtin: gtinSchema,
  status: z.enum(["approved", "pending", "rejected"]).optional(),
});

export const productFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "modules.product.form.errors.name")
      .max(250, "modules.product.form.errors.nameMax"),
    brands: z.array(productBrandSchema).default([]),
    unitType: z.enum(PRODUCT_UNIT_TYPES, {
      errorMap: () => ({ message: "modules.product.form.errors.unitType" }),
    }),
    packagingUnit: z
      .object({
        unit: z.enum(PACKAGING_UNITS).optional(),
        weight: z.number().positive("modules.product.form.errors.packagingWeight").optional(),
      })
      .optional(),
    segmentIds: z.array(z.string()).min(1, "modules.product.form.errors.segments"),
    ncm: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined)
      .refine((val) => !val || /^[0-9]{8}$/.test(val), {
        message: "modules.product.form.errors.ncm",
      }),
    status: z.enum(["approved", "pending", "rejected"]).default("approved"),
    establishmentId: z.string().uuid().optional().or(z.literal("")),
    quoteAnyBrand: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.unitType === "un") {
      if (!data.packagingUnit?.weight) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "modules.product.form.errors.packagingWeight",
          path: ["packagingUnit", "weight"],
        });
      }
      if (!data.packagingUnit?.unit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "modules.product.form.errors.packagingUnit",
          path: ["packagingUnit", "unit"],
        });
      }
    }
  });

export type ProductFormSchemaValues = z.infer<typeof productFormSchema>;

export const defaultProductFormValues: ProductFormSchemaValues = {
  name: "",
  brands: [],
  unitType: "kg",
  packagingUnit: { unit: undefined, weight: undefined },
  segmentIds: [],
  ncm: "",
  status: "approved",
  establishmentId: "",
  quoteAnyBrand: false,
};
