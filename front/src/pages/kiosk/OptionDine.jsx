import React from 'react';
import { useNavigate } from 'react-router-dom';

const OptionDine = () => {
  const navigate = useNavigate();

  const goToMenu = (type) => {
    // You could send type = "dine-in" or "take-away" to the backend later
    navigate('/menu');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <div className="flex space-x-8">
        <div
          className="bg-white text-black p-6 rounded-lg cursor-pointer hover:scale-105 transition"
          onClick={() => goToMenu('dine-in')}
        >
          <h2 className="text-xl font-bold">Dine-In</h2>
          <p className="text-sm">Eat here</p>
        </div>
        <div
          className="bg-white text-black p-6 rounded-lg cursor-pointer hover:scale-105 transition"
          onClick={() => goToMenu('take-away')}
        >
          <h2 className="text-xl font-bold">Take Away</h2>
          <p className="text-sm">Take with you</p>
        </div>
      </div>
    </div>
  );
};

export default OptionDine;
