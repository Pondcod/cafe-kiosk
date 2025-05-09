import React, { useState, useEffect } from 'react';
import ColorPalette from './ColorPalette';

function CustomizationSlide({ itemName, itemImage, basePrice, onConfirm, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // State to handle closing animation
  const [selectedSize, setSelectedSize] = useState('Regular'); // Default size
  const [addOns, setAddOns] = useState([]); // Selected add-ons

  const sizes = ['Small', 'Regular', 'Large'];
  const availableAddOns = [
    { name: 'Extra Shot', price: 0.5 },
    { name: 'Whipped Cream', price: 0.3 },
    { name: 'Caramel Drizzle', price: 0.4 },
  ];

  useEffect(() => {
    // Trigger the slide-up animation when the component is mounted
    setIsVisible(true);
    return () => setIsVisible(false); // Cleanup when the component is unmounted
  }, []);

  const handleAddOnToggle = (addOn) => {
    setAddOns((prev) => {
      const isSelected = prev.includes(addOn);
      return isSelected ? prev.filter((item) => item !== addOn) : [...prev, addOn];
    });
  };

  const calculateTotalPrice = () => {
    const addOnsPrice = addOns.reduce(
      (total, addOn) => total + availableAddOns.find((item) => item.name === addOn).price,
      0
    );
    return basePrice + addOnsPrice;
  };

  const handleClose = () => {
    setIsClosing(true); // Trigger the slide-down animation
    setTimeout(() => {
      setIsVisible(false); // Hide the component after the animation
      setIsClosing(false); // Reset the closing state
      onClose(); // Call the parent onClose function
    }, 500); // Match the duration of the slide-down animation
  };

  const handleConfirm = () => {
    const customizationDetails = {
      itemName,
      selectedSize,
      addOns,
      totalPrice: calculateTotalPrice(),
    };
    onConfirm(customizationDetails); // Pass customization details to parent component
    handleClose(); // Close the component after confirming
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-500 z-40 ${
          isVisible && !isClosing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose} // Clicking the backdrop closes the slide
      ></div>

      {/* Sliding Panel */}
      <div
        className={`fixed bottom-0 left-0 w-full shadow-lg transform transition-transform duration-500 z-50 ${
          isVisible && !isClosing ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          height: '85%',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          backgroundColor: ColorPalette.beige_cus_2,
        }}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 text-xl font-bold"
          onClick={handleClose}
        >
          ✕
        </button>

        {/* Content */}
        <div className="flex flex-col items-center justify-center h-full px-6">
          {/* Image */}
          <img
            src={itemImage}
            alt={itemName}
            className="w-32 h-32 object-cover mb-4"
          />

          {/* Name */}
          <p className="text-2xl font-bold mb-4">{itemName}</p>

          {/* Size Selector */}
          <div className="mb-6 w-full">
            <p className="text-lg font-medium mb-2">Size:</p>
            <div className="flex gap-4 justify-center">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 rounded-lg ${
                    selectedSize === size
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add-Ons Selector */}
          <div className="mb-6 w-full">
            <p className="text-lg font-medium mb-2">Add-Ons:</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {availableAddOns.map((addOn) => (
                <button
                  key={addOn.name}
                  className={`px-4 py-2 rounded-lg ${
                    addOns.includes(addOn.name)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200'
                  }`}
                  onClick={() => handleAddOnToggle(addOn.name)}
                >
                  {addOn.name} (+${addOn.price.toFixed(2)})
                </button>
              ))}
            </div>
          </div>

          {/* Total Price */}
          <div className="mb-6">
            <p className="text-lg font-medium">
              Total Price: ${calculateTotalPrice().toFixed(2)}
            </p>
          </div>

          {/* Confirm Button */}
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg"
            onClick={handleConfirm}
          >
            Confirm Customization
          </button>
        </div>
      </div>
    </>
  );
}

export default CustomizationSlide;