"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Load cart from local storage on initial mount
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('tools-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart:", error);
      }
    }
  }, []);

  // 2. Sync cart to local storage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tools-cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  // Cart Actions
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Prevent adding duplicates if it's a one-time digital tool
      if (prevCart.some((item) => item.id === product.id)) return prevCart;
      return [...prevCart, product];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isMounted }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to easily grab the cart anywhere
export const useCart = () => useContext(CartContext);