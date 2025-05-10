import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SideBar } from '../../../component/SideBar.jsx';
import FootBar from '../../../component/FootBar.jsx';
import Cart from '../../../component/Cart.jsx';
import CustomizationSlide from '../../../component/Customization_Slide.jsx';
import OrderSlide from '../../../component/Order_Slide.jsx';
import ColorPalette from '../../../component/ColorPalette';
import { Menu } from '../../../data/MenuData.js';

const Others = () => {
  const navigate = useNavigate();
  const [isOrderSlideOpen, setIsOrderSlideOpen]     = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [selectedItem, setSelectedItem]             = useState(null);
  const [cart, setCart]                             = useState({ items: [], totalPrice: 0 });
  const [customizationDetails, setCustomizationDetails] = useState(null);

  // 1) Filter items whose subCategory includes "Others"
  const othersMenus = Menu.filter(
    item =>
      Array.isArray(item.subCategory) &&
      item.subCategory.includes('Others')
  );
  // 2) All unique by default—no dedupe:
  const displayMenus = othersMenus;

  const handleItemClick = (name, image, sizes, subCategory) => {
    setSelectedItem({ name, image, sizes, subCategory });
    setCustomizationDetails(null);
    setIsOrderSlideOpen(true);
  };

  const handleAddToCart = order => {
    setCart(prev => ({
      items: [...prev.items, order],
      totalPrice: prev.totalPrice + order.price,
    }));
    setIsOrderSlideOpen(false);
    setSelectedItem(null);
    setCustomizationDetails(null);
  };

  const handleOpenCustomization = () => setIsCustomizationOpen(true);
  const handleCloseCustomization = () => setIsCustomizationOpen(false);
  const handleCustomizationConfirm = details => {
    setCustomizationDetails(details);
    setIsCustomizationOpen(false);
  };
  const handleCloseOrderSlide = () => {
    setIsOrderSlideOpen(false);
    setSelectedItem(null);
    setCustomizationDetails(null);
  };

  return (
    <div
      className="relative flex h-screen"
      style={{ backgroundColor: ColorPalette.beige_cus_2 }}
    >
      <FootBar className="fixed bottom-0 left-0 right-0 z-20" />
      <Cart
        cartItems={cart.items}
        totalPrice={cart.totalPrice}
        toggleCart={() => {}}
      />
      <SideBar className="relative z-10" />

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <div className="flex-1 flex flex-col p-6 overflow-y-auto mr-10">
          <h1 className="text-5xl font-medium mb-6">Others</h1>
          <div className="grid grid-cols-3 gap-y-10 gap-x-6 place-items-center">
            {displayMenus.map((item, idx) => (
              <div
                key={idx}
                className="w-full h-full flex flex-col items-center justify-center rounded-3xl shadow-md"
                style={{ backgroundColor: ColorPalette.beige_cus_2 }}
                onClick={() =>
                  handleItemClick(
                    item.name,
                    item.image,
                    item.sizes || { Regular: 0, Large: 0 },
                    item.subCategory
                  )
                }
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.mainCategory}
                    className="w-24 h-24 object-cover mb-4"
                  />
                )}
                <p className="text-lg font-medium">{item.name}</p>
                <p className="text-md font-light text-gray-600">
                  {item.sizes?.Regular && `฿${item.sizes.Regular}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isOrderSlideOpen && selectedItem && (
        <OrderSlide
          itemName={selectedItem.name}
          itemImage={selectedItem.image}
          sizes={selectedItem.sizes}
          initialCustomization={customizationDetails}
          onCustomize={handleOpenCustomization}
          onConfirm={handleAddToCart}
          onClose={handleCloseOrderSlide}
        />
      )}

      {isCustomizationOpen && selectedItem && (
        <CustomizationSlide
          hasMilk={selectedItem.subCategory?.includes('Milk')}
          initialCustomization={customizationDetails}
          onConfirm={handleCustomizationConfirm}
          onClose={handleCloseCustomization}
        />
      )}
    </div>
  );
};

export default Others;