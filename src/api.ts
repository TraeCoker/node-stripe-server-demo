import express, {Request, Response, NextFunction} from 'express';
export const app = express();

app.use( express.json() )

import cors from 'cors';
app.use(cors({origin: true}))

app.post('/test', (req: Request, resp: Response) =>{
        const amount = req.body.amount;

        resp.status(200).send({with_tax: amount * 7})
})