import { stripe } from "./";
import { db } from './firebase';
import Stripe from "stripe";
import { getOrCreateCustomer } from "./customers";
import { firestore } from "firebase-admin";

/**
 * Attaches a payment method to the Stripe customer,
 * subscribes to a Stripe plan, and saves the plan to Firestore
 */
export async function createSubscription(
    userId: string,
    plan: string,
    payment_method: string,
) {
    const customer = await getOrCreateCustomer(userId);
    console.log(userId)
    console.log(plan)
    console.log(payment_method)

    //Attach the payment method to the customer
    await stripe.paymentMethods.attach(payment_method, { customer: customer.id });

    //Set it as the default payment method
    await stripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: payment_method },
    });

    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ plan }],
        expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const payment_intent = invoice.payment_intent as Stripe.PaymentIntent;

    //Update the user's status in db
    if (payment_intent.status === 'succeeded') {
        await db
            .collection('users')
            .doc(userId)
            .set(
                {
                    stripeCustomerId: customer.id,
                    activePlans: firestore.FieldValue.arrayUnion(plan),
                },
                { merge: true }
            );
    }

    return subscription; 
}

/**
 * Cancels an active subscription, syncs the data in Firestore
 */

export async function cancelSubscription(
    userId: string,
    subscriptionId: string
) {
    const customer = await getOrCreateCustomer(userId);
    if(customer.metadata.firebaseUID !== userId) {
        throw Error('Firebase UId does not match Stripe Customer');
    }
    
    //Cancel subscription immediately 
    const subscription = await stripe.subscriptions.del(subscriptionId);

    //Cancel at end of period
    //use webhook to listen for cancellation and update db at that time
    //const subscription = stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

    if (subscription.status === 'canceled') {
        await db
            .collection('users')
            .doc(userId)
            .update({
                activePlans: firestore.FieldValue.arrayRemove(subscription.id),
            });
    }

    return subscription;
}

/**
 * Returns all the subscriptions linked to a Firebase userID in Stripe
 */
export async function listSubscriptions(userId: string) {
    const customer = await getOrCreateCustomer(userId);
    
    const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
    });

    return subscriptions;
}