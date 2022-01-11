import { stripe } from "./";
import Stripe from "stripe";

/**
 * Business logic for specific webhook event types
 */
const webHookHandlers = {

    'payment_intent.succeeded': async(data: Stripe.PaymentIntent) => {
        //add business logic here
    },
    'payment_intent.payment_failed': async(data: Stripe.PaymentIntent)=> {
        //add business logic here
    },
}

/**
 * Validate the stripe webhook secret, then call the handler for the event type
 */
export const handleStripeWebhook = async(req, res) => {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req['rawBody'], sig, process.env.STRIPE_WEBHOOK_SECRET);

    try {
        await webHookHandlers[event.type](event.data.object);
        res.send({recieved: true})
    } catch (error) {
        console.log(error)
        res.status(400).send(`Webhook Error: ${error.message}`)
    }
}
