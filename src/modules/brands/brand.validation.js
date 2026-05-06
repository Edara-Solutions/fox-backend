const { z } = require("zod");
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);
const body = z.object({ name: z.string().min(2), description: z.string().optional(), logo: z.string().optional(), isActive: z.boolean().optional() });

module.exports = {
  create: z.object({ body }),
  update: z.object({ params: z.object({ id: objectId }), body: body.partial() }),
  slugParam: z.object({ params: z.object({ slug: z.string().min(1) }) }),
  idParam: z.object({ params: z.object({ id: objectId }) }),
};
