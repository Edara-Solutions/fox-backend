const Brand = require("./brand.model");
const slugifyText = require("../../utils/slugifyText");

exports.create = (payload) => Brand.create({ ...payload, slug: slugifyText(payload.name) });
exports.update = (id, payload) => {
  if (payload.name) payload.slug = slugifyText(payload.name);
  return Brand.findByIdAndUpdate(id, payload, { new: true });
};
