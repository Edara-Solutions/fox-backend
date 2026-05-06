const { z } = require("zod");
const USER_ROLES = require("../../constants/roles");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

module.exports = {
  login: z.object({ body: z.object({ email: z.string().email(), password: z.string().min(1) }) }),
  create: z.object({ body: z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), role: z.enum(Object.values(USER_ROLES)) }) }),
  update: z.object({ params: z.object({ id: objectId }), body: z.object({ name: z.string().min(2).optional(), email: z.string().email().optional(), role: z.enum(Object.values(USER_ROLES)).optional(), password: z.string().min(8).optional() }) }),
  changePassword: z.object({ body: z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) }) }),
  idParam: z.object({ params: z.object({ id: objectId }) }),
};
