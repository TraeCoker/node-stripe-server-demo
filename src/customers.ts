import { stripe } from "./";
import { db } from "./firebase";
import Stripe from "stripe";

/**
 * Gets the existing Stripe customer or creates a new record
 */
export async function getOrCreateCustomer() {
    const userSnapshot = await db.collection('users').doc(userId).get();

    const { stripeCustomerId, email } = userSnapshot.data();

    //if missing CustomerID, create it
    if (!stripeCustomerId) {
        //CREATE a new customer
        const customer = await stripe.customers.create({
            email,
            metadata: {
                firebaseUID: userId
            },
            ...params
        });
        await userSnapshot.ref.update({ stripeCustomerId: customer.id });
        return customer;
    } else {
        return await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
    }

}

/**
 * Creates a setupIntent used to save a card for future use
 */

export async function createSetupIntent(userId: string) {

    const customer = await getOrCreateCustomer(userId);
    
    return stripe.setupIntents.create({
        customer: customer.id,
    })
}