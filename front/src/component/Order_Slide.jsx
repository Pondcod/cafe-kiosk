import React, { useState, useEffect } from 'react';
import ColorPalette from './ColorPalette';

function OrderSlide({ itemName, itemImage, basePrice, onConfirm, onClose, onCustomize }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // State to handle closing animation
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Trigger the slide-up animation when the component is mounted
    setIsVisible(true);
    return () => setIsVisible(false); // Cleanup when the component is unmounted
  }, []);

  const handleClose = () => {
    setIsClosing(true); // Trigger the slide-down animation
    setTimeout(() => {
      setIsVisible(false); // Hide the component after the animation
      setIsClosing(false); // Reset the closing state
      onClose(); // Call the parent onClose function
    }, 500); // Match the duration of the slide-down animation
  };

  const handleConfirm = () => {
    const orderDetails = {
      itemName,
      quantity,
      totalPrice: basePrice * quantity,
    };
    onConfirm(orderDetails); // Pass order details to parent component
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
          height: '60%',
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

          {/* Name and Price */}
          <p className="text-2xl font-bold mb-2">{itemName}</p>
          <p className="text-lg font-medium text-gray-600 mb-4">
            ${basePrice.toFixed(2)}
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center mb-6">
            <button
              className="px-4 py-2 bg-gray-200 rounded-l-lg"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>
            <p className="px-6 py-2 border-t border-b">{quantity}</p>
            <button
              className="px-4 py-2 bg-gray-200 rounded-r-lg"
              onClick={() => setQuantity((prev) => prev + 1)}
            >
              +
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-lg"
              onClick={onCustomize} // Trigger Customization Slide
            >
              Customize
            </button>
            <button
              className="px-6 py-3 bg-green-500 text-white rounded-lg"
              onClick={handleConfirm}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderSlide;