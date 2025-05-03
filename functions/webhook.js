import Stripe from 'stripe';
import fetch from 'node-fetch';
import { env } from '../env.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function webhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);