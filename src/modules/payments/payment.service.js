const Payment = require("./payment.model");
const Order = require("../orders/order.model");
const { deductOrderStock } = require("../orders/order.service");
const ApiError = require("../../utils/ApiError");
const getPaymentInstructions = require("../../utils/paymentInstructions");
const PAYMENT_STATUS = require("../../constants/paymentStatus");
const ORDER_STATUS = require("../../constants/orderStatus");

exports.instructions = async (customerId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) throw new ApiError(404, "Order not found");
  return getPaymentInstructions(order.paymentMethod, order.total);
};

exports.submitProof = async (customerId, orderId, payload) => {
  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) throw new ApiError(404, "Order not found");
  if (![PAYMENT_STATUS.PENDING, PAYMENT_STATUS.REJECTED].includes(order.paymentStatus)) throw new ApiError(400, "Payment proof cannot be submitted now");
  const payment = await Payment.findOneAndUpdate(
    { order: orderId, customer: customerId },
    { transactionReference: payload.transactionReference, senderPhone: payload.senderPhone, senderName: payload.senderName, amount: payload.paidAmount, proofImage: payload.proofImage, status: PAYMENT_STATUS.AWAITING_REVIEW },
    { new: true }
  );
  order.paymentStatus = PAYMENT_STATUS.AWAITING_REVIEW;
  order.orderStatus = ORDER_STATUS.PAYMENT_SUBMITTED;
  await order.save();
  return payment;
};

exports.approve = async (paymentId, reviewerId, payload) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new ApiError(404, "Payment not found");
  if ([PAYMENT_STATUS.PAID, PAYMENT_STATUS.PARTIALLY_PAID].includes(payment.status)) throw new ApiError(400, "Payment already approved");
  if (payment.status !== PAYMENT_STATUS.AWAITING_REVIEW) throw new ApiError(400, "Payment is not awaiting review");

  const order = await Order.findById(payment.order);
  if (!order) throw new ApiError(404, "Order not found");

  const nextPaymentStatus = payload.paymentStatus;
  const isPartialPayment = nextPaymentStatus === PAYMENT_STATUS.PARTIALLY_PAID;
  if (![PAYMENT_STATUS.PAID, PAYMENT_STATUS.PARTIALLY_PAID].includes(nextPaymentStatus)) throw new ApiError(400, "Payment status must be paid or partially_paid");
  if (isPartialPayment && payload.paidAmount === undefined) throw new ApiError(400, "Paid amount is required for partial payment approval");

  const paidAmount = isPartialPayment ? Number(payload.paidAmount) : order.total;
  if (isPartialPayment && paidAmount >= order.total) throw new ApiError(400, "Partial paid amount must be less than order total");

  await deductOrderStock(order);

  payment.status = nextPaymentStatus;
  payment.amount = paidAmount;
  payment.reviewedBy = reviewerId;
  payment.reviewedAt = new Date();
  order.paymentStatus = nextPaymentStatus;
  order.orderStatus = ORDER_STATUS.CONFIRMED;
  order.paid = paidAmount;
  order.reminder = order.total - paidAmount;
  order.confirmedAt = order.confirmedAt || new Date();
  if (!isPartialPayment) order.paidAt = order.paidAt || new Date();
  await payment.save();
  await order.save();
  return payment;
};

exports.reject = async (paymentId, reviewerId, rejectionReason) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new ApiError(404, "Payment not found");
  if ([PAYMENT_STATUS.PAID, PAYMENT_STATUS.PARTIALLY_PAID].includes(payment.status)) throw new ApiError(400, "Approved payment cannot be rejected");
  payment.status = PAYMENT_STATUS.REJECTED;
  payment.reviewedBy = reviewerId;
  payment.reviewedAt = new Date();
  payment.rejectionReason = rejectionReason;
  await payment.save();
  const order = await Order.findById(payment.order);
  if (order) {
    order.paymentStatus = PAYMENT_STATUS.REJECTED;
    order.orderStatus = ORDER_STATUS.PAYMENT_REJECTED;
    order.paid = 0;
    order.reminder = order.total;
    await order.save();
  }
  return payment;
};
