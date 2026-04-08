import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Add this to your .env file from the Stripe Webhooks dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 

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

      // Fetch the line items associated with this session
      // We expand price and product so we can access the metadata you saved earlier
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product', 'data.price'],
      });

      // 3. MAP STRIPE DATA TO YOUR ORDER API FORMAT
      const orderItems = lineItems.data.map((item) => {
        const product = item.price.product;
        const price = item.price;
        
        // Extract metadata saved during checkout creation
        const crmId = product.metadata.crm_id;
        const licenseType = price.metadata.package_type?.toUpperCase() || 'ONE-TIME';

        // Determine if it is a PACKAGE or PRODUCT. 
        // Adjust this logic if you have a more specific way to differentiate them.
        const isPackage = crmId?.toString().includes('pkg') || product.name.toLowerCase().includes('package');
        const itemType = isPackage ? 'PACKAGE' : 'PRODUCT';

        const mappedItem = {
          license_type: licenseType,
          type: itemType,
          quantity: item.quantity,
          unit_price: price.unit_amount / 100, // Convert from cents to dollars
          total_price: item.amount_total / 100, // Convert from cents to dollars
        };

        // Attach the correct ID key based on the type
        if (itemType === 'PACKAGE') {
          mappedItem.package_id = crmId;
        } else {
          mappedItem.product_id = crmId;
        }

        return mappedItem;
      });

      // Format the final payload for the backoffice API
      const apiPayload = {
        order_info: {
          order_id: null, // Depending on your backend, you may leave this null/omitted so the DB generates it
          type: "WEBSITE",
          source: "STRIPE", // You can hardcode FACEBOOK or track it via session metadata if needed
          order_amount: session.amount_total / 100, // Convert from cents
          order_number: session.id, // Using the Stripe session ID as the unique order number
          date: new Date(session.created * 1000).toISOString().split('T')[0] // Format: YYYY-MM-DD
        },
        customer_info: {
          name: session.customer_details?.name || "Unknown",
          email: session.customer_details?.email || "",
          phone: session.customer_details?.phone || ""
        },
        order_items: orderItems
      };

      console.log("Sending payload to Backoffice API:", JSON.stringify(apiPayload, null, 2));

      // 4. SEND TO BACKOFFICE API
      const response = await fetch('https://backoffice.stage.ibimconsulting.com.au/api/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BACKOFFICE_API_KEY}` // Add if your API is secured
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Backoffice API Error:", errorData);
        // We still return 200 to Stripe so it doesn't retry the webhook endlessly,
        // but you might want to log this to an error tracking service (like Sentry).
        return NextResponse.json({ received: true, warning: 'Failed to send to backoffice' });
      }

      console.log("Order successfully created in Backoffice!");
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}