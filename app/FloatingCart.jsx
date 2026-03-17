"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // <-- Import this
import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';

export default function FloatingCart() {
  const { cart, isMounted } = useCart();
  const pathname = usePathname(); // <-- Get the current URL

  // Don't render until mounted
  if (!isMounted) return null;

  // NEW: Completely hide the cart on any admin routes
  if (pathname.startsWith('/admin')) return null;

  return (
    <Link href="/cart" className="fixed top-6 right-6 lg:top-8 lg:right-8 z-[100] group p-2 block">
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
        
        <ShoppingCart 
          className="text-cyan-400 group-hover:text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-colors" 
          size={28} 
          strokeWidth={2}
        />
        
        {cart.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#020617] transform group-hover:scale-110 transition-transform">
            {cart.length}
          </div>
        )}

      </div>
    </Link>
  );
}