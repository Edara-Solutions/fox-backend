const Category = require("./category.model");
const slugifyText = require("../../utils/slugifyText");

exports.create = (payload) => Category.create({ ...payload, slug: slugifyText(payload.name) });
exports.update = (id, payload) => {
  if (payload.name) payload.slug = slugifyText(payload.name);
  return Category.findByIdAndUpdate(id, payload, { new: true });
};
