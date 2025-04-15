import React from 'react';
import Image from "../../assets/HomePage.png";

function Hero() {
  return (
    <div className="relative w-full h-screen z-10 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-black/30">
        <img
          src={Image}
          alt="Hero Background"
          className="w-full h-full object-cover -z-10"
          loading='lazy'
        />
      </div>

      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-start justify-center px-6 md:px-10 lg:px-20 space-y-4">
        {/* Circle Text */}
        <div className="bg-white/20 backdrop-blur-sm text-sm md:text-base font-normal text-white rounded-full border border-white/50 py-1 px-4 text-center inline-block">
          Believe in Quality
        </div>

        {/* Quality Trust Heading */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Quality Trust:
        </h1>

        {/* Direct to the Farm Subheading */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Direct to the farm
        </h2>

        {/* Description */}
        <p className="text-sm md:text-base text-white border-t-2 border-white pt-3 max-w-md">
          We all need a little space to grow. Give yourself the space you need to find your inner you.
        </p>

        {/* Button */}
        <a 
          href="/login" 
          className="mt-2 inline-block bg-[#0A690E] font-semibold text-white py-2 px-6 rounded-md transition-colors duration-300 hover:bg-green-700 focus:bg-green-700 focus:outline-none focus:ring focus:ring-green-500 focus:ring-offset-2 text-center shadow-md text-base"
        >
          Shop Now
        </a>
      </div>
    </div>
  );
}

export default Hero;
