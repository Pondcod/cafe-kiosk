import React, { createContext, useContext, useState } from 'react';
import { calculateTotalPrice } from '../component/Variables.jsx';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // add or merge identical items
  const addItem = item => setCartItems(prev => {
    // find existing item with same props
    const idx = prev.findIndex(existing =>
      existing.name === item.name &&
      existing.size === item.size &&
      existing.sweetness === item.sweetness &&
      existing.milk === item.milk &&
      // compare addOns by name list
      JSON.stringify((existing.addOns || []).map(a => a.name).sort()) ===
      JSON.stringify((item.addOns || []).map(a => a.name).sort())
    );

    if (idx !== -1) {
      const updated = [...prev];
      const ex = updated[idx];
      const exQty  = ex.quantity || 1;
      const addQty = item.quantity || 1;
      // compute unit price and new totals
      const unitPrice = ex.price / exQty;
      const newQty = exQty + addQty;
      updated[idx] = {
        ...ex,
        quantity: newQty,
        price: unitPrice * newQty
      };
      return updated;
    }

    return [...prev, item];
  });

  const removeItem = index =>
    setCartItems(prev => prev.filter((_, i) => i !== index));
  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      calculateTotalPrice(
        item.basePrice,
        item.addOns || [],
        item.milkObj || null
      ) *
        (item.quantity || 1),
    0
  );
  const discount = subtotal > 500 ? 50 : 0;
  const total = subtotal - discount;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        clearCart,
        subtotal,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}