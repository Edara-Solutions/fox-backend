const slugify = require("slugify");

const slugifyText = (text) =>
  slugify(text || "", {
    lower: true,
    strict: true,
    trim: true,
  });

module.exports = slugifyText;
