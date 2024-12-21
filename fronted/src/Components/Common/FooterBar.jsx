import React from 'react';

function FooterBar() {
  return (
    <div className="bg-yellow-400 w-full text-[#010536]">
      {/* Single Row Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center py-4 px-6 space-y-4 md:space-y-0">
        {/* Categories Section */}
        <div className="flex flex-wrap justify-center md:justify-start space-x-4 text-sm sm:text-base">
          <p className="hover:underline cursor-pointer">Farmers</p>
          <p className="hover:underline cursor-pointer">Food</p>
          <p className="hover:underline cursor-pointer">Product</p>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col md:flex-row md:items-center justify-center space-y-4 md:space-y-0 md:space-x-6 text-sm sm:text-base">
          <p className="flex items-center">
            <span className="bg-white rounded-full p-2 mr-2">📞</span> 
            <span>Phone: +1 234 567 890</span>
          </p>
          <p className="flex items-center">
            <span className="bg-white rounded-full p-2 mr-2">✉️</span> 
            <span>Email: info@agroconnect.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default FooterBar;
