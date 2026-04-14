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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setErrorMessage(error.message);
    } else {
      setErrorMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span className="font-medium text-sm">Secure Payment</span>
        </div>
        <span className="font-bold text-lg">${(amount / 100).toFixed(2)}</span>
      </div>

      {/* Stripe's pre-built UI element */}
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Show any error or success messages */}
      {errorMessage && (
        <div className="text-red-600 flex items-center gap-2 text-sm mt-2 bg-red-50 p-3 rounded-md">
          <span>{errorMessage}</span>
        </div>
      )}
    </form>
  );
}