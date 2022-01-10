import {stripe} from './';
import Stripe from 'stripe';

/**
 * Creates a Stripe Checkout session with line items
 */
export async function  createStripeChekoutSession(
    line_items: Stripe.Checkout.SessionCreateParams.LineItem[]
) {
   const url = process.env.WEBAPP_URL;
   
   const session = await stripe.checkout.sessions.create({
       payment_method: ['card'],
       line_items,
       success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `${url}/failed`,
   });

   return  session;
}