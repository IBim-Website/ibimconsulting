"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock, Loader2, ShieldCheck } from "lucide-react";

export default function CheckoutForm({ amount }) {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeReady, setIsStripeReady] = useState(false); // NEW: Track iframe load

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setErrorMessage(error.message);
    } else {
      setErrorMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Updated to match your dark UI */}
      <div className="bg-[#020617]/50 p-4 rounded-xl border border-blue-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-200">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span className="font-medium text-sm">Secure Payment</span>
        </div>
        <span className="font-bold text-lg text-white">${(amount / 100).toFixed(2)}</span>
      </div>

      {/* Show spinner while Stripe connects to their servers */}
      {!isStripeReady && (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-blue-400/50">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-xs font-medium">Connecting to secure server...</span>
        </div>
      )}

      {/* Stripe's pre-built UI element */}
      <div className={isStripeReady ? "block" : "hidden"}>
        <PaymentElement 
          id="payment-element" 
          options={{ layout: "tabs" }} 
          onReady={() => setIsStripeReady(true)} // Triggers when fully loaded
        />
      </div>

      <button
        disabled={isLoading || !stripe || !elements || !isStripeReady}
        id="submit"
        className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Pay Now
          </span>
        )}
      </button>

      {errorMessage && (
        <div className="text-red-400 flex items-center gap-2 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
          <span>{errorMessage}</span>
        </div>
      )}
    </form>
  );
}