import React from 'react';
import { useNavigate } from 'react-router-dom';
import ColorPalette from '../../component/ColorPalette.js';
import { VscCoffee } from "react-icons/vsc";
import { SiBuymeacoffee } from "react-icons/si";


function OptionDine(){
  return (
    <div className="h-screen grid place-items-center" style={{ backgroundColor: ColorPalette.beige_cus_2 }} >
      <div className="grid grid-cols-2 gap-x-50">
        <div className="flex flex-col items-center">
          <button
            type="button"
            className="border-2 p-8 rounded-3xl shadow-md"
            style={{ backgroundColor: ColorPalette.beige_cus_1, borderColor: '#000' }}
          >
            <VscCoffee className="text-9xl text-black" />
          </button>
          <h1 className="text-4xl font-semibold mt-4">Dine-in</h1>
        </div>

        <div className="flex flex-col items-center">
          <button
            type="button"
            className="border-2 p-8 rounded-3xl shadow-xl"
            style={{ backgroundColor: ColorPalette.beige_cus_1, borderColor: '#000' }}
          >
            <SiBuymeacoffee className="text-9xl text-black" />
          </button>
          <h1 className="text-4xl font-semibold mt-4">Take-away</h1>
        </div>
      </div>
    </div>

  



  );
}

export default OptionDine;
