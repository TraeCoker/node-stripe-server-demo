"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const _1 = require("./");
const firebase_1 = require("./firebase");
/**
 * Business logic for specific webhook event types
 */
const webHookHandlers = {
    'payment_intent.succeeded': async (data) => {
        //add business logic here
    },
    'payment_intent.payment_failed': async (data) => {
        //add business logic here
    },
    // Webhooks for subscriptions implemented via firebase extension. Code is kept for reference
    //
    // 'customer.subscription.created': async (data: Stripe.Subscription) => {
    //     const customer = await stripe.customers.retrieve( data.customer as string ) as Stripe.Customer;
    //     const userId = customer.metadata.firebaseUID;
    //     const userRef = db.collection('users').doc(userId);
    //     await userRef
    //         .update({
    //             activePlans: firestore.FieldValue.arrayUnion(data.plan.id)
    //         })
    // },
    // 'customer.subscription.deleted': async (data: Stripe.Subscription) => {
    //     const customer = await stripe.customers.retrieve( data.customer as string ) as Stripe.Customer;
    //     const userId = customer.metadata.firebaseUID;
    //     const userRef = db.collection('users').doc(userId);
    //     await userRef
    //         .update({
    //             activePlans: firestore.FieldValue.arrayRemove(data.plan.id)
    //         })
    // },
    'invoice.payment_succeeded': async (data) => {
        //add business logic here
    },
    'invoice.payment_failed': async (data) => {
        const customer = await _1.stripe.customers.retrieve(data.customer);
        const userSnapshot = await firebase_1.db.collection('users').doc(customer.metadata.firbaseUID).get();
        await userSnapshot.ref.update({ status: 'PAST_DUE' });
    }
};
/**
 * Validate the stripe webhook secret, then call the handler for the event type
 */
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const event = _1.stripe.webhooks.constructEvent(req['rawBody'], sig, process.env.STRIPE_WEBHOOK_SECRET);
    try {
        await webHookHandlers[event.type](event.data.object);
        res.send({ recieved: true });
    }
    catch (error) {
        res.status(400).send(`Webhook Error: ${error}`);
    }
};
//# sourceMappingURL=webhooks.js.map