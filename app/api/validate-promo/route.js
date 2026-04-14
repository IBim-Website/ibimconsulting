import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { code } = await request.json();

    // 1. Check for a customer-facing "Promotion Code"
    const promoCodes = await stripe.promotionCodes.list({
      code: code,
      active: true,
    });

    if (promoCodes.data.length > 0) {
      const promo = promoCodes.data[0];
      
      // 🔥 THE FIX: Hunt down the Coupon ID wherever Stripe hid it in your API version
      let couponId = null;
      
      if (typeof promo.coupon === 'string') {
        couponId = promo.coupon;
      } else if (promo.coupon?.id) {
        couponId = promo.coupon.id;
      } else if (promo.promotion?.coupon) {
        // This targets the exact nested structure shown in your JSON log!
        couponId = promo.promotion.coupon;
      }

      // If we still can't find an ID, bail out safely
      if (!couponId) {
        return NextResponse.json(
          { error: "Could not locate the coupon attached to this promo code." }, 
          { status: 400 }
        );
      }

      // 2. Fetch the actual coupon rules using that ID (KOSqKXoG)
      const couponDetails = await stripe.coupons.retrieve(couponId);
      
      return NextResponse.json({
        code: promo.code,
        promo,
        couponDetails,
        percent_off: couponDetails.percent_off || null,
        amount_off: couponDetails.amount_off || null,
      });
    }

    // 3. Fallback: If not found, check if they typed a direct Coupon ID instead
    try {
      const coupon = await stripe.coupons.retrieve(code);
      if (coupon && coupon.valid) {
        return NextResponse.json({
          code: coupon.id,
          coupon,
          percent_off: coupon.percent_off || null,
          amount_off: coupon.amount_off || null,
        });
      }
    } catch (e) {
      // Ignore retrieve error, it just means the code doesn't exist
    }

    // 4. If nothing matched
    return NextResponse.json(
      { error: "Invalid or expired promo code." }, 
      { status: 400 }
    );

  } catch (error) {
    console.error("Stripe API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to validate code." }, 
      { status: 500 }
    );
  }
}