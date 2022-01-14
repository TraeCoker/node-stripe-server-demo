import { stripe } from "./";
import { db } from './firebase';
import Stripe from "stripe";
import { getOrCreateCustomer } from "./customers";
import { firestore } from "firebase-admin";