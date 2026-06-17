import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { cart } = await request.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    // 1. VALIDATE STRIPE LIMITATIONS
    // Stripe does not allow mixing different recurring intervals (e.g., Monthly + Annual)
    const hasMonthly = cart.some(
      (item) => item.package?.toLowerCase() === "monthly",
    );
    const hasAnnual = cart.some(
      (item) => item.package?.toLowerCase() === "annual",
    );

    if (hasMonthly && hasAnnual) {
      return NextResponse.json(
        {
          error: "Mixed Billing Intervals",
          message:
            "Stripe does not support checking out with both Monthly and Annual subscriptions at the same time. Please process Monthly and Annual items separately.",
        },
        { status: 400 },
      );
    }

    console.log(cart);
    // Check if the cart contains any subscriptions to set the correct mode
    const hasSubscription = hasMonthly || hasAnnual;
    const checkoutMode = hasSubscription ? "subscription" : "payment";

    const lineItems = await Promise.all(
      cart.map(async (item) => {
        const uniqueId = item.id || item.slug;

        if (!uniqueId) {
          throw new Error(`Missing unique ID for item: ${item.name}`);
        }

        // 2. SEARCH OR CREATE PRODUCT
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

        // 3. SEARCH OR CREATE PRICE based on package type
        const unitAmount = Math.round(item.price * 100);
        const isMonthly = item.package?.toLowerCase() === "monthly";
        const isAnnual = item.package?.toLowerCase() === "annual";

        const prices = await stripe.prices.list({
          product: stripeProductId,
          active: true,
        });

        // Find an existing price that matches the exact amount and interval
        const existingPrice = prices.data.find((p) => {
          if (p.unit_amount !== unitAmount || p.currency !== "usd")
            return false;

          if (isMonthly) return p.recurring?.interval === "month";
          if (isAnnual) return p.recurring?.interval === "year";
          return !p.recurring; // One-time or Floating price
        });

        let stripePriceId;

        if (existingPrice) {
          if (existingPrice.metadata?.download_url !== (item.downloadUrl || "")) {
            await stripe.prices.update(existingPrice.id, {
              metadata: {
                ...existingPrice.metadata,
                download_url: item.downloadUrl || "",
              },
            });
          }
          stripePriceId = existingPrice.id;
        } else {
          // Construct price configuration
          const priceConfig = {
            product: stripeProductId,
            unit_amount: unitAmount,
            currency: "usd",
            metadata: {
              package_type: item.package || "One-Time",
              download_url: item.downloadUrl || "",
            },
          };

          // Add recurring data if necessary
          if (isMonthly) priceConfig.recurring = { interval: "month" };
          if (isAnnual) priceConfig.recurring = { interval: "year" };

          const newPrice = await stripe.prices.create(priceConfig);
          stripePriceId = newPrice.id;
        }

        return {
          price: stripePriceId,
          quantity: item.quantity || 1,
        };
      }),
    );

    // 4. CREATE CHECKOUT SESSION

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: checkoutMode, // Automatically set to 'payment' or 'subscription'
      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });
    console.log(origin);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}
