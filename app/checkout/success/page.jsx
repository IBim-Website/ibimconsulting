import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from "@/app/CartContext";

export default function SuccessPage() {
  const { clearCart } = useCart(); 

  useEffect(() => {
    if (clearCart) {
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      {/* Success Icon */}
      <CheckCircle className="w-24 h-24 text-green-500 mb-6 animate-pulse" />
      
      {/* Main Heading */}
      <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
        Payment Successful!
      </h1>
      
      {/* Description */}
      <p className="text-lg text-gray-400 mb-10 max-w-md">
        Thank you for your payment. License keys will be sent to your email shortly.
      </p>
      
      {/* Back to Cart Button */}
      <Link 
        href="/cart" 
        className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white transition-colors duration-200 border border-gray-700 rounded-lg hover:bg-gray-800 hover:text-white group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
        Go back to cart
      </Link>
    </div>
  );
}