import React, { useState } from 'react';
import { SideBar } from '../../../component/SideBar.jsx';
import FootBar from '../../../component/FootBar.jsx';
import Cart from '../../../component/Cart.jsx';
import CustomizationSlide from '../../../component/Customization_Slide.jsx';
import OrderSlide from '../../../component/Order_Slide.jsx';
import ColorPalette from '../../../component/ColorPalette';
import IcedAmericano from '../../../assets/Menu_Cafe/Americano/Iced_Americano.png';
import IcedCappuccino from '../../../assets/Menu_Cafe/Cappuccino/Hot_Cappuccino.png';
import IcedEspresso from '../../../assets/Menu_Cafe/Espresso/IcedEspresso.png';
import IcedLatte from '../../../assets/Menu_Cafe/Latte/Iced_Latte.png';
import IcedMacchiatos from '../../../assets/Menu_Cafe/Macchiatos/Iced_Caramel_Macchiato.png';
import IcedMocha from '../../../assets/Menu_Cafe/Mocha/Iced_Mocha.png';

const Coffee = () => {
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isOrderSlideOpen, setIsOrderSlideOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });

  const handleItemClick = (itemName, itemImage, basePrice) => {
    setSelectedItem({ itemName, itemImage, basePrice });
    setIsOrderSlideOpen(true); // Open the Order Slide
  };

  const handleAddToCart = (item) => {
    setCart((prevCart) => ({
      items: [...prevCart.items, item],
      totalPrice: prevCart.totalPrice + item.price,
    }));
    setIsOrderSlideOpen(false); // Close the Order Slide after adding to cart
  };

  const handleOpenCustomization = () => {
    setIsOrderSlideOpen(false); // Close the Order Slide
    setIsCustomizationOpen(true); // Open the Customization Slide
  };

  const handleCloseCustomization = () => {
    setIsCustomizationOpen(false);
    setSelectedItem(null);
  };

  const handleCloseOrderSlide = () => {
    setIsOrderSlideOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: ColorPalette.beige_cus_2 }}>
      <div className="flex flex-1">
        <SideBar />
        <div className="flex-1 p-6">
          <h1 className="text-5xl mt-30 ml-3 font-medium mb-4">Coffee</h1>
          <div className="grid grid-cols-3 gap-y-10 gap-x-6 place-items-center mt-13 py-10">
            {/* Iced Americano */}
            <div
              className="w-full h-full flex flex-col items-center justify-center rounded-3xl shadow-md"
              style={{ backgroundColor: ColorPalette.beige_cus_2 }}
              onClick={() => handleItemClick('Iced Americano', IcedAmericano, 2.0)}
            >
              <img src={IcedAmericano} alt="Iced Americano" className="w-24 h-24 object-cover mb-4" />
              <p className="text-lg font-medium">Iced Americano</p>
              <p className="text-md font-light text-gray-600">$2.00</p>
            </div>

            {/* Iced Cappuccino */}
            <div
              className="w-full h-full flex flex-col items-center justify-center rounded-3xl shadow-md"
              style={{ backgroundColor: ColorPalette.beige_cus_2 }}
              onClick={() => handleItemClick('Iced Cappuccino', IcedCappuccino, 2.5)}
            >
              <img src={IcedCappuccino} alt="Iced Cappuccino" className="w-24 h-24 object-cover mb-4" />
              <p className="text-lg font-medium">Iced Cappuccino</p>
              <p className="text-md font-light text-gray-600">$2.50</p>
            </div>

            {/* Iced Espresso */}
            <div
              className="w-full h-full flex flex-col items-center justify-center rounded-3xl shadow-md"
              style={{ backgroundColor: ColorPalette.beige_cus_2 }}
              onClick={() => handleItemClick('Iced Espresso', IcedEspresso, 2.0)}
            >
              <img src={IcedEspresso} alt="Iced Espresso" className="w-24 h-24 object-cover mb-4" />
              <p className="text-lg font-medium">Iced Espresso</p>
              <p className="text-md font-light text-gray-600">$2.00</p>
            </div>

            {/* Iced Latte */}
            <div
              className="w-full h-full flex flex-col items-center justify-center rounded-3xl shadow-md"
              style={{ backgroundColor: ColorPalette.beige_cus_2 }}
              onClick={() => handleItemClick('Iced Latte', IcedLatte, 2.5)}
            >
              <img src={IcedLatte} alt="Iced Latte" className="w-24 h-24 object-cover mb-4" />
              <p className="text-lg font-medium">Iced Latte</p>
              <p className="text-md font-light text-gray-600">$2.50</p>
            </div>

            {/* Iced Macchiatos */}
            <div
              className="w-full h-full flex flex-col items-center justify-center rounded-3xl shadow-md"
              style={{ backgroundColor: ColorPalette.beige_cus_2 }}
              onClick={() => handleItemClick('Iced Macchiatos', IcedMacchiatos, 3.0)}
            >
              <img src={IcedMacchiatos} alt="Iced Macchiatos" className="w-24 h-24 object-cover mb-4" />
              <p className="text-lg font-medium">Iced Macchiatos</p>
              <p className="text-md font-light text-gray-600">$3.00</p>
            </div>

            {/* Iced Mocha */}
            <div
              className="w-full h-full flex flex-col items-center justify-center rounded-3xl shadow-md"
              style={{ backgroundColor: ColorPalette.beige_cus_2 }}
              onClick={() => handleItemClick('Iced Mocha', IcedMocha, 3.0)}
            >
              <img src={IcedMocha} alt="Iced Mocha" className="w-24 h-24 object-cover mb-4" />
              <p className="text-lg font-medium">Iced Mocha</p>
              <p className="text-md font-light text-gray-600">$3.00</p>
            </div>
          </div>
        </div>
      </div>
      <FootBar />

      {/* Order Slide */}
      {isOrderSlideOpen && (
        <OrderSlide
          itemName={selectedItem?.itemName}
          itemImage={selectedItem?.itemImage}
          basePrice={selectedItem?.basePrice}
          onConfirm={(orderDetails) => handleAddToCart(orderDetails)} // Add to cart
          onClose={handleCloseOrderSlide}
          onCustomize={handleOpenCustomization} // Trigger Customization Slide
        />
      )}

      {/* Customization Slide */}
      {isCustomizationOpen && (
        <CustomizationSlide
          itemName={selectedItem?.itemName}
          itemImage={selectedItem?.itemImage}
          basePrice={selectedItem?.basePrice}
          onConfirm={(customizationDetails) => handleAddToCart(customizationDetails)} // Add to cart
          onClose={handleCloseCustomization}
        />
      )}

      {/* Cart */}
      <Cart
        cartItems={cart.items}
        totalPrice={cart.totalPrice}
        toggleCart={() => {}}
      />
    </div>
  );
};

export default Coffee;
