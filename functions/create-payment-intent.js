import Stripe from 'stripe';
import sendgrid from '@sendgrid/mail';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
sendgrid.setApiKey(env.SENDGRID_API_KEY);

export async function onRequestPost({ request, env }) {
  const sig = request.headers.get('stripe-signature');
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const { name, email, address, phone, method } = pi.metadata;
    const amount = (pi.amount_received / 100).toFixed(2);
    const methodText = method === 'ach_credit_transfer'
      ? 'ACH Credit Transfer'
      : 'Credit Card';

    const msg = {
      to: env.BOARD_EMAIL,
      from: 'no-reply@ghkmusicfoundation.org',
      subject: `New Donation (${methodText}) from ${name}`,
      text: `
A new donation has been received:
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Address: ${address}
Method: ${methodText}
Amount: $${amount}
Date: ${new Date(pi.created * 1000).toLocaleString()}
      `
    };
    await sendgrid.send(msg);
  }

  return new Response('Received', { status: 200 });
}