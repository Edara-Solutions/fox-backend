const { z } = require("zod");
const PAYMENT_STATUS = require("../../constants/paymentStatus");
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);
const approvablePaymentStatuses = [PAYMENT_STATUS.PAID, PAYMENT_STATUS.PARTIALLY_PAID];

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
  approve: z.object({
    params: z.object({ id: objectId }),
    body: z
      .object({
        paymentStatus: z.enum(approvablePaymentStatuses),
        paidAmount: z.coerce.number().optional(),
      })
      .superRefine((body, ctx) => {
        if (body.paymentStatus === PAYMENT_STATUS.PARTIALLY_PAID && (body.paidAmount === undefined || body.paidAmount <= 0)) {
          ctx.addIssue({
            code: "custom",
            path: ["paidAmount"],
            message: "Paid amount is required for partial payment approval",
          });
        }
      }),
  }),
  reject: z.object({ params: z.object({ id: objectId }), body: z.object({ rejectionReason: z.string().min(2) }) }),
};
