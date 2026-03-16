import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe (Make sure STRIPE_SECRET_KEY is in your .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const imageFile = formData.get('image'); 
    const productCode = formData.get('productCode');
    const productPayloadStr = formData.get('productPayload'); 
    
    if (!productCode) {
      return NextResponse.json({ error: 'Missing productCode' }, { status: 400 });
    }

    // 1. Strict Backend File Type Validation
    if (imageFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(imageFile.type)) {
         return NextResponse.json(
           { error: 'Invalid file type. Only JPG, PNG, and GIF are allowed.' }, 
           { status: 400 }
         );
      }
    }

    const customObjectId = "69a6d83eb206eb7c36275bd5"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    let uploadedImageUrl = null;

    // 2. Upload Image to GHL Media Library
    if (imageFile) {
      const mediaFormData = new FormData();
      mediaFormData.append('file', imageFile);

      const mediaResponse = await fetch('https://services.leadconnectorhq.com/medias/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Version': '2021-07-28'
        },
        body: mediaFormData
      });

      if (!mediaResponse.ok) {
        const mediaError = await mediaResponse.json();
        return NextResponse.json(
          { error: 'Failed to upload image to CRM media library', details: mediaError }, 
          { status: mediaResponse.status }
        );
      }

      const mediaData = await mediaResponse.json();
      uploadedImageUrl = mediaData.url; 
    }

    // 3. NEW: Parse Payload & Create Stripe Entities
    let parsedData = {};
    try {
      parsedData = JSON.parse(productPayloadStr || "{}");
    } catch (e) {
      console.error("Failed to parse product payload", e);
    }

    // Create the Stripe Product
    const stripeProduct = await stripe.products.create({
      name: parsedData.productName || productCode,
      description: parsedData.description?.replace(/<[^>]*>?/gm, '') || undefined, // strip HTML tags if any
      images: uploadedImageUrl ? [uploadedImageUrl] : [],
    });

    const pricing = parsedData.pricing || {};
    const stripeLinks = {};

    // Helper to create Stripe Price and Payment Link
    const createStripePriceAndLink = async (amountStr, interval) => {
      if (!amountStr || isNaN(parseFloat(amountStr))) return null;
      
      const amountCents = Math.round(parseFloat(amountStr) * 100); // Stripe needs cents
      if (amountCents <= 0) return null;

      const priceConfig = {
        product: stripeProduct.id,
        unit_amount: amountCents,
        currency: 'usd', 
      };

      if (interval) {
        priceConfig.recurring = { interval: interval }; // 'month' or 'year'
      }

      const price = await stripe.prices.create(priceConfig);
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
      });

      return paymentLink.url;
    };

    // Generate links for whichever prices were provided
    if (pricing.oneTimePrice) {
      stripeLinks.oneTimeUrl = await createStripePriceAndLink(pricing.oneTimePrice, null);
    }
    if (pricing.monthlyPrice) {
      stripeLinks.monthlyUrl = await createStripePriceAndLink(pricing.monthlyPrice, 'month');
    }
    if (pricing.annualPrice) {
      stripeLinks.annualUrl = await createStripePriceAndLink(pricing.annualPrice, 'year');
    }

    // Inject Stripe data back into the parsed data payload
    parsedData.stripeProductId = stripeProduct.id;
    parsedData.stripePaymentLinks = stripeLinks;

    // Stringify the updated payload for GHL
    const finalPayloadStr = JSON.stringify(parsedData);

    // 4. Create Record in GHL Custom Object
    const endpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Location-Id': locationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: locationId, 
        properties: {
          "tool_code": productCode,
          "data": finalPayloadStr, // Using the new payload with Stripe info injected
          ...(uploadedImageUrl && { 
            "image": [
              { "url": uploadedImageUrl } 
            ] 
          }) 
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to create product in CRM', details: errorData }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Integration Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const customObjectId = "69a6d83eb206eb7c36275bd5"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    const endpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/search`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: locationId,
        page: 1,           
        pageLimit: 100     
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch products from CRM', details: errorData }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, records: data.records || [] });

  } catch (error) {
    console.error("CRM Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}