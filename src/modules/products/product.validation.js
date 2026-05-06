const { z } = require("zod");
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

const body = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  shortDescription: z.string().optional(),
  brand: objectId,
  category: objectId,
  images: z.array(z.string()).optional(),
  price: z.coerce.number().min(0),
  discountPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  sku: z.string().min(1),
  flavors: z.array(z.string()).optional(),
  size: z.string().optional(),
  weight: z.string().optional(),
  servings: z.coerce.number().optional(),
  ingredients: z.array(z.string()).optional(),
  nutritionFacts: z.record(z.string(), z.any()).optional(),
  warnings: z.string().optional(),
  usageInstructions: z.string().optional(),
  expiryDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

module.exports = {
  create: z.object({ body }),
  update: z.object({ params: z.object({ id: objectId }), body: body.partial() }),
  updateStock: z.object({ params: z.object({ id: objectId }), body: z.object({ stock: z.coerce.number().int().min(0) }) }),
  slugParam: z.object({ params: z.object({ slug: z.string().min(1) }) }),
  idParam: z.object({ params: z.object({ id: objectId }) }),
};
