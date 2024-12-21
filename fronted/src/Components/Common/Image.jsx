import React from 'react';
import pic1 from "../../assets/LoginSignupPic.png";
import Vector from "../../assets/Icon.png";

function Image() {
  return (
    <div className="block w-full md:w-1/3 lg:w-2/5 relative mt-8">
      {/* Background Image */}
      <img
        src={pic1}
        alt="Login Illustration"
        className="rounded-lg w-full h-auto"
      />

      {/* Icon with Text */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 sm:top-2/3 md:top-2/3 lg:top-2/3 flex flex-col items-start justify-center">
        <div className="bg-yellow-400 p-4 rounded-full">
          <img
            src={Vector}
            alt="Icon"
            className="w-8 h-8"
          />
        </div>
        <span className="mt-2 text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center sm:text-left">
          We are popular leaders in the agriculture market globally
        </span>
      </div>
    </div>
  );
}

export default Image;
