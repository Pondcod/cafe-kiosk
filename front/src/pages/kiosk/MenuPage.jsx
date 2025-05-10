import React, { useState } from 'react';
import logo from '../../assets/Sol-icon.png';
import carousel1 from "../../assets/carousel_1.jpg";
import carousel2 from "../../assets/carousel_2.jpg";
import carousel3 from "../../assets/carousel_3.jpg";
import carousel4 from "../../assets/carousel_4.jpg";
import { BiSolidCoffeeBean } from "react-icons/bi";
import { BiSolidLeaf } from "react-icons/bi";
import { GiMilkCarton } from "react-icons/gi";
import { LuCupSoda } from "react-icons/lu";
import { MdBakeryDining } from "react-icons/md";
import { GiCakeSlice } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";  
import "slick-carousel/slick/slick.css";  
import "slick-carousel/slick/slick-theme.css";  
import ColorPalette from '../../component/ColorPalette.js';
import Cart from '../../component/Cart.jsx';
import { useCart } from '../../Context/CartContext.jsx';

function MenuPage(){
  const settings = {
    infinite: true,  
    autoplay: true, 
    autoplaySpeed: 3500,  
    dots: false,  
    arrows: false,  
    cssEase: 'ease-in-out'
  };
  const navigate = useNavigate();
  const { total, clearCart } = useCart();
  const [showModal, setShowModal] = useState(false);

  const handleStartOver = () => {
    setShowModal(true);
  };

  const cancelStartOver = () => {
    setShowModal(false);
  };

  const handleOrder = () => {
    navigate('/Summary'); // Navigate to the Summary page
  };

  return (
    <div className='h-full flex flex-col' style={{backgroundColor: ColorPalette.beige_cus_2}}>
      <img src={logo} alt="Logo" className="w-45 h-45 mx-auto hover:scale-115 opacity-90" />
      <div className="">
        <div className="w-[calc(100%-2rem)] h-65 mx-auto rounded-3xl overflow-hidden shadow-xl">
          <Slider {...settings}>
            <div>
              <img src={carousel1} alt="1" className="w-full h-full object-cover object-center" />
            </div>
            <div>
              <img src={carousel4} alt="2" className="w-full h-full object-cover object-center" />
            </div>
            <div>
              <img src={carousel3} alt="3" className="w-full h-full object-cover object-center" />
            </div>
            <div>
              <img src={carousel2} alt="4" className="w-full h-full object-cover object-center" />
            </div>
          </Slider>
        </div>
      </div>
      <p className="text-4xl pt-[1.6rem] pl-[2rem]">Explore our menu</p>
      <div className="grid grid-cols-3 gap-y-12 gap-x-6 place-items-center mt-8 px-15 pb-10">
        <div className="flex flex-col items-center">
          <button
            onClick={() => navigate('/Menu/Coffee')}
            type="button"
            className="border-none p-7 rounded-4xl shadow-xl outline-hidden"
            style={{ backgroundColor: ColorPalette.beige_cus_1, borderColor: '#000' }}
          >
            <BiSolidCoffeeBean className="text-[5rem] text-black" />
          </button>
          <h1 className="text-2xl mt-2 text-center">Coffee</h1>
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={() => navigate('/Menu/Tea')}
            type="button"
            className="border-none p-7 rounded-4xl shadow-xl outline-hidden"
            style={{ backgroundColor: ColorPalette.beige_cus_1, borderColor: '#000' }}
          >
            <BiSolidLeaf className="text-[5rem] text-black" />
          </button>
          <h1 className="text-2xl mt-2 text-center">Tea</h1>
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={() => navigate('/Menu/Milk')}
            type="button"
            className="border-none p-7 rounded-4xl shadow-xl outline-hidden"
            style={{ backgroundColor: ColorPalette.beige_cus_1, borderColor: '#000' }}
          >
            <GiMilkCarton  className="text-[5rem] text-black" />
          </button>
          <h1 className="text-2xl mt-2 text-center">Milk</h1>
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={() => navigate('/Menu/Others')}
            type="button"
            className="border-none p-7 rounded-4xl shadow-xl outline-hidden"
            style={{ backgroundColor: ColorPalette.beige_cus_1, borderColor: '#000' }}
          >
            <LuCupSoda  className="text-[5rem] text-black" />
          </button>
          <h1 className="text-2xl mt-2 text-center">Others</h1>
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={() => navigate('/Menu/Bakery')}
            type="button"
            className="border-none p-7 rounded-4xl shadow-xl outline-hidden"
            style={{ backgroundColor: ColorPalette.beige_cus_1, borderColor: '#000' }}
          >
            <MdBakeryDining className="text-[5rem] text-black" />
          </button>
          <h1 className="text-2xl mt-2 text-center">Bakery</h1>
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={() => navigate('/Menu/Cake')}
            type="button"
            className="border-none p-7 rounded-4xl shadow-xl outline-hidden"
            style={{ backgroundColor: ColorPalette.beige_cus_1, borderColor: '#000' }}
          >
            <GiCakeSlice  className="text-[5rem] text-black" />
          </button>
          <h1 className="text-2xl mt-2 text-center">Cake</h1>
        </div>
      </div>
      <div
        className="flex flex-row rounded-t-[3rem] shadow-[0px_9px_2px_rgba(0,0,0,0.5)]"
        style={{ backgroundColor: ColorPalette.beige_cus_1 }}
      >
        <div className="justify-start my-auto">
          <button
            onClick={handleStartOver}
            className="text-4xl px-10 py-4 m-10 rounded-2xl"
            style={{ backgroundColor: ColorPalette.orange_cus_1 }}
          >
            Restart Order
          </button>
        </div>

        <div className="ml-auto my-auto flex flex-row justify-center">
          <p className="my-auto text-2xl">THB {total.toFixed(2)}</p>
        </div>

        <div className="my-auto flex justify-end basis-[40%]">
          <button
            onClick={handleOrder} // Navigate to Summary page
            className="text-4xl px-10 py-4 m-10 rounded-2xl"
            style={{ backgroundColor: ColorPalette.yellow_cus }}
          >
            Order
          </button>
        </div>
      </div>
      <Cart />
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-transparent z-40 pointer-events-auto"
            onClick={cancelStartOver}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <div
              className="relative z-10 flex flex-col items-center shadow-lg rounded-xl p-6 md:px-12 md:py-8 transition-all"
              style={{ backgroundColor: ColorPalette.beige_cus_2 }}
            >
              <div className="flex items-center justify-center p-6" >
                <svg className="mb-0.5" width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.211.538c1.042.059 1.91.556 2.433 1.566l8.561 17.283c.83 1.747-.455 4.098-2.565 4.131H3.4c-1.92-.03-3.495-2.21-2.555-4.15L9.566 2.085c.164-.31.238-.4.379-.562C10.511.866 11.13.515 12.21.538m-.14 1.908a.97.97 0 0 0-.792.485 574 574 0 0 0-8.736 17.311c-.26.585.187 1.335.841 1.367q8.637.14 17.272 0c.633-.03 1.108-.756.844-1.36a572 572 0 0 0-8.575-17.312c-.175-.31-.431-.497-.855-.491" fill="#DC2626"/>
                  <path d="M12.785 16.094h-1.598l-.175-7.851h1.957zm-1.827 2.401q0-.434.283-.722.283-.287.772-.287t.772.287a1 1 0 0 1 .283.722.97.97 0 0 1-.275.703q-.276.284-.78.284-.505 0-.78-.284a.97.97 0 0 1-.275-.703" fill="#DC2626"/>
                </svg>
              </div>
              <h2 className="text-slate-900 text-4xl font-medium mt-3 mb-4">
                Restart Order
              </h2>
              <div className="flex items-center gap-4 mt-10">
                <button
                  type="button"
                  onClick={cancelStartOver}
                  className="font-medium text-3xl text-slate-900 active:scale-95 transition rounded-lg border border-gray-300 hover:bg-gray-100 px-8 py-4"
                  style={{ backgroundColor: ColorPalette.orange_cus_1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    navigate('/');
                  }}
                  className="font-medium text-3xl text-white active:scale-95 transition rounded-lg px-8 py-4"
                  style={{ backgroundColor: ColorPalette.green_cus }}
                >
                  Restart
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MenuPage;
