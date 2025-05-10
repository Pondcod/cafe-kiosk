import React from 'react';
import ColorPalette from '../ColorPalette';

export default function WarningModal({ secondsLeft = 0, onClose }) {
  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center ">
      <div
        className="absolute inset-0 bg-gray-800/50"
        onClick={onClose}
      />
      <div
        className="relative z-10 bg-white p-6 rounded-[2rem] shadow-lg max-w-sm w-full"
        style={{ backgroundColor: ColorPalette.beige_cus_2 }}
      >
        <h2 className="text-3xl font-bold mb-4 text-center">
          Idle Warning
        </h2>
        <p className="text-center text-lg mb-6">
          No interaction detected. Clearing cart in <br/>{secondsLeft} seconds.
        </p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-4xl text-white rounded-[4rem] hover:bg-blue-600 transition" style={{backgroundColor: ColorPalette.orange_cus_1}}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}