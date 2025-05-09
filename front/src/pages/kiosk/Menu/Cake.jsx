import React from 'react';
import { SideBar } from '../../../component/SideBar.jsx';
import FootBar from '../../../component/FootBar.jsx';
import ColorPalette from '../../../component/ColorPalette';

const Cake = () => {
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: ColorPalette.beige_cus_2 }}>
      <div className="flex flex-1">
        <SideBar />
        <div className="flex-1 p-6">
          <h1 className="text-5xl mt-30 ml-3 font-medium mb-4">Cake</h1>
          <div className="grid grid-cols-3 gap-y-10 gap-x-6 place-items-center mt-13 py-10">
            <div
              className="w-full h-full flex flex-col items-center justify-center rounded-lg shadow-md"
              style={{ backgroundColor: ColorPalette.beige_cus_2 }}
            >
              <img src="/path/to/image1.jpg" alt="Cake Item 1" className="w-24 h-24 object-cover mb-4" />
              <p className="text-lg font-medium">Cake Item 1</p>
              <p className="text-md font-light text-gray-600">$0.00</p>
            </div>
            <div
              className="w-full h-full flex flex-col items-center justify-center rounded-lg shadow-md"
              style={{ backgroundColor: ColorPalette.beige_cus_2 }}
            >
              <img src="/path/to/image2.jpg" alt="Cake Item 2" className="w-24 h-24 object-cover mb-4" />
              <p className="text-lg font-medium">Cake Item 2</p>
              <p className="text-md font-light text-gray-600">$0.00</p>
            </div>
            <div
              className="w-full h-full flex flex-col items-center justify-center rounded-lg shadow-md"
              style={{ backgroundColor: ColorPalette.beige_cus_2 }}
            >
              <img src="/path/to/image3.jpg" alt="Cake Item 3" className="w-24 h-24 object-cover mb-4" />
              <p className="text-lg font-medium">Cake Item 3</p>
              <p className="text-md font-light text-gray-600">$0.00</p>
            </div>
          </div>
        </div>
      </div>
      <FootBar />
    </div>
  );
};

export default Cake;