import React from 'react';
import CropCard from '../Cards/CropCard';

const CropGrid = () => {
  const crops = [
    {
      name: "Organic Vegetables",
      price: "199/box",
      location: "Islamabad, Pakistan",
      imageUrl: "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800"
    },
    {
      name: "Fresh Fruits",
      price: "350/box",
      location: "Lahore, Punjab",
      imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800"
    },
    {
      name: "Organic Honey",
      price: "550/kg",
      location: "Peshawar, KPK",
      imageUrl: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=800"
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