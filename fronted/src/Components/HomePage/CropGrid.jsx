import React from 'react';
import CropCard from '../Cards/CropCard';

const CropGrid = () => {
  const crops = [
    {
      name: "Organic Wheat",
      price: "299/ton",
      location: "Gujrat, Punjab",
      imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800"
    },
    {
      name: "Fresh Rice",
      price: "450/ton",
      location: "Lahore, Punjab",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800"
    },
    {
      name: "Premium Cotton",
      price: "750/ton",
      location: "Karachi, Sindh",
      imageUrl: "https://images.unsplash.com/photo-1594179047519-f347310d3322?auto=format&fit=crop&w=800"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-20 text-center">Featured Functional Foods</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {crops.map((crop, index) => (
          <CropCard
            key={index}
            name={crop.name}
            price={crop.price}
            location={crop.location}
            imageUrl={crop.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default CropGrid;