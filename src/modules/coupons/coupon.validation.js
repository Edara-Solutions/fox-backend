const { z } = require("zod");
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

const body = z.object({
  code: z.string().min(2),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.coerce.number().min(0).optional(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  usageLimit: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  applicableCategories: z.array(objectId).optional(),
  applicableProducts: z.array(objectId).optional(),
});

module.exports = {
  create: z.object({ body }),
  update: z.object({ params: z.object({ id: objectId }), body: body.partial() }),
  validate: z.object({ body: z.object({ code: z.string().min(2), orderTotal: z.coerce.number().min(0) }) }),
  idParam: z.object({ params: z.object({ id: objectId }) }),
};
