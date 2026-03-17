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
    // 1. Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const productCode = searchParams.get('productCode'); 
    const page = parseInt(searchParams.get('page')) || 1;    // Default to page 1
    const limit = parseInt(searchParams.get('limit')) || 10; // Default to 10 items

    const customObjectId = "69a6d83eb206eb7c36275bd5"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    const endpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/search`;

    // 2. Build the dynamic search payload with backend pagination
    const searchBody = {
      locationId: locationId,
      page: page,           
      pageLimit: productCode ? 1 : limit // If searching by code, limit to 1. Otherwise, use our limit.
    };

    if (productCode) {
      searchBody.query = [
        {
          field: "tool_code",
          operator: "EQUALS",
          value: productCode
        }
      ];
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch products from CRM', details: errorData }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (productCode && data.records?.length > 0) {
        return NextResponse.json({ success: true, record: data.records[0] });
    } else if (productCode && data.records?.length === 0) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // 3. Return the specific page of records, plus a boolean to help the frontend know if there are more pages
    const records = data.records || [];
    return NextResponse.json({ 
      success: true, 
      records: records,
      hasMore: records.length === limit // If we got 10 items back, there's likely a next page. If we got 8, we are at the end.
    });

  } catch (error) {
    console.error("CRM Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const formData = await request.formData();
    
    // We need the CRM record ID to know which object to update
    const recordId = formData.get('recordId'); 
    const imageFile = formData.get('image'); 
    const productPayloadStr = formData.get('productPayload'); 
    
    if (!recordId) {
      return NextResponse.json({ error: 'Missing recordId' }, { status: 400 });
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

    // 2. Fetch Existing Record to protect productCode and get Stripe data
    const fetchEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/${recordId}`;
    const existingRecordRes = await fetch(fetchEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Location-Id': locationId,
      }
    });

    if (!existingRecordRes.ok) {
       return NextResponse.json({ error: 'Record not found in CRM' }, { status: 404 });
    }

    const existingRecordData = await existingRecordRes.json();
    const existingProperties = existingRecordData.properties || {};
    const existingPayload = JSON.parse(existingProperties.data || "{}");
    
    // Protect the product code by pulling it straight from the existing DB record
    const protectedProductCode = existingProperties.tool_code; 

    // 3. Upload New Image to GHL Media Library (if a new one was provided)
    let uploadedImageUrl = null;
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
          { error: 'Failed to upload image to CRM', details: mediaError }, 
          { status: mediaResponse.status }
        );
      }

      const mediaData = await mediaResponse.json();
      uploadedImageUrl = mediaData.url; 
    } else if (existingProperties.image && existingProperties.image.length > 0) {
      // Keep existing image if no new file is uploaded
      uploadedImageUrl = existingProperties.image[0].url;
    }

    // 4. Parse New Payload
    let parsedNewData = {};
    try {
      parsedNewData = JSON.parse(productPayloadStr || "{}");
    } catch (e) {
      console.error("Failed to parse new product payload", e);
    }

    const oldPricing = existingPayload.pricing || {};
    const newPricing = parsedNewData.pricing || {};
    let currentLinks = existingPayload.stripePaymentLinks || {};

    // Helper to create Stripe Price and Payment Link (using existing Product ID)
    const createStripePriceAndLink = async (amountStr, interval) => {
      if (!amountStr || isNaN(parseFloat(amountStr))) return null;
      
      const amountCents = Math.round(parseFloat(amountStr) * 100); 
      if (amountCents <= 0) return null;

      const priceConfig = {
        product: existingPayload.stripeProductId, // Attach to the existing Stripe Product
        unit_amount: amountCents,
        currency: 'usd', 
      };

      if (interval) {
        priceConfig.recurring = { interval: interval }; 
      }

      const price = await stripe.prices.create(priceConfig);
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
      });

      return paymentLink.url;
    };

    // 5. Detect Price Changes & Regenerate Links
    if (newPricing.oneTimePrice !== oldPricing.oneTimePrice) {
      if (newPricing.oneTimePrice) {
        currentLinks.oneTimeUrl = await createStripePriceAndLink(newPricing.oneTimePrice, null);
      } else {
        delete currentLinks.oneTimeUrl; // Remove the link if the price tier was deleted
      }
    }
    
    if (newPricing.monthlyPrice !== oldPricing.monthlyPrice) {
      if (newPricing.monthlyPrice) {
        currentLinks.monthlyUrl = await createStripePriceAndLink(newPricing.monthlyPrice, 'month');
      } else {
        delete currentLinks.monthlyUrl;
      }
    }
    
    if (newPricing.annualPrice !== oldPricing.annualPrice) {
      if (newPricing.annualPrice) {
        currentLinks.annualUrl = await createStripePriceAndLink(newPricing.annualPrice, 'year');
      } else {
        delete currentLinks.annualUrl;
      }
    }

    // Merge payloads: overwrite existing fields, but PROTECT Stripe/Code data
    const finalPayload = {
      ...existingPayload, // Start with existing data
      ...parsedNewData,   // Overwrite with any new edits
      pricing: newPricing, // Ensure the newly updated pricing is saved
      stripeProductId: existingPayload.stripeProductId, // Lock in the Stripe Product ID
      stripePaymentLinks: currentLinks // Save the updated/existing links
    };

    // 6. Update the Stripe Product Info (Name, Description, Image)
    if (existingPayload.stripeProductId) {
        await stripe.products.update(existingPayload.stripeProductId, {
          name: finalPayload.productName || protectedProductCode,
          description: finalPayload.description?.replace(/<[^>]*>?/gm, '') || undefined,
          images: uploadedImageUrl ? [uploadedImageUrl] : [],
        });
    }

    // 7. Update Record in GHL Custom Object (Using PUT method as required by GHL)
    const updateEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/${recordId}`;
    const finalPayloadStr = JSON.stringify(finalPayload);

    const response = await fetch(updateEndpoint, {
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
          "tool_code": protectedProductCode, // Explicitly locking in the protected code
          "data": finalPayloadStr, 
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
        { error: 'Failed to update product in CRM', details: errorData }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Integration Update Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // 1. Get the parameters from the URL
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('id');
    const stripeProductId = searchParams.get('stripeProductId');

    if (!recordId) {
      return NextResponse.json({ error: 'Missing CRM record ID' }, { status: 400 });
    }

    const customObjectId = "69a6d83eb206eb7c36275bd5"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    // 2. Safely Archive in Stripe
    // Setting active: false is the safest way to "delete" in Stripe without breaking historical invoices
    if (stripeProductId) {
      try {
        await stripe.products.update(stripeProductId, { active: false });
      } catch (stripeError) {
        console.warn("Could not archive Stripe product. It may already be deleted or missing.", stripeError.message);
      }
    }

    // 3. Delete from GoHighLevel
    const deleteEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/${recordId}`;
    
    const response = await fetch(deleteEndpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Location-Id': locationId,
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to delete from CRM', details: errorData }, 
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Product successfully deleted.' });

  } catch (error) {
    console.error("Integration Delete Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}