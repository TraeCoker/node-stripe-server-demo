import express, {Request, Response, NextFunction, request} from 'express';
export const app = express();

app.use( express.json() )

import cors from 'cors';
import { createStripeChekoutSession } from './checkout';


app.use(cors({origin: true}))

app.post('/test', (req: Request, resp: Response) =>{
        const amount = req.body.amount;

        resp.status(200).send({with_tax: amount * 7})
})

/**
 * Checkouts
 */
app.post(
    '/checkouts/', async ({ body }: Request, res: Response) => {
        res.send(

            await createStripeChekoutSession(body.line_items)
        );
    }
);