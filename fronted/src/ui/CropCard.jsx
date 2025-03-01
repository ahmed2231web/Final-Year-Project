import React from 'react';

const CropCard = ({ name, price, location, imageUrl }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 hover:bg-green-600 group">
      <img 
        src={imageUrl} 
        alt={name} 
        className="w-full h-48 object-cover transition-transform hover:opacity-80"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-white mb-2">
          {name}
        </h3>
        <div className="flex items-center mb-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1 text-gray-600 group-hover:text-white" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-gray-600 group-hover:text-white">{location}</span>
        </div>
        <div className="flex items-center font-bold">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1 text-gray-600 group-hover:text-white" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span className="text-gray-600 group-hover:text-white">{price}</span>
        </div>
      </div>
    </div>
  );
};

export default CropCard;
