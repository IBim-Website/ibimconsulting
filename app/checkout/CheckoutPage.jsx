"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import { useCart } from "@/app/CartContext";
import { ShieldCheck, Lock, ChevronLeft, Package, Zap } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function CheckoutPage() {
  const { cart, isMounted } = useCart();
  const [clientSecret, setClientSecret] = useState("");

  // Calculate the subtotal dynamically from the cart
  const subtotal = cart.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Stripe requires the amount in cents
  const amountInCents = Math.round(subtotal * 100);

  useEffect(() => {
    // Only create a PaymentIntent if there's a valid amount
    if (amountInCents > 0) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInCents }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => console.error("Failed to initialize checkout:", err));
    }
  }, [amountInCents]);

  // If the context hasn't loaded, don't render to prevent hydration mismatch
  if (!isMounted) return null;

  // Customizing Stripe Elements to match your dark theme UI
  const appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#22d3ee", // cyan-400
      colorBackground: "#020617", // slate-950 (darker background for inputs)
      colorText: "#ffffff",
      colorDanger: "#ef4444",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      borderRadius: "12px",
      colorTextPlaceholder: "#475569", // slate-600
    },
    rules: {
      ".Input": {
        border: "1px solid rgba(30, 58, 138, 0.5)", // blue-900/50
        boxShadow: "none",
      },
      ".Input:focus": {
        border: "1px solid #22d3ee", // cyan-400
        boxShadow: "0 0 10px rgba(34, 211, 238, 0.2)",
      },
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  // Prevent rendering checkout if cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
        <Link
          href="/cart"
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors"
        >
          <ChevronLeft size={20} /> Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-32 pb-24 min-h-screen">
      {/* Header */}
      <div className="flex flex-col mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-400/70 hover:text-cyan-400 transition-colors mb-6 w-fit"
        >
          <ChevronLeft size={16} />
          Return to Cart
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-10 w-2 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
            SECURE <span className="text-cyan-400 font-light">CHECKOUT</span>
          </h1>
        </div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-12 items-start">
        {/* Left Column: Payment Form */}
        <div className="w-full lg:flex-1">
          <div className="bg-[#0A1025]/80 border border-blue-900/40 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.05)]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Lock className="text-cyan-400" size={20} /> Payment Details
            </h2>

            {clientSecret ? (
              <Elements options={options} stripe={stripePromise}>
                {/* Note: You may want to remove the standard white background classes
                  from your CheckoutForm.jsx component to let this container's style shine through.
                */}
                <CheckoutForm amount={amountInCents} />
              </Elements>
            ) : (
              // Loading Skeleton matching the dark theme
              <div className="animate-pulse space-y-6 py-4">
                <div className="h-12 bg-blue-900/20 rounded-xl w-full border border-blue-800/30"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-blue-900/20 rounded w-1/4"></div>
                  <div className="h-12 bg-blue-900/20 rounded-xl w-full border border-blue-800/30"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-blue-900/20 rounded-xl border border-blue-800/30"></div>
                    <div className="h-12 bg-blue-900/20 rounded-xl border border-blue-800/30"></div>
                  </div>
                </div>
                <div className="h-14 bg-blue-600/20 rounded-2xl w-full mt-6"></div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-blue-900/30 flex flex-col sm:flex-row items-center gap-4 text-xs text-blue-300/50 justify-center text-center">
              <span className="flex items-center gap-1.5">
                <Lock size={14} /> 256-bit SSL Encryption
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} /> Guaranteed Safe & Secure Checkout
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Details */}
        <div className="w-full lg:w-[450px] shrink-0 lg:sticky lg:top-32">
          <div className="bg-[#0A1025]/60 border border-blue-900/30 rounded-3xl p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="text-cyan-400" size={20} /> Order Summary
            </h2>

            {/* Scrollable Item List */}
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent">
              {cart.map((item, index) => {
                const itemQuantity = item.quantity || 1;
                const isPackage = !!item.products;

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex gap-4 p-3 rounded-2xl bg-[#020617]/50 border border-blue-900/20"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#020617] overflow-hidden border border-blue-800/30 shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover opacity-90"
                        />
                      ) : (
                        <Package className="text-blue-500/40" size={24} />
                      )}
                    </div>
                    <div className="flex-1 py-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">
                          {item.name}
                        </h4>
                        <span className="text-sm font-bold text-cyan-400">
                          ${((item.price * itemQuantity)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-blue-300/60 uppercase tracking-wider font-bold text-[10px]">
                          {item.package || "One-Time"}
                        </span>
                        <span className="text-blue-400/50">
                          Qty: {itemQuantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="space-y-4 pt-6 border-t border-blue-900/50 text-sm text-blue-200/60">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-white font-medium">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Taxes</span>
                <span className="text-white font-medium">Calculated at next step</span>
              </div>
            </div>

            <div className="flex justify-between items-end mt-6 pt-6 border-t border-blue-900/50">
              <span className="text-lg font-bold text-blue-100">Total</span>
              <div className="text-right">
                <span className="text-xs text-blue-400/50 block mb-1">USD</span>
                <span className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}