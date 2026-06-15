import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 

/**
 * Helper to authenticate and get the dynamic Backoffice Token
 */
async function getBackofficeToken() {
  const authEndpoint = 'https://backoffice.ibimconsulting.com.au/api/authenticate';
  
  const authResponse = await fetch(authEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_name: process.env.BACKOFFICE_USERNAME,
      password: process.env.BACKOFFICE_PASSWORD
    })
  });

  if (!authResponse.ok) {
    throw new Error(`Backoffice authentication failed with status ${authResponse.status}`);
  }

  const authData = await authResponse.json();
  
  if (authData.status === true && authData.data?.token) {
    return authData.data.token;
  } else {
    throw new Error('Failed to retrieve Backoffice token from the response');
  }
}

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;

    // 1. VERIFY STRIPE SIGNATURE
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // 2. HANDLE SUCCESSFUL CHECKOUT
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Fetch the line items associated with this session to grab the metadata
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product', 'data.price'],
      });

      // 3. MAP STRIPE DATA TO YOUR ORDER API FORMAT
      const orderItems = lineItems.data.map((item) => {
        const product = item.price.product;
        const price = item.price;
        
        const crmId = product.metadata.crm_id;
        
        // FORMAT THE LICENSE TYPE SAFELY
        // Grabs the metadata, defaults to 'ONE_TIME', converts to uppercase, and replaces dashes/spaces with underscores.
        // e.g., "One-Time" -> "ONE_TIME", "Floating" -> "FLOATING", "Monthly" -> "MONTHLY"
        const rawPackage = price.metadata.package_type || 'ONE_TIME';
        const downloadUrl = price.metadata.download_url || "";
        const licenseType = rawPackage.toUpperCase().replace(/[- ]/g, '_');

        // Determine if it is a PACKAGE or PRODUCT.
        const isPackage = crmId?.toString().includes('pkg') || product.name.toLowerCase().includes('package');
        const itemType = isPackage ? 'PACKAGE' : 'PRODUCT';

        const mappedItem = {
          license_type: licenseType, 
          type: itemType,
          quantity: item.quantity,
          unit_price: price.unit_amount / 100, 
          total_price: item.amount_total / 100,  
          download_url: downloadUrl
        };

        if (itemType === 'PACKAGE') {
          mappedItem.package_id = crmId;
        } else {
          mappedItem.product_id = crmId;
        }

        return mappedItem;
      });

      // Generate a unique integer for the required order_id field using a Unix timestamp
      const uniqueOrderId = Math.floor(Date.now() / 1000);

      // Format the final payload for the backoffice API
      const apiPayload = {
        order_info: {
          order_id: uniqueOrderId, // Satisfies the "Order id is required" rule
          type: "WEBSITE",
          source: "STRIPE",
          order_amount: Number((session.amount_total / 100).toFixed(2)), 
          order_number: session.id, // Using the Stripe session ID as the readable order number
          date: new Date(session.created * 1000).toISOString().split('T')[0] 
        },
        customer_info: {
          name: session.customer_details?.name || "Unknown",
          email: session.customer_details?.email || "",
          phone: session.customer_details?.phone || ""
        },
        order_items: orderItems
      };

      console.log("Sending payload to Backoffice API:", JSON.stringify(apiPayload, null, 2));

      // Fetch dynamic token
      const boToken = await getBackofficeToken();

      // 4. SEND TO BACKOFFICE API
      const response = await fetch('https://backoffice.ibimconsulting.com.au/api/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${boToken}` 
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }

        console.error(`❌ Backoffice API Error [Status ${response.status}]:`, JSON.stringify(errorData));

        return NextResponse.json({ 
          received: true, 
          warning: 'Failed to send to backoffice',
          debug_info: {
            backoffice_status: response.status,
            backoffice_error: errorData,
            payload_sent: apiPayload,
            token_fetched: !!boToken // Safely confirm token was generated
          }
        });
      }

      const successData = await response.json();
      console.log("✅ Order successfully created in Backoffice:", successData);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}