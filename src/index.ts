//Environment Variables (Strip API Key)
import { config } from 'dotenv'
if (process.env.NODE_ENV !== 'production'){
    config();
}

//Initialize Strip
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET, {
    apiVersion: '2020-03-02',
});