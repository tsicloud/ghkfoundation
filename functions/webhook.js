import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

export async function onRequestPost({ request, env }) {
  const sig = request.headers.get('stripe-signature');
  let event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    // Read metadata
    const { name, email, address, phone, method } = pi.metadata || {};
    const amount = (pi.amount_received / 100).toFixed(2);
    const methodText = method === 'ach_credit_transfer'
      ? 'ACH Credit Transfer'
      : 'Credit Card';

    // Build email payload
    const msg = {
      personalizations: [{
        to: [{ email: env.BOARD_EMAIL }],
        subject: `New Donation (${methodText}) from ${name}`
      }],
      from: { email: 'no-reply@ghkmusicfoundation.org', name: 'GHK Music Foundation' },
      content: [{
        type: 'text/plain',
        value: `
A new donation has been received:
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Address: ${address}
Method: ${methodText}
Amount: $${amount}
Date: ${new Date(pi.created * 1000).toLocaleString()}
        `
      }]
    };

    // Send email via SendGrid HTTP API
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`
      },
      body: JSON.stringify(msg)
    });
  }

  // Respond to Stripe
  return new Response('Received', { status: 200 });
}