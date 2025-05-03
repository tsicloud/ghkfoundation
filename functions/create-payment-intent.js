import Stripe from 'stripe';
// Read secret key from environment
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

export async function onRequestPost(context) {
  try {
    const { amount, name, email, address } = await context.request.json();

    // (Optional) create a Customer for repeat donors
    const customer = await stripe.customers.create({ name, email, address });

    // Create the PaymentIntent
    const pi = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      receipt_email: email,
    });

    return new Response(JSON.stringify({ clientSecret: pi.client_secret }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}