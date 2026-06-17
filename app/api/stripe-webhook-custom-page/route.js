import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET2;

/**
 * Helper to authenticate and get the dynamic Backoffice Token
 */
async function getBackofficeToken() {
  const authEndpoint =
    "https://backoffice.ibimconsulting.com.au/api/authenticate";

  const authResponse = await fetch(authEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_name: process.env.BACKOFFICE_USERNAME,
      password: process.env.BACKOFFICE_PASSWORD,
    }),
  });

  if (!authResponse.ok) {
    throw new Error(
      `Backoffice authentication failed with status ${authResponse.status}`,
    );
  }

  const authData = await authResponse.json();

  if (authData.status === true && authData.data?.token) {
    return authData.data.token;
  } else {
    throw new Error("Failed to retrieve Backoffice token from the response");
  }
}

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event;

    // 1. VERIFY STRIPE SIGNATURE
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 },
      );
    }

    // 2. HANDLE SUCCESSFUL CUSTOM CHECKOUT PAYMENT
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log(paymentIntent);
      // Unpack the compressed cart data from the Payment Intent metadata
      let cartItems = [];
      try {
        cartItems = JSON.parse(paymentIntent.metadata.cart_items || "[]");
      } catch (e) {
        console.error("Failed to parse cart metadata:", e);
      }
      console.log("Received cart items from metadata:", cartItems);

      // 3. MAP STRIPE DATA TO YOUR BACKOFFICE API FORMAT
      const orderItems = cartItems.map((item) => {
        let licenseType = item.lic;
        if(licenseType === 'ONE_TIME') {
          licenseType = "LIFETIME";
        }
        const mappedItem = {
          license_type: licenseType,
          type: item.type,
          quantity: item.qty,
          unit_price: item.price,
          total_price: item.price * item.qty,
          download_url: item.download_url || "",
        };

        if (item.type === "PACKAGE") {
          mappedItem.package_id = item.id;
        } else {
          mappedItem.product_id = item.id;
        }

        return mappedItem;
      });

      const extraInfo = await stripe.paymentIntents.retrieve(
        paymentIntent.id,
        { expand: ["latest_charge"] },
      );
      // Extract Customer Info from the Payment Intent's charge details
      const billingDetails =
        extraInfo.latest_charge?.billing_details || {};

      // Generate a unique integer for the required order_id field
      const uniqueOrderId = Math.floor(Date.now() / 1000);

      // Format the final payload for the backoffice API
      const apiPayload = {
        order_info: {
          order_id: uniqueOrderId,
          type: "WEBSITE",
          source: "STRIPE",
          order_amount: Number((paymentIntent.amount / 100).toFixed(2)),
          order_number: paymentIntent.id, // Using PaymentIntent ID as the readable order number
          date: new Date(paymentIntent.created * 1000)
            .toISOString()
            .split("T")[0],
        },
        customer_info: {
          name: billingDetails.name || "Unknown",
          email: billingDetails.email || "", // This is where the email from your CheckoutForm lands
          phone: billingDetails.phone || "",
        },
        order_items: orderItems,
      };

      console.log(
        "Sending payload to Backoffice API:",
        JSON.stringify(apiPayload, null, 2),
      );

      // Fetch dynamic token
      const boToken = await getBackofficeToken();

      // 4. SEND TO BACKOFFICE API
      const response = await fetch(
        "https://backoffice.ibimconsulting.com.au/api/order/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${boToken}`,
          },
          body: JSON.stringify(apiPayload),
        },
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }

        console.error(
          `❌ Backoffice API Error [Status ${response.status}]:`,
          JSON.stringify(errorData),
        );

        return NextResponse.json({
          received: true,
          warning: "Failed to send to backoffice",
          debug_info: {
            backoffice_status: response.status,
            backoffice_error: errorData,
            payload_sent: apiPayload,
            token_fetched: !!boToken,
          },
        });
      }

      const successData = await response.json();
      console.log("✅ Order successfully created in Backoffice:", successData);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
