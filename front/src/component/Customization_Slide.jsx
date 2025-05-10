import React, { useState, useEffect } from 'react';
import ColorPalette from './ColorPalette';
import { MilkOptions, AddOns, SweetnessLevels } from '../data/MenuData';

// display labels instead of raw numbers
const SweetnessLabels = ['Less', 'Regular', 'Extra'];

function CustomizationSlide({
  hasMilk,
  initialCustomization = null,   // ← accept the prop
  onConfirm,
  onClose,
  itemName,
  itemImage,
}) {
  const [isVisible, setIsVisible]       = useState(false);
  const [isClosing, setIsClosing]       = useState(false);
  // initialize from initialCustomization or fall back
  const [sweetness, setSweetness]       = useState(initialCustomization?.sweetness || SweetnessLevels[0]);
  const [milk, setMilk]                 = useState(initialCustomization?.milk      || MilkOptions[0].name);
  const [addOns, setAddOns]             = useState(
    initialCustomization?.addOns?.map(a => a.name) || []
  );

  // animate in
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // sync when initialCustomization changes
  useEffect(() => {
    setSweetness(initialCustomization?.sweetness || SweetnessLevels[0]);
    setMilk     (initialCustomization?.milk      || MilkOptions[0].name);
    setAddOns   (initialCustomization?.addOns?.map(a => a.name) || []);
  }, [initialCustomization]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsVisible(false);
      onClose();
    }, 500);
  };

  const handleConfirm = () => {
    const selected = AddOns.filter(a => addOns.includes(a.name));
    onConfirm({ 
      sweetness: SweetnessLabels[sweetness], 
      milk: hasMilk ? milk : null, 
      addOns: selected 
    });
    handleClose();
  };

  const toggleAddOn = name =>
    setAddOns(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );

  return (
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 bg-gray-400/30 transition-opacity duration-500 z-40 ${
          isVisible && !isClosing
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* panel */}
      <div
        className={`fixed bottom-0 left-0 w-full transform transition-transform duration-500 z-50 ${
          isVisible && !isClosing ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          height: '100%',
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          backgroundColor: ColorPalette.beige_cus_2
        }}
      >
        <button className="absolute top-12 right-15 text-4xl" onClick={handleClose}>✕</button>
        <div className="flex flex-col items-start justify-start h-full px-6">
          

          <h2 className="text-5xl font-bold mb-5 mx-auto mt-30 text-center w-full">
            Customize
          </h2>
          {/* Sweetness */}
          <div className="mt-10 mb-10 flex flex-col gap-4">
            <p className="text-4xl justify-start mb-4">Sweetness</p>
            <div className="flex flex-wrap justify-start gap-4">
              {SweetnessLevels.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSweetness(i)}
                  className="px-8 text-2xl py-3 rounded-2xl transform transition-all duration-200 ease-in-out active:scale-95"
                  style={{
                    backgroundColor: sweetness === i
                      ? ColorPalette.orange_cus_1
                      : ColorPalette.beige_cus_1,
                    color: sweetness === i ? '#fff' : '#000',
                  }}
                >
                  {SweetnessLabels[i]}
                </button>
              ))}
            </div>
          </div>
          {/* Milk Options */}
          {hasMilk && (
            <div className="mb-6 flex flex-col gap-4">
              <p className="text-4xl justify-start mb-4">Milk Option</p>
              <div className="flex flex-wrap justify-start gap-4">
                {MilkOptions.map(m => (
                  <button
                    key={m.name}
                    onClick={() => setMilk(m.name)}
                    className="px-8 text-2xl py-3 rounded-2xl transform transition-all duration-200 ease-in-out active:scale-95"
                    style={{
                      backgroundColor: milk === m.name
                        ? ColorPalette.orange_cus_1
                        : ColorPalette.beige_cus_1,
                      color: milk === m.name ? '#fff' : '#000',
                    }}
                  >
                    {m.name}{m.price > 0 && ` (+฿${m.price.toFixed(2)})`}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Add-Ons */}
          <div className="mb-6 flex flex-col gap-4">
            <p className="text-4xl justify-start mb-4">Add-On</p>
            <div className="flex flex-wrap justify-start gap-4">
              {AddOns.map(a => (
                <button
                  key={a.name}
                  onClick={() => toggleAddOn(a.name)}
                  className="px-8 text-2xl py-3 rounded-2xl transform transition-all duration-200 ease-in-out active:scale-95"
                  style={{
                    backgroundColor: addOns.includes(a.name)
                      ? ColorPalette.orange_cus_1
                      : ColorPalette.beige_cus_1,
                    color: addOns.includes(a.name) ? '#fff' : '#000',
                  }}
                >
                  {a.name} (+฿{a.price.toFixed(2)})
                </button>
              ))}
            </div>
          </div>
            <button
              onClick={() => handleConfirm()}
              className="px-10 py-4 text-4xl mx-auto rounded-2xl text-white"
              style={{ backgroundColor: ColorPalette.brown_cus }}
            >
              Confirm
            </button>
          </div>
        </div>
    </>
  );
}

export default CustomizationSlide;