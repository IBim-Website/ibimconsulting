import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { cart } = await request.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const lineItems = await Promise.all(cart.map(async (item) => {
      
      const uniqueId = item.id || item.slug; 

      if (!uniqueId) {
        throw new Error(`Missing unique ID for item: ${item.name}`);
      }

      // 1. SEARCH OR CREATE PRODUCT
      const productSearch = await stripe.products.search({
        query: `metadata['crm_id']:'${uniqueId}'`,
        limit: 1,
      });

      let stripeProductId;
      if (productSearch.data.length > 0) {
        stripeProductId = productSearch.data[0].id;
      } else {
        const newProduct = await stripe.products.create({
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: { crm_id: uniqueId },
        });
        stripeProductId = newProduct.id;
      }

      // 2. SEARCH OR CREATE ONE-TIME PRICE
      const unitAmount = Math.round(item.price * 100);
      
      const prices = await stripe.prices.list({
        product: stripeProductId,
        active: true,
      });

      // We look for a price that is NOT recurring and matches the amount
      const existingPrice = prices.data.find(p => 
        p.unit_amount === unitAmount && 
        p.currency === 'usd' && 
        !p.recurring // Ensure we only pick one-time prices
      );

      let stripePriceId;

      if (existingPrice) {
        stripePriceId = existingPrice.id;
      } else {
        const newPrice = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: unitAmount,
          currency: 'usd',
          metadata: {
            // We keep the package name in metadata for your records, 
            // even though it won't trigger a subscription.
            package_type: item.package || 'One-Time' 
          }
        });
        stripePriceId = newPrice.id;
      }

      return {
        price: stripePriceId,
        quantity: item.quantity || 1,
      };
    }));

    // 3. CREATE CHECKOUT SESSION
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment', // Changed from dynamic to strictly 'payment'
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`, 
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}