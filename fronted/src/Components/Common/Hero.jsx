import React from 'react';
import HeroRectangle from "../../assets/OtherPagesPic.png";

function Hero({children}) {
  return (
    <div className="relative w-full h-96"> {/* Adjusted height to h-96 */}
      {/* Background Image */}
      <img 
        src={HeroRectangle} 
        alt="Mission Background" 
        className="w-full h-full object-cover" 
        loading='lazy'
      />

      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-start justify-center px-5 md:px-10 lg:px-20 space-y-4">
        <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white">
          {children}
        </p>       
      </div>
    </div>
  );
}

export default Hero;
