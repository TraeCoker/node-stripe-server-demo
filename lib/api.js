"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
exports.app = express_1.default();
exports.app.use(express_1.default.json());
const cors_1 = __importDefault(require("cors"));
const checkout_1 = require("./checkout");
exports.app.use(cors_1.default({ origin: true }));
exports.app.post('/test', (req, resp) => {
    const amount = req.body.amount;
    resp.status(200).send({ with_tax: amount * 7 });
});
/**
 * Catch async errors when awaiting promises
 */
function runAsync(callback) {
    return (req, res, next) => {
        callback(req, res, next).catch(next);
    };
}
;
/**
 * Checkouts
 */
exports.app.post('/checkouts/', runAsync(async ({ body }, res) => {
    res.send(await checkout_1.createStripeChekoutSession(body.line_items));
}));
//# sourceMappingURL=api.js.map