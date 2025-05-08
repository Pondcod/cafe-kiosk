import React from 'react';
import logo from '../../assets/Sol-icon.png';
import { useNavigate } from 'react-router-dom';
import ColorPalette from '../../component/ColorPalette.js';

function Welcome() {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate('/OptionDine')}
      className="w-full h-screen flex flex-col justify-center items-center cursor-pointer select-none"
      style={{ backgroundColor: ColorPalette.beige_cus_2 }} 
    >
      <img
        src={logo}
        alt="Logo"
        className="w-60 h-60 mb-8 transition-transform duration-300 hover:scale-115 opacity-100"
      />
      <p className="text-4xl font-semibold font-roboto text-black animate-pulse margin-20px opacity-90">
        Touch to Start
      </p>
    </div>
  );
};

export default Welcome;
