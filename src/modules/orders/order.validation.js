const { z } = require("zod");
const PAYMENT_METHODS = require("../../constants/paymentMethods");
const ORDER_STATUS = require("../../constants/orderStatus");
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

module.exports = {
  create: z.object({
    body: z.object({
      shippingDetails: z.record(z.string(), z.any()),
      paymentMethod: z.enum(Object.values(PAYMENT_METHODS)),
      couponCode: z.string().optional(),
      notes: z.string().optional(),
      shippingFee: z.coerce.number().min(0).optional(),
    }),
  }),
  updateStatus: z.object({ params: z.object({ id: objectId }), body: z.object({ orderStatus: z.enum(Object.values(ORDER_STATUS)) }) }),
  idParam: z.object({ params: z.object({ id: objectId }) }),
};
