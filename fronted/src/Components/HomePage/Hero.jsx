import React from 'react';
import Image from "../../assets/HomePage.png";

function Hero() {
  return (
    <div className="relative w-full h-screen z-10">
      {/* Background Image */}
      <img
        src={Image}
        alt="Hero Background"
        className="w-full h-full object-cover -z-10"
        loading='lazy'
      />

      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-start justify-center px-5 md:px-10 lg:px-20 space-y-4">
        {/* Circle Text */}
        <p className="text-sm md:text-lg font-normal text-white rounded-full border p-1 w-36 md:w-44 text-center">
          Believe in Quality
        </p>

        {/* Quality Trust Heading */}
        <p className="text-3xl md:text-5xl lg:text-6xl font-bold text-white">
          Quality Trust:
        </p>

        {/* Direct to the Farm Subheading */}
        <p className="text-3xl md:text-5xl lg:text-6xl font-bold text-white">
          Direct to the farm
        </p>

        {/* Description */}
        <p className="text-xs md:text-sm lg:text-base text-white border-t-2 border-white pt-3">
          We all need a little space to grow. Give yourself the space you need to find your inner you.
        </p>

        {/* Button */}
        <button className="bg-[#0A690E] font-semibold text-white py-2 px-3 md:py-3 md:px-4 rounded-md transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2">
          Shop Now
        </button>
      </div>
    </div>
  );
}

export default Hero;
