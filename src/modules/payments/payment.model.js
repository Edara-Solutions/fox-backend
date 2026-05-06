const mongoose = require("mongoose");
const PAYMENT_STATUS = require("../../constants/paymentStatus");
const PAYMENT_METHODS = require("../../constants/paymentMethods");

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    method: { type: String, enum: Object.values(PAYMENT_METHODS), required: true },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    amount: { type: Number, required: true },
    transactionReference: String,
    senderPhone: String,
    senderName: String,
    proofImage: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
