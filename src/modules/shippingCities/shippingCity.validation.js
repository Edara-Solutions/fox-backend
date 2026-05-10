const { z } = require("zod");
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);
const booleanValue = z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true");

const body = z.object({
  name: z.string().min(2).trim(),
  shippingFee: z.coerce.number().min(0),
  isActive: booleanValue.optional(),
});

module.exports = {
  create: z.object({ body }),
  update: z.object({ params: z.object({ id: objectId }), body: body.partial() }),
  idParam: z.object({ params: z.object({ id: objectId }) }),
};
