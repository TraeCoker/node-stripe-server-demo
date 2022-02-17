import express, {Request, Response, NextFunction} from 'express';
export const app = express();

app.use( express.json() )

import cors from 'cors';
import { auth } from './firebase';
import { createStripeChekoutSession } from './checkout';
import { createPaymentIntent } from './payments';
import { cancelSubscription, createSubscription, listSubscriptions } from './billing';
import { handleStripeWebhook } from './webhooks';
import { createSetupIntent, listPaymentMethods } from './customers';

///Middleware///

//Allows cross origin requests
app.use(cors({origin: true}))

//Sets rawBody property for webhook handling
app.use(
    express.json({
        verify: (req, res, buffer) => (req['rawBody'] = buffer),
    })
);

//Decodes the Firebase JSON WEB TOKEN
app.use(decodeJWT);

app.post('/test', (req: Request, resp: Response) =>{
        const amount = req.body.amount;

        resp.status(200).send({with_tax: amount * 7})
})

/**
 * Catch async errors when awaiting promises 
 */

function runAsync(callback: Function){
    return (req: Request, res: Response, next: NextFunction) => {
        callback(req, res, next).catch(next);
    };
};

/**
 * Throws and error if the currentUser does not exist on the request
 */
function validateUser(req: Request) {
    const user = req['currentUser'];
    if (!user) {
        throw new Error(
            'You must be logged in to make this request. i.e Authorization: Bearer <token>'
        );
    }

    return user; 
}

/**
 * Checkouts
 */
app.post(
    '/checkouts/',
    runAsync( async ({ body }: Request, res: Response) => {
        res.send(

            await createStripeChekoutSession(body.line_items)
        );
    })
);

/**
 * Payment Intents
 */
app.post(
    '/payments',
    runAsync (async ( { body }: Request, res: Response) => {
       res.send(
            await createPaymentIntent(body.amount)
       );
    })
);

/**
 * Customers and Setup Intents
 */

//save a card on the customer record with setup intent
app.post(
    '/wallet',
    runAsync(async (req: Request, res: Response) => {
        const user = validateUser(req);
        const setupIntent = await createSetupIntent(user.uid);
        res.send(setupIntent);
    })
);

//Retrieve all cards attached to a customer
app.get(
    '/wallet',
    runAsync(async (req: Request, res: Response) => {
        const user = validateUser(req);

        const wallet = await listPaymentMethods(user.uid);
        res.send(wallet.data);
    })
);

/**
 * Billing and Recurring Subscriptions
 */

//Create and charge a new Subscription
app.post(
    '/subscriptions/',
    runAsync(async (req: Request, res: Response) => {
        const user = validateUser(req);
        const { plan, payment_method } = req.body;
        const subscription = await createSubscription(user.id, plan, payment_method);
        res.send(subscription);
    })
);

//Get all subscriptions for a customer
app.get(
    '/subscriptions/', 
    runAsync(async (req: Request, res: Response) => {
        const user = validateUser(req);
        
        const subscriptions = await listSubscriptions(user.uid);
        res.send(subscriptions.data)
    })
);

//Unsubscribe or cancel a subscription
app.patch(
    '/subscriptions/:id',
    runAsync(async (req: Request, res: Response) => {
        const user = validateUser(req);
        res.send(await cancelSubscription(user.uid, req.params.id))
    })
);

/**
 * Web Hooks
 */
app.post('/hooks', runAsync(handleStripeWebhook));

/**
 * Decodes the JSON Web Token sent via the frontend app
 * Makes the currentUser (firebase) data available on the body.
 */

async function decodeJWT(req: Request, res: Response, next: NextFunction) {
    console.log(req)
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split("Bearer ")[1];
       
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            req['currentUser'] = decodedToken;
        } catch(err) {
            console.log(err)
        }
    }   

    next();
}

