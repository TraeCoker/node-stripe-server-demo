"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeChekoutSession = void 0;
const _1 = require("./");
/**
 * Creates a Stripe Checkout session with line items
 */
async function createStripeChekoutSession(line_items) {
    const url = 'http://localhost:3001'; //process.env.WEBAPP_URL;
    const session = await _1.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url}/failed`,
    });
    return session;
}
exports.createStripeChekoutSession = createStripeChekoutSession;
//# sourceMappingURL=checkout.js.map