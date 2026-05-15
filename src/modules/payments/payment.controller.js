const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Payment = require("./payment.model");
const service = require("./payment.service");
const ApiError = require("../../utils/ApiError");
const { uploadBufferToCloudinary } = require("../../config/cloudinary");
const { paginate } = require("../../utils/pagination");

exports.instructions = asyncHandler(async (req, res) => res.json(new ApiResponse("Payment instructions", { instructions: await service.instructions(req.customer._id, req.params.orderId) })));
exports.submitProof = asyncHandler(async (req, res) => {
  let proofImage = req.body.proofImage;
  if (req.file) proofImage = (await uploadBufferToCloudinary(req.file.buffer, "supplements/payment-proofs"))?.secure_url || proofImage;
  if (!proofImage) throw new ApiError(400, "Payment proof image is required");
  const payment = await service.submitProof(req.customer._id, req.params.orderId, { ...req.body, proofImage });
  res.json(new ApiResponse("Payment proof submitted", { payment }));
});
exports.list = asyncHandler(async (req, res) => {
  const { documents: payments, pagination } = await paginate(Payment.find().populate("order customer reviewedBy").sort("-createdAt"), Payment.countDocuments(), req.query);
  res.json(new ApiResponse("Payments fetched", { payments, pagination }));
});
exports.get = asyncHandler(async (req, res) => res.json(new ApiResponse("Payment fetched", { payment: await Payment.findById(req.params.id).populate("order customer reviewedBy") })));
exports.approve = asyncHandler(async (req, res) => res.json(new ApiResponse("Payment approved", { payment: await service.approve(req.params.id, req.user._id, req.body) })));
exports.reject = asyncHandler(async (req, res) => res.json(new ApiResponse("Payment rejected", { payment: await service.reject(req.params.id, req.user._id, req.body.rejectionReason) })));
