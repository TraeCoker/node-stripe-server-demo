import express, {Request, Response, NextFunction, request} from 'express';
export const app = express();

app.use( express.json() )

import cors from 'cors';
import { createStripeChekoutSession } from './checkout';
import { createPaymentIntent } from './payments';


app.use(cors({origin: true}))

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