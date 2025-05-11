import React, { useState, useEffect } from 'react';
import { calculateTotalPrice, Sizes } from './Variables';
import { MilkOptions } from '../../data/MenuData';
import { useCart } from '../../Context/CartContext';
import ColorPalette from './ColorPalette';

function OrderSlide({
  itemName,
  itemImage,
  sizes,                  // { Regular, Large }
  initialCustomization,   // passed from Coffee
  onCustomize,            // opens CustomizationSlide
  onConfirm,              // final order handler
  onClose
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Regular');
  const [customization, setCustomization] = useState(initialCustomization);
  useEffect(() => setCustomization(initialCustomization), [initialCustomization]);
  const { addItem } = useCart();

  // trigger mount animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // close with animation, then call parent onClose
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300); // match duration below
  };

  const currentBasePrice = sizes[selectedSize] || sizes.Regular;
  const price = calculateTotalPrice(currentBasePrice, customization?.addOns || [], 
                 MilkOptions.find(m=>m.name===customization?.milk) || null)
                * quantity;

  const handleAdd = () => {
    const order = {
      name: itemName,
      image: itemImage,
      size: selectedSize,
      quantity,
      basePrice: currentBasePrice,
      sweetness: customization?.sweetness,
      milk: customization?.milk,
      addOns: customization?.addOns || [],
      price,
    };
    addItem(order);
    onConfirm(order);
    setIsVisible(false);
    onClose();
  };

  return (
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 bg-gray-400/30 transition-opacity duration-500 z-40 ${
          isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* slide */}
      <div
        className={`fixed bottom-0 left-0 w-full transform transition-transform duration-300 z-50 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height:'100%', borderTopLeftRadius:50, borderTopRightRadius:50, backgroundColor:ColorPalette.beige_cus_2 }}
      >
        <button className="absolute top-12 right-15 text-4xl" onClick={handleClose}>✕</button>
        <div className="flex flex-col items-center justify-center-safe h-full px-6">
          <img src={itemImage} alt={itemName} className="w-60 h-60 object-cover mb-25" />
          <p className="text-5xl font-bold mb-2">{itemName}</p>
          <p className="text-4xl font-semibold mb-4">฿{currentBasePrice.toFixed(2)}</p>
          {/* size */}
          <div className="mt-10 mb-10 flex flex-col gap-4">
            <h1 className='text-4xl mx-auto mb-5'>Size</h1>
            <div className='felx felx-wrap gap-5'>
            {Sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className="px-8 mx-10 text-3xl py-3 rounded-lg transform transition-all duration-200 ease-in-out active:scale-100"
                  style={{
                    backgroundColor: selectedSize === size
                      ? ColorPalette.orange_cus_1   
                      : ColorPalette.beige_cus_1,   
                    color: selectedSize === size ? 'white' : 'black',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {/* quantity */}
          <div className="flex items-center mb-10 gap-8">
            <button className='text-5xl' onClick={()=>setQuantity(q=>Math.max(1,q-1))}>-</button>
            <span className="text-3xl px-14 py-2 rounded-3xl my-10" style={{backgroundColor: ColorPalette.beige_cus_1}}>{quantity}</span>
            <button className='text-5xl' onClick={()=>setQuantity(q=>q+1)}>+</button>
          </div>
          {/* actions */}
          <div className="flex gap-20">
            <button className="text-4xl px-10 text-white py-4 rounded-2xl" style={{backgroundColor: ColorPalette.brown_cus}} onClick={onCustomize}>
              Customize
            </button>
            <button className="text-4xl px-10 py-4 rounded-2xl text-black" style={{backgroundColor: ColorPalette.green_cus}} onClick={handleAdd}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderSlide;