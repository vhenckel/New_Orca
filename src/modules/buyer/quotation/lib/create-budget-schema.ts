import { z } from "zod";

const MAX_OBSERVATION = 250;
const MAX_QTY = 100_000;

export const budgetProductLineSchema = z.object({
  productId: z.string().trim().min(1),
  baseProductId: z.string().optional(),
  quantity: z.coerce
    .number()
    .nonnegative()
    .max(MAX_QTY)
    .optional(),
  brandIds: z.array(z.string()).default([]),
  anyBrand: z.boolean().default(false),
  note: z.string().max(MAX_OBSERVATION).optional(),
});

export const createBudgetStep1Schema = z.object({
  establishmentId: z.string().uuid(),
  deadlineDate: z.date(),
  deadlineTime: z.string().min(1),
  deliveryTime: z.string().max(MAX_OBSERVATION).optional(),
  observation: z.string().max(MAX_OBSERVATION).optional().nullable(),
});

export const createBudgetFormSchema = createBudgetStep1Schema.extend({
  items: z
    .array(budgetProductLineSchema)
    .min(1, { message: "Adicione um produto" })
    .superRefine((items, ctx) => {
      const withQty = items.filter(
        (item) => Number.isFinite(item.quantity) && (item.quantity ?? 0) > 0,
      );
      if (withQty.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Adicione ao menos um produto com quantidade",
        });
        return;
      }
      for (const item of withQty) {
        if (item.anyBrand) continue;
        if (!item.brandIds.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Selecione marcas ou ative qualquer marca",
          });
        }
      }
    }),
});

export type CreateBudgetStep1Values = z.infer<typeof createBudgetStep1Schema>;
export type CreateBudgetFormValues = z.infer<typeof createBudgetFormSchema>;

export { MAX_QTY, MAX_OBSERVATION };
