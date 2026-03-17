import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { cart } = await request.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Check if the cart contains any subscriptions. 
    // Stripe requires the mode to be 'subscription' if even one recurring item is present.
    const hasSubscription = cart.some(item => item.package === 'Monthly' || item.package === 'Annual');

    // 2. Map your cart items to Stripe's line_items format
    const lineItems = cart.map(item => {
      // Build the price data dynamically
      const priceData = {
        currency: 'usd',
        product_data: {
          name: `${item.name} (${item.package})`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      };

      // If it's a subscription package, tell Stripe how often to charge
      if (item.package === 'Monthly') {
        priceData.recurring = { interval: 'month' };
      } else if (item.package === 'Annual') {
        priceData.recurring = { interval: 'year' };
      }

      return {
        price_data: priceData,
        quantity: 1,
      };
    });

    // 3. Get the base URL so Stripe knows where to send them back
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // 4. Generate the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: hasSubscription ? 'subscription' : 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`, // We can build this page later!
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}