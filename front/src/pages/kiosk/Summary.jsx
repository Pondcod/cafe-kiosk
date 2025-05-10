import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../Context/CartContext.jsx';
import ColorPalette from '../../component/ColorPalette.js';

function Cart() {
  const { cartItems, addItem, removeItem, subtotal, total } = useCart();
}

function Summary({ onBack, onCheckout }) {
  const { cartItems, subtotal, discount, total } = useCart();
  const navigate = useNavigate();

  const handleBack = () => (onBack ? onBack() : navigate(-1));
  const handleCheckout = () => (onCheckout ? onCheckout() : navigate('/Checkout'));

  return (
    <div className="flex flex-col h-screen px-6 py-4" style={{ backgroundColor: ColorPalette.beige_cus_2 }}>
      <div className='sticky top-0 mb-6' >
        <p className='font-bold text-[2.5rem]'>Order Summary</p>
      </div>
      <div className="flex-grow overflow-y-auto rounded-2xl">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 text-xl">Your cart is empty.</div>
        ) : (
          cartItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 mb-4 rounded-2xl shadow-md" style={{ backgroundColor: ColorPalette.beige_cus_1 }}>
              <div className="flex items-center">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                <div>
                  <p className="text-2xl font-bold">{item.name}</p>
                  <p className="text-xl text-gray-600">
                    {[
                      item.size && `Size: ${item.size}`,
                      item.sweetness && `Sweetness: ${item.sweetness}`,
                      item.milk && `Milk: ${item.milk}`,
                      item.addOns?.length > 0 && `Add-Ons: ${item.addOns.map(a => a.name).join(', ')}`,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-gray-800">
                  ฿{item.price.toFixed(2)}
                </span>
                <span className="text-2xs text-gray-500">
                  ฿{(item.price / (item.quantity || 1)).toFixed(2)} 
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="px-5">
        <div className="bg-gray-50 p-4 mb-5 rounded-2xl shadow-md">
          <div className="flex text-2xl justify-between"><p className='ml-3'>Subtotal</p><p className='mr-3'>฿{subtotal.toFixed(2)}</p></div>
          {discount > 0 && <div className="flex text 2xl justify-between text-green-600"><p className='ml-3'>Discount</p><p className='mr-3'>-฿{discount.toFixed(2)}</p></div>}
          <div className="flex text-3xl justify-between font-medium"><p className='ml-3'>Total</p><p className='m3-2 mr-3'>฿{total.toFixed(2)}</p></div>
        </div>

        <div className="flex justify-between mt-4 p-4" style={{backgroundColor: ColorPalette.beige_cus_2}}>
          <button onClick={handleBack} className="text-4xl px-10 py-3 m-7 rounded-2xl" style={{backgroundColor: ColorPalette.orange_cus_2}}>Back</button>
          <button onClick={handleCheckout} className="text-4xl text-white px-10 py-4 m-7 rounded-2xl" style={{backgroundColor: ColorPalette.green_cus}}>Check Out</button>
        </div>
      </div>  
    </div>
  );
}

export default Summary;