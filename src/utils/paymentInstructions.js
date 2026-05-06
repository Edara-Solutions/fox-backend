const env = require("../config/env");
const PAYMENT_METHODS = require("../constants/paymentMethods");

const getPaymentInstructions = (method, amount) => {
  if (method === PAYMENT_METHODS.VODAFONE_CASH) {
    return {
      method,
      walletNumber: env.vodafoneCashNumber,
      exactAmount: amount,
      message: `Send exactly ${amount} EGP to Vodafone Cash wallet ${env.vodafoneCashNumber}, then upload the screenshot and transaction reference.`,
    };
  }

  if (method === PAYMENT_METHODS.INSTAPAY) {
    return {
      method,
      instapayAddress: env.instapayAddress,
      exactAmount: amount,
      message: `Send exactly ${amount} EGP to InstaPay address ${env.instapayAddress}, then upload the screenshot and transaction reference.`,
    };
  }

  return null;
};

module.exports = getPaymentInstructions;
