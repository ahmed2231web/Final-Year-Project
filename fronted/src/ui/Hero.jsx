import React from 'react';
import HeroRectangle from "../assets/OtherPagesPic.png";

function Hero({children}) {
  return (
    <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96"> {/* Responsive height */}
      {/* Background Image */}
      <img 
        src={HeroRectangle} 
        alt="Mission Background" 
        className="w-full h-full object-cover" 
        loading='lazy'
      />

      {/* Dark Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-center sm:items-start justify-center px-4 sm:px-6 md:px-10 lg:px-20 space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white text-center sm:text-left">
          {children}
        </h1>       
      </div>
    </div>
  );
}

export default Hero;
