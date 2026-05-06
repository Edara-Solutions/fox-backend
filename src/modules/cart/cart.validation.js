const { z } = require("zod");
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

module.exports = {
  addItem: z.object({ body: z.object({ productId: objectId, quantity: z.coerce.number().int().min(1), selectedFlavor: z.string().optional() }) }),
  updateItem: z.object({ params: z.object({ itemId: objectId }), body: z.object({ quantity: z.coerce.number().int().min(1) }) }),
  itemId: z.object({ params: z.object({ itemId: objectId }) }),
};
