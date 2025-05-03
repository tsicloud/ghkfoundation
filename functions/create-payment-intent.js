import Stripe from 'stripe';

export async function onRequestPost({ request, env }) {
  // Parse donation request
  const { amount, name, email, address, phone, method } = await request.json();

  // Initialize Stripe
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

  // Create PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method_types: ['card', 'us_bank_account'],
    receipt_email: email,
    metadata: {
      name,
      email,
      phone,
      method,
      address: `${address.line1}, ${address.city}, ${address.state} ${address.postal_code}`
    }
  });

  // Send notification email via SendGrid HTTP API
  const msg = {
    personalizations: [{
      to: [{ email: env.BOARD_EMAIL }],
      subject: `New Donation (${method === 'ach_credit_transfer' ? 'ACH' : 'Card'}) from ${name}`
    }],
    from: { email: 'no-reply@ghkmusicfoundation.org', name: 'GHK Music Foundation' },
    content: [{
      type: 'text/plain',
      value: `
A new donation has been initiated:
Name: ${name}
Email: ${email}
Phone: ${phone}
Address: ${address.line1}, ${address.city}, ${address.state} ${address.postal_code}
Method: ${method === 'ach_credit_transfer' ? 'ACH Credit Transfer' : 'Credit Card'}
Amount: $${(amount / 100).toFixed(2)}
Date: ${new Date().toLocaleString()}
      `
    }]
  };

  try {
    const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`
      },
      body: JSON.stringify(msg)
    });
    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error('SendGrid error:', emailRes.status, errBody);
    }
  } catch (err) {
    console.error('Network error sending email:', err);
  }

  // Return the client secret for front-end to confirm payment
  return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
    headers: { 'Content-Type': 'application/json' }
  });
}