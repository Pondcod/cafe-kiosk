import React, { useState, useEffect } from 'react';
import logo from '../../assets/Sol-icon.png';
import carousel1 from "../../assets/carousel_1.jpg";
import carousel2 from "../../assets/carousel_2.jpg";
import carousel3 from "../../assets/carousel_3.jpg";
import carousel4 from "../../assets/carousel_4.jpg";
// Import icons directly at the top
import { BiSolidCoffeeBean, BiSolidLeaf } from "react-icons/bi";
import { GiMilkCarton, GiCakeSlice } from "react-icons/gi";
import { LuCupSoda } from "react-icons/lu";
import { MdBakeryDining } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";  
import "slick-carousel/slick/slick.css";  
import "slick-carousel/slick/slick-theme.css";  
import ColorPalette from '../../component/kiosk/ColorPalette.js';
import Cart from '../../component/kiosk/Cart.jsx';
import { useCart } from '../../Context/CartContext.jsx';
import { categoryService } from '../../services/api'; // Import the API service

// Function to get icon component based on category name
const getCategoryIcon = (categoryName) => {
  // Use the already imported icons
  const iconMap = {
    'Coffee': <BiSolidCoffeeBean className="text-[5rem] text-black" />,
    'Tea': <BiSolidLeaf className="text-[5rem] text-black" />,
    'Milk': <GiMilkCarton className="text-[5rem] text-black" />,
    'Others': <LuCupSoda className="text-[5rem] text-black" />,
    'Bakery': <MdBakeryDining className="text-[5rem] text-black" />,
    'Cake': <GiCakeSlice className="text-[5rem] text-black" />
  };
  
  return iconMap[categoryName] || <LuCupSoda className="text-[5rem] text-black" />;
};

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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch categories from backend
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        
        if (response.success) {
          setCategories(response.data || []);
        } else {
          setError(response.message || 'Failed to load categories');
          console.error('Error loading categories:', response.message);
        }
      } catch (err) {
        setError('Failed to connect to the server');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategories();
  }, []);

  const handleStartOver = () => {
    setShowModal(true);
  };

  const cancelStartOver = () => {
    setShowModal(false);
  };

  const handleOrder = () => {
    navigate('/Summary');
  };

  // For testing, we'll use hardcoded categories if API fails
  const fallbackCategories = [
    { category_id: '1', name: 'Coffee' },
    { category_id: '2', name: 'Tea' },
    { category_id: '3', name: 'Milk' },
    { category_id: '4', name: 'Others' },
    { category_id: '5', name: 'Bakery' },
    { category_id: '6', name: 'Cake' },
  ];

  // Use fallback categories if loading failed
  const displayCategories = categories.length > 0 ? categories : (error ? fallbackCategories : []);

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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-y-12 gap-x-6 place-items-center mt-8 px-15 pb-10">
          {displayCategories.map((category) => (
            <div key={category.category_id} className="flex flex-col items-center">
              <button
                onClick={() => navigate(`/Menu/${category.name}`)}
                type="button"
                className="border-none p-7 rounded-4xl shadow-xl outline-hidden"
                style={{ backgroundColor: ColorPalette.beige_cus_1, borderColor: '#000' }}
              >
                {getCategoryIcon(category.name)}
              </button>
              <h1 className="text-2xl mt-2 text-center">{category.name}</h1>
            </div>
          ))}
        </div>
      )}
      
      {/* Show error message if there's an error but still using fallback categories */}
      {error && (
        <div className="text-center pb-4">
          <p className="text-red-500">
            {error}. Using default categories.
          </p>
        </div>
      )}
      
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
            onClick={handleOrder}
            className="text-4xl px-10 py-4 m-10 rounded-2xl"
            style={{ backgroundColor: ColorPalette.yellow_cus }}
          >
            Order
          </button>
        </div>
      </div>
      <Cart />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-800/50"></div>

          <div
            className="relative z-10 flex flex-col items-center shadow-lg rounded-xl p-6 md:px-12 md:py-8 transition-all"
            style={{ backgroundColor: ColorPalette.beige_cus_2 }}
          >
            <div className="flex items-center justify-center p-6">
              <svg
                className="mb-0.5"
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.211.538c1.042.059 1.91.556 2.433 1.566l8.561 17.283c.83 1.747-.455 4.098-2.565 4.131H3.4c-1.92-.03-3.495-2.21-2.555-4.15L9.566 2.085c.164-.31.238-.4.379-.562C10.511.866 11.13.515 12.21.538m-.14 1.908a.97.97 0 0 0-.792.485 574 574 0 0 0-8.736 17.311c-.26.585.187 1.335.841 1.367q8.637.14 17.272 0c.633-.03 1.108-.756.844-1.36a572 572 0 0 0-8.575-17.312c-.175-.31-.431-.497-.855-.491"
                  fill="#DC2626"
                />
                <path
                  d="M12.785 16.094h-1.598l-.175-7.851h1.957zm-1.827 2.401q0-.434.283-.722.283-.287.772-.287t.772.287a1 1 0 0 1 .283.722.97.97 0 0 1-.275.703q-.276.284-.78.284-.505 0-.78-.284a.97.97 0 0 1-.275-.703"
                  fill="#DC2626"
                />
              </svg>
            </div>
            <h2 className="text-slate-900 text-4xl font-medium mt-3 mb-4">Restart Order</h2>
            <div className="flex items-center gap-4 mt-10">
              <button
                type="button"
                onClick={cancelStartOver}
                className="font-bold text-3xl text-gray-700 active:scale-95 transition w-45 h-18 rounded-lg hover:bg-gray-100"
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
                className="font- text-3xl text-white active:scale-95 transition w-45 h-18 rounded-lg"
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

export default MenuPage;