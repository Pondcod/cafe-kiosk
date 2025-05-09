import React, { useState } from 'react';
import { TbCurrencyBaht } from 'react-icons/tb';
import ColorPalette from './ColorPalette';
import { useNavigate } from 'react-router-dom';

function FootBar({ className }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleStartOver = () => {
    setShowModal(true);
  };

  const confirmStartOver = () => {
    setShowModal(false);
    navigate('/');
  };

  const cancelStartOver = () => {
    setShowModal(false);
  };

  return (
    <div className="relative">
      {/* Main Footer Bar */}
      <div
        className="flex flex-row rounded-tr-[3rem] shadow-[0px_9px_2px_rgba(0,0,0,0.5)]"
        style={{ backgroundColor: ColorPalette.beige_cus_1 }}
      >
        <div className="justify-start my-auto">
          <button
            onClick={handleStartOver}
            className="text-3xl px-6 py-4 m-10 rounded-2xl"
            style={{ backgroundColor: ColorPalette.orange_cus_1 }}
          >
            Restart Order
          </button>
        </div>

        <div className="ml-auto my-auto flex flex-row justify-center">
          <TbCurrencyBaht className="text-4xl" />
          <p className="my-auto text-2xl">00.00</p>
        </div>

        <div className="my-auto flex justify-end basis-[40%]">
          <button
            className="text-4xl px-11 py-6 mr-10 rounded-2xl"
            style={{ backgroundColor: ColorPalette.yellow_cus }}
          >
            Order
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>

          {/* Modal Content */}
          <div
            className="relative z-10 flex flex-col items-center shadow-lg rounded-xl p-6 md:px-12 md:py-8 transition-all"
            style={{ backgroundColor: ColorPalette.beige_cus_2 }}
          >
            <div className="flex items-center justify-center p-6" >
        <svg class="mb-0.5" width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.211.538c1.042.059 1.91.556 2.433 1.566l8.561 17.283c.83 1.747-.455 4.098-2.565 4.131H3.4c-1.92-.03-3.495-2.21-2.555-4.15L9.566 2.085c.164-.31.238-.4.379-.562C10.511.866 11.13.515 12.21.538m-.14 1.908a.97.97 0 0 0-.792.485 574 574 0 0 0-8.736 17.311c-.26.585.187 1.335.841 1.367q8.637.14 17.272 0c.633-.03 1.108-.756.844-1.36a572 572 0 0 0-8.575-17.312c-.175-.31-.431-.497-.855-.491" fill="#DC2626"/>
            <path d="M12.785 16.094h-1.598l-.175-7.851h1.957zm-1.827 2.401q0-.434.283-.722.283-.287.772-.287t.772.287a1 1 0 0 1 .283.722.97.97 0 0 1-.275.703q-.276.284-.78.284-.505 0-.78-.284a.97.97 0 0 1-.275-.703" fill="#DC2626"/>
        </svg>
            </div>
            <h2 className="text-slate-900 text-4xl font-medium mt-3 mb-4">Restart Order</h2>
            <div className="flex items-center gap-4 mt-10">
  <button
    type="button"
    onClick={cancelStartOver}
    className="font-medium text-3xl text-slate-900 active:scale-95 transition w-45 h-18 rounded-lg border border-gray-300 hover:bg-gray-100"
    style={{ backgroundColor: ColorPalette.orange_cus_1 }}
  >
    Cancel
  </button>
  <button
    type="button"
    onClick={confirmStartOver}
    className="font-medium text-3xl text-white active:scale-95 transition w-45 h-18 rounded-lg"
    style={{ backgroundColor: ColorPalette.green_cus }}
  >
    Restart
  </button>
</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FootBar;
