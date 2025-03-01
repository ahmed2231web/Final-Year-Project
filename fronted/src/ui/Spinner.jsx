import React from "react";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center my-12">
      <div className="relative w-16 h-16">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-green-300 rounded-full opacity-30"></div>

        {/* Rotating Ring */}
        <div className="w-16 h-16 border-4 border-transparent border-t-green-500 border-l-green-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Spinner;
