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
        className="w-180 h-180 mb-8 "
      />
      <p className="text-5xl font-semibold font-roboto text-black animate-pulse margin-20px opacity-90">
        Touch to Start
      </p>
    </div>
  );
};

export default Welcome;
