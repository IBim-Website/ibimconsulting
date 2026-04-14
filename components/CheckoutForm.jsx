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

  // NEW: State for customer details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeReady, setIsStripeReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        // NEW: Explicitly pass the email and name to Stripe so your webhook can read it
        receipt_email: email, 
        payment_method_data: {
          billing_details: {
            name: name,
            email: email,
          },
        },
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
      
      {/* NEW: Customer Details Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-blue-300 mb-1">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
            className="w-full bg-[#020617] border border-blue-900/50 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-blue-300 mb-1">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john@example.com"
            className="w-full bg-[#020617] border border-blue-900/50 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#020617]/50 p-4 rounded-xl border border-blue-900/30 flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-blue-200">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span className="font-medium text-sm">Secure Payment</span>
        </div>
        <span className="font-bold text-lg text-white">${(amount / 100).toFixed(2)}</span>
      </div>

      {!isStripeReady && (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-blue-400/50">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-xs font-medium">Connecting to secure server...</span>
        </div>
      )}

      <div className={isStripeReady ? "block" : "hidden"}>
        <PaymentElement 
          id="payment-element" 
          options={{ layout: "tabs" }} 
          onReady={() => setIsStripeReady(true)} 
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