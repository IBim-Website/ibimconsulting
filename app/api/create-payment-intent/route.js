import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount, cart } = await request.json(); // Make sure your frontend sends 'cart' along with 'amount'

    // Compress the cart to fit inside Stripe's 500-character metadata limit
    const compressedCart = cart.map(item => {
      const isPackage = !!item.products || (item.groupType && item.groupType.toLowerCase().includes('bundle'));
      const rawPackage = item.package || 'ONE_TIME';
      const licenseType = rawPackage.toUpperCase().replace(/[- ]/g, '_');
      
      console.log(item)
      return {
        id: item.id, // Assuming this maps to your crm_id
        type: isPackage ? 'PACKAGE' : 'PRODUCT',
        qty: item.quantity || 1,
        lic: licenseType,
        price: item.price,
        download_url: item.downloadUrl || ""
      };
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "aud",
      automatic_payment_methods: { enabled: true },
      metadata: {
        // We stringify the compressed cart to read it later in the webhook
        cart_items: JSON.stringify(compressedCart),
      },
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}