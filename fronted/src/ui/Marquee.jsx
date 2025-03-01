import React from 'react';
import { FaLeaf } from 'react-icons/fa'; // Example icon from react-icons

function Marquee() {
  const crops = [
    { name: 'Wheat', price: '30', icon: <FaLeaf /> },
    { name: 'Rice', price: '25', icon: <FaLeaf /> },
    { name: 'Corn', price: '20', icon: <FaLeaf /> },
    { name: 'Barley', price: '35', icon: <FaLeaf /> },
    { name: 'Wheat', price: '30', icon: <FaLeaf /> },
    { name: 'Rice', price: '25', icon: <FaLeaf /> },
    { name: 'Corn', price: '20', icon: <FaLeaf /> },
    { name: 'Barley', price: '35', icon: <FaLeaf /> },
    { name: 'Wheat', price: '30', icon: <FaLeaf /> },
    { name: 'Rice', price: '25', icon: <FaLeaf /> },
    { name: 'Corn', price: '20', icon: <FaLeaf /> },
    { name: 'Barley', price: '35', icon: <FaLeaf /> },
  ];

  return (
    <div className="overflow-hidden bg-[#0A690E] py-3 mt-3">
      <div className="flex animate-marquee space-x-8">
        {crops.map((crop, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 text-white text-lg font-medium"
          >
            {crop.icon}
            <p>{crop.name}</p>
            <span>-</span>
            <p>{crop.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
