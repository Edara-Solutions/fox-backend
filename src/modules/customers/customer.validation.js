const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);
const address = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  city: z.string().min(2),
  area: z.string().min(2),
  street: z.string().min(2),
  buildingNumber: z.string().optional(),
  apartmentNumber: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

module.exports = {
  register: z.object({ body: z.object({ fullName: z.string().min(2), email: z.string().email(), phone: z.string().min(7), password: z.string().min(8) }) }),
  login: z.object({ body: z.object({ email: z.string().email(), password: z.string().min(1) }) }),
  updateMe: z.object({ body: z.object({ fullName: z.string().min(2).optional(), phone: z.string().min(7).optional() }) }),
  changePassword: z.object({ body: z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) }) }),
  addAddress: z.object({ body: address }),
  updateAddress: z.object({ params: z.object({ addressId: objectId }), body: address.partial() }),
  addressId: z.object({ params: z.object({ addressId: objectId }) }),
  idParam: z.object({ params: z.object({ id: objectId }) }),
};
