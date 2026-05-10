const ShippingCity = require("./shippingCity.model");
const ApiError = require("../../utils/ApiError");

const normalizeCityName = (name) => String(name || "").trim().toLowerCase();

const create = (payload) =>
  ShippingCity.create({
    ...payload,
    normalizedName: normalizeCityName(payload.name),
  });

const update = (id, payload) => {
  if (payload.name) payload.normalizedName = normalizeCityName(payload.name);
  return ShippingCity.findByIdAndUpdate(id, payload, { new: true });
};

const getActiveCityByName = async (name) => {
  const city = await ShippingCity.findOne({ normalizedName: normalizeCityName(name), isActive: true });
  if (!city) throw new ApiError(400, "Selected city is not available for shipping");
  return city;
};

module.exports = { create, update, getActiveCityByName };
