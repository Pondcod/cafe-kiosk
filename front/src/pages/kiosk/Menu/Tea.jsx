import React from 'react';
import { SideBar } from '../../../component/SideBar.jsx';
import FootBar from '../../../component/FootBar.jsx';
import ColorPalette from '../../../component/ColorPalette';

const Tea = () => {
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: ColorPalette.beige_cus_2 }}>
      <div className="flex flex-1">
        <SideBar />
        <div className="flex-1 p-6">
          <h1 className="text-5xl mt-30 ml-3 font-medium mb-4">Tea</h1>
          <div className="grid grid-cols-3 gap-y-15 gap-x-10 place-items-center mt-13 py-10">
            <div className="py-[6.5rem] px-[5rem]" style={{ backgroundColor: ColorPalette.beige_cus_1 }}>kuay</div>
            <div className="py-[6.5rem] px-[5rem]" style={{ backgroundColor: ColorPalette.orange_cus_1 }}>kuay</div>
            <div className="py-[6.5rem] px-[5rem]" style={{ backgroundColor: ColorPalette.orange_cus_1 }}>kuay</div>
            <div className="py-[6.5rem] px-[5rem]" style={{ backgroundColor: ColorPalette.orange_cus_1 }}>kuay</div>
          </div>
        </div>
      </div>
      <FootBar />
    </div>
  );
};

export default Tea;