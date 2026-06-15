import { NextResponse } from "next/server";

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
    const payload = await request.json();
    // Fetch dynamic token
    const boToken = await getBackofficeToken();

    const orderItems = payload.cart.map((item) => {
      // FORMAT THE LICENSE TYPE SAFELY
      // Grabs the metadata, defaults to 'ONE_TIME', converts to uppercase, and replaces dashes/spaces with underscores.
      // e.g., "One-Time" -> "ONE_TIME", "Floating" -> "FLOATING", "Monthly" -> "MONTHLY"
      const mappedItem = {
        license_type: 'Monthly', // Default to Monthly if not specified
        type: 'PRODUCT',
        quantity: item.quantity,
        unit_price: 0,
        total_price: 0,
        product_id: item.id,
        download_url: item.downloadUrl || "",
      };
      return mappedItem;
    });

    // Generate a unique integer for the required order_id field using a Unix timestamp
      const uniqueOrderId = Math.floor(Date.now() / 1000);

      // Format the final payload for the backoffice API
      const apiPayload = {
        order_info: {
          order_id: uniqueOrderId, // Satisfies the "Order id is required" rule
          type: "WEBSITE",
          source: "WEBSITE",
          order_amount: 0, 
          order_number: uniqueOrderId,
          date: new Date().toISOString().split('T')[0] 
        },
        customer_info: {
          name: payload.customer.name || "Unknown",
          email: payload.customer.email || "",
          phone: ""
        },
        order_items: orderItems
      };

      console.log("Sending payload to Backoffice API:", JSON.stringify(apiPayload, null, 2));

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
          token_fetched: !!boToken, // Safely confirm token was generated
        },
      });
    }
    return NextResponse.json({ success: true, emailsent: true });
  } catch (error) {
    console.error("Error in email route:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
