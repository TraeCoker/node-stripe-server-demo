import express, {Request, Response, NextFunction} from 'express';
export const app = express();

app.use( express.json() )

import cors from 'cors';
import { auth } from './firebase';
import { createStripeChekoutSession } from './checkout';
import { createPaymentIntent } from './payments';
import { handleStripeWebhook } from './webhooks';

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
 * Web Hooks
 */
app.post('/hooks', runAsync(handleStripeWebhook));

/**
 * Decodes the JSON Web Token sent via the frontend app
 * Makes the currentUser (firebase) data available on the body.
 */

async function decodeJWT(req: Request, res: Response, next: NextFunction) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req['currentUser'] = decodedToken;
    } catch(err) {
        console.log(err)
    }
}