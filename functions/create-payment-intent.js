import Stripe from 'stripe';

export async function onRequestPost({ request, env }) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
  try {
    const { amount, name, email, address } = await request.json();

    // (Optional) create a Customer for repeat donors
    const customer = await stripe.customers.create({ name, email, address });

    // Create the PaymentIntent
    const pi = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card', 'us_bank_account'],
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