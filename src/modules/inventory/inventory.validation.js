const { z } = require("zod");
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

module.exports = {
  adjust: z.object({
    params: z.object({ productId: objectId }),
    body: z.object({ quantity: z.coerce.number().int(), reason: z.string().min(2) }),
  }),
};
