import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const customObjectId = "69a6d83eb206eb7c36275bd5"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    // 1. Fetch a batch of products from GHL
    const searchEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/search`;
    const searchRes = await fetch(searchEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: locationId,
        page: 1,           
        pageLimit: 100 // Fetch up to 100 to search through
      })
    });

    if (!searchRes.ok) throw new Error('Failed to fetch from CRM');
    const { records } = await searchRes.json();

    // 2. Filter for products that DO NOT have a Stripe Product ID yet
    const productsNeedingStripe = records.filter(record => {
      const payload = JSON.parse(record.properties?.data || "{}");
      return !payload.stripeProductId; // Only keep ones missing Stripe data
    });

    if (productsNeedingStripe.length === 0) {
      return NextResponse.json({ success: true, message: "All caught up! No products need Stripe migration." });
    }

    // 3. Take only the first 10 to prevent serverless timeout
    const batch = productsNeedingStripe.slice(0, 10);
    const updatedProducts = [];

    // 4. Process the batch
    for (const record of batch) {
      const existingProperties = record.properties || {};
      const payload = JSON.parse(existingProperties.data || "{}");
      const pricing = payload.pricing || {};

      console.log(`Migrating: ${payload.productName || existingProperties.tool_code}`);

      // A. Create Stripe Product
      const stripeProduct = await stripe.products.create({
        name: payload.productName || existingProperties.tool_code,
        description: payload.description?.replace(/<[^>]*>?/gm, '') || undefined,
        images: existingProperties.image ? [existingProperties.image[0].url] : [],
      });

      // B. Helper to create Prices and Links
      const createStripePriceAndLink = async (amountStr, interval) => {
        if (!amountStr || isNaN(parseFloat(amountStr))) return null;
        const amountCents = Math.round(parseFloat(amountStr) * 100); 
        if (amountCents <= 0) return null;

        const priceConfig = {
          product: stripeProduct.id,
          unit_amount: amountCents,
          currency: 'usd', 
        };
        if (interval) priceConfig.recurring = { interval: interval }; 

        const price = await stripe.prices.create(priceConfig);
        const paymentLink = await stripe.paymentLinks.create({
          line_items: [{ price: price.id, quantity: 1 }],
          allow_promotion_codes: true,
        });

        return paymentLink.url;
      };

      // C. Generate Links based on existing pricing
      const stripeLinks = {};
      if (pricing.oneTimePrice) stripeLinks.oneTimeUrl = await createStripePriceAndLink(pricing.oneTimePrice, null);
      if (pricing.monthlyPrice) stripeLinks.monthlyUrl = await createStripePriceAndLink(pricing.monthlyPrice, 'month');
      if (pricing.annualPrice) stripeLinks.annualUrl = await createStripePriceAndLink(pricing.annualPrice, 'year');

      // D. Update the payload
      payload.stripeProductId = stripeProduct.id;
      payload.stripePaymentLinks = stripeLinks;

      // E. Save back to GHL via PUT
      const updateEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/${record.id}`;
      await fetch(updateEndpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Version': '2021-07-28',
          'Location-Id': locationId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: locationId, 
          properties: {
            "tool_code": existingProperties.tool_code, 
            "data": JSON.stringify(payload), 
            ...(existingProperties.image && { "image": existingProperties.image }) 
          }
        })
      });

      updatedProducts.push(payload.productName || existingProperties.tool_code);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully migrated ${batch.length} products.`,
      migratedThisBatch: updatedProducts,
      remainingInDatabase: productsNeedingStripe.length - batch.length 
    });

  } catch (error) {
    console.error("Migration Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}