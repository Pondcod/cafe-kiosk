import React, { useState, useEffect } from 'react';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { useCart } from '../../Context/CartContext.jsx';
import { SweetnessLevels } from '../../data/MenuData.js';

function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, removeItem, subtotal, discount, total } = useCart();

  // total count of all item quantities
  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  // lock page scroll when cart open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleCart = () => setIsOpen(open => !open);

  return (
    <div>
      {/* backdrop to block interaction when cart open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent z-30 pointer-events-auto"
          onClick={toggleCart}
        />
      )}

      {/* Sliding Cart */}
      <div
        className={`fixed top-1/2 right-0 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0 -translate-y-1/2' : 'translate-x-full -translate-y-1/2'
        }`}
        style={{ width: '50%', height: '70%', borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }}
      >
        {/* Cart Button (Protruding Tab) */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 bg-yellow-500 text-white shadow-lg cursor-pointer flex items-center justify-center"
          style={{ width: 60, height: 160, borderTopLeftRadius: 25, borderBottomLeftRadius: 25, left: -60 }}
          onClick={toggleCart}
        >
          <AiOutlineShoppingCart className="text-3xl" />
          {/* badge showing total item quantity */}
          {totalQuantity > 0 && (
            <span className="absolute top-1 right-0 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalQuantity}
            </span>
          )}
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">My Order</h2>
            <button className="text-xl font-bold text-gray-500" onClick={toggleCart}>✕</button>
          </div>

          <div className="flex-grow overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 mt-10 text-xl">Your cart is empty.</div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center mb-4">
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <ul className="text-sm text-gray-600 ml-2">
                      {item.size && <li>Size: {item.size}</li>}
                      {item.sweetness != null && (
                        <li>
                          Sweetness: {SweetnessLevels[item.sweetness] || item.sweetness}
                        </li>
                      )}
                      {item.milk && <li>Milk: {item.milk}</li>}
                      {item.addOns?.length > 0 && (
                        <li>
                          Add-Ons:
                          <ul className="ml-4 text-xs text-gray-400">
                            {item.addOns.map((a, i) => (
                              <li key={i}>
                                {a.name} {a.price > 0 && <span>+฿{a.price.toFixed(2)}</span>}
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="flex items-center">
                    {/* show unit price */}
                    <div className="text-right mr-4">
                      <span className="font-bold">฿{(item.price / (item.quantity || 1)).toFixed(2)}</span>
                      <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                    </div>
                    <button className="text-red-500 ml-2" onClick={() => removeItem(idx)}>Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4">
            <div className="flex justify-between"><span>Subtotal</span><span>฿{subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-฿{discount.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold"><span>Total</span><span>฿{total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;