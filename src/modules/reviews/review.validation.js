const { z } = require("zod");
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

module.exports = {
  create: z.object({ params: z.object({ productId: objectId }), body: z.object({ rating: z.coerce.number().int().min(1).max(5), comment: z.string().optional(), order: objectId.optional() }) }),
  update: z.object({ params: z.object({ id: objectId }), body: z.object({ rating: z.coerce.number().int().min(1).max(5).optional(), comment: z.string().optional() }) }),
  productId: z.object({ params: z.object({ productId: objectId }) }),
  idParam: z.object({ params: z.object({ id: objectId }) }),
};
