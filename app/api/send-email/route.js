import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import Stripe from 'stripe';

// --- Initialize Stripe ---
const stripe = new Stripe("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");
const webhookSecret = "whsec_SsiYddzBjXdtjvqC0nimmPu3gnYLpiBK";

// --- Initialize Resend ---
const resend = new Resend("re_byoxH49C_LYxFqguCaWjjNaYTjtEEo5Uw");

export async function POST(request) {
  // 2. Get the raw body text and Stripe signature
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event;

  // 3. Verify the webhook signature
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 4. Handle the "checkout.session.completed" event
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Extract relevant data
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || 'A Customer';
      const amountTotal = (session.amount_total / 100).toFixed(2);
      const currency = session.currency.toUpperCase();
            
      // --- Extract Shipping Details ---
      const shippingDetails = session.collected_information?.shipping_details;
      const shippingAddress = shippingDetails?.address;

      // --- Format Shipping Address HTML ---
      let shippingInfoHtml = '';
      if (shippingAddress) {
        const addressLines = [
            shippingDetails.name,
            shippingAddress.line1,
            shippingAddress.line2,
            `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}`,
            shippingAddress.country
        ].filter(Boolean);

        shippingInfoHtml = `
          <hr style="border: 0; border-top: 1px solid #eee;">
          <h3 style="color: #555;">Shipping Address</h3>
          <div style="padding-left: 15px; border-left: 3px solid #eee;">
            ${addressLines.join('<br>')}
          </div>
        `;
      }

      console.log(`Successful payment received from ${customerEmail}`);

      // --- 1. SEND EMAIL TO ADMINS ---
      await resend.emails.send({
        from: 'Stripe Notification <notifications@digitaldaze.com.au>',
        to: ["webmaster@martialpeter.com", "pa@martialpeter.com"],
        subject: `New Successful Transaction! ($${amountTotal} ${currency})`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">🎉 New Sale Notification</h2>
            <p>A new payment has been successfully processed on your website.</p>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <h3 style="color: #555;">Customer Details</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
            <p><strong>Amount:</strong> <strong>${amountTotal} ${currency}</strong></p>
            <p><strong>Payment Status:</strong> ${session.payment_status}</p>

                  ${shippingInfoHtml}

            <hr style="border: 0; border-top: 1px solid #eee;">
            <p style="font-size: 0.9em; color: #777;">
              Stripe Session ID: ${session.id}
            </p>
          </div>
        `,
      });
      console.log('Admin notification emails sent successfully.');

      // --- 2. SEND EMAIL TO CUSTOMER ---
      if (customerEmail) {
        await resend.emails.send({
          from: 'Digital Daze <notifications@digitaldaze.com.au>', 
          to: [customerEmail],
          subject: `Thank you for your purchase!`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #333;">Thank you, ${customerName}!</h2>
              <p>We have successfully received your payment of <strong>$${amountTotal} ${currency}</strong>.</p>
              <p>We are currently processing your order and will keep you updated.</p>
              
              ${shippingInfoHtml}
              
              <hr style="border: 0; border-top: 1px solid #eee;">
              <p style="font-size: 0.9em; color: #777;">
                If you have any questions, please reply to this email.
              </p>
            </div>
          `,
        });
        console.log(`Customer email sent successfully to ${customerEmail}.`);
      }

    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing webhook event:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing webhook.' },
      { status: 500 }
    );
  }
}