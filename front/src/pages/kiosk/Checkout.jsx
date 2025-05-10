import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ColorPalette from '../../component/ColorPalette';
import QR from '../../assets/IMG_9739.JPG';

const Checkout = () => {
  const [method, setMethod] = useState('');
  const navigate = useNavigate();

  const handleConfirm = () => {
    // implement real payment logic here
    navigate('/ThankYou');
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen relative"
      style={{ backgroundColor: ColorPalette.beige_cus_2 }}
    >
      <h1 className="fixed text-7xl px-10 py-3 m-7 rounded-2xl -mt-120 mb-55">Checkout</h1>

      <div className='fixed -mt-70 mb-40'>
        <div className="flex space-x-6 mb-8">
          <button
            onClick={() => setMethod('cash')}
            className="text-5xl px-10 py-3 m-7 rounded-2xl transform transition-all duration-200 ease-in-out active:scale-95"
            style={{
              backgroundColor: method === 'cash'
                ? ColorPalette.yellow_cus
                : ColorPalette.beige_cus_1,
              color: method === 'cash' ? '#000' : '#000',
            }}
          >
            Cash
          </button>
          <button
            onClick={() => setMethod('promptpay')}
            className="text-5xl px-10 py-3 m-7 rounded-2xl transform transition-all duration-200 ease-in-out active:scale-95"
            style={{
              backgroundColor: method === 'promptpay'
                ? ColorPalette.yellow_cus
                : ColorPalette.beige_cus_1,
              color: method === 'promptpay' ? '#000' : '#000',
            }}
          >
            PromptPay
          </button>
        </div>
      </div>

      {method === 'promptpay' && (
        <img
          src={QR}
          alt=""
          className="w-64 h-auto rounded-2xl shadow-lg mt-15"
        />
      )}

      {method && (
        <button
          // onClick={handleConfirm}
          className="absolute text-white text-4xl px-10 py-4 m-7 -mb-140 rounded-2xl" style={{backgroundColor: ColorPalette.green_cus}}
        >
          Confirm Payment
        </button>
      )}

      <button
        onClick={() => navigate(-1)}
        className="absolute bottom-4 left-4 text-4xl px-10 py-3 m-7 rounded-2xl hover:bg-gray-400 active:bg-gray-500" style={{backgroundColor: ColorPalette.orange_cus_2}}
      >
        Back
      </button>
    </div>
  );
};

export default Checkout;