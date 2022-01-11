"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = void 0;
const _1 = require("./");
/**
 * Create a Payment Intent with a specific amount
 */
async function createPaymentIntent(amount) {
    const paymentIntent = await _1.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
    });
    paymentIntent.status;
    return paymentIntent;
}
exports.createPaymentIntent = createPaymentIntent;
//# sourceMappingURL=payments.js.map