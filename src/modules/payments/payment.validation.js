const { z } = require("zod");
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

module.exports = {
  orderId: z.object({ params: z.object({ orderId: objectId }) }),
  proof: z.object({
    params: z.object({ orderId: objectId }),
    body: z.object({
      transactionReference: z.string().min(2).optional(),
      senderPhone: z.string().min(7).optional(),
      senderName: z.string().min(2).optional(),
      paidAmount: z.coerce.number().min(0).optional(),
    }),
  }),
  idParam: z.object({ params: z.object({ id: objectId }) }),
  reject: z.object({ params: z.object({ id: objectId }), body: z.object({ rejectionReason: z.string().min(2) }) }),
};
