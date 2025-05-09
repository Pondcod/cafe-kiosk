import React, { useState } from 'react';
import { AiOutlineShoppingCart } from 'react-icons/ai';

// Example cart items (replace with your actual cart state or props)
const exampleCartItems = [
  { id: 1, name: 'Iced Americano', price: 2.5 },
  { id: 2, name: 'Iced Latte', price: 3.0 },
  { id: 3, name: 'Croissant', price: 2.0 },
];

function Cart() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  // Calculate total price
  const totalPrice = exampleCartItems.reduce((total, item) => total + item.price, 0);

  return (
    <div>
      {/* Sliding Cart */}
      <div
        className={`fixed top-1/2 right-0 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0 -translate-y-1/2' : 'translate-x-full -translate-y-1/2'
        }`}
        style={{
          width: '40%',
          height: '80%', // Set height to 70% of the screen
          borderTopLeftRadius: '20px',
          borderBottomLeftRadius: '20px',
        }}
      >
        {/* Cart Button (Protruding Tab) */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 bg-yellow-500 text-white shadow-lg cursor-pointer z-50 flex items-center justify-center"
          style={{
            width: '50px',
            height: '150px',
            borderTopLeftRadius: '25px',
            borderBottomLeftRadius: '25px',
            left: '-50px',
          }}
          onClick={toggleCart}
        >
          <AiOutlineShoppingCart className="text-4xl" />
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">My Order</h2>
            <button
              className="text-xl font-bold text-gray-500"
              onClick={toggleCart}
            >
              ✕
            </button>
          </div>

          {/* Take Away / Dine In */}
          <div className="mb-6">
            <p className="text-lg font-medium">Take Away / Dine In</p>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
            {exampleCartItems.length > 0 ? (
              exampleCartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <p className="text-lg">{item.name}</p>
                  <p className="text-lg font-medium">${item.price.toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-lg text-gray-500">Your cart is empty.</p>
            )}
          </div>

          {/* Total */}
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold">Total:</p>
              <p className="text-lg font-bold">${totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;