import React from 'react';
import callVector from "../../assets/callVector.png";
import locationVector from "../../assets/locationVector.png";
import MessageVector from "../../assets/MessageVector.png";

const ContactCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6 lg:p-8">
      {/* Location Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 transform transition-transform hover:scale-105">
        <div className="flex flex-col items-center text-center">
          <div className="bg-yellow-400 p-3 rounded-full mb-4">
            <img src={locationVector} alt="Location Icon" className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Our Location</h3>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            123 Business Avenue
            <br />
            San Francisco, CA 94107
            <br />
            United States
          </p>
        </div>
      </div>

      {/* Email Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 transform transition-transform hover:scale-105">
        <div className="flex flex-col items-center text-center">
          <div className="bg-yellow-400 p-3 rounded-full mb-4">
            <img src={MessageVector} alt="Email Icon" className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Email Us</h3>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            support@company.com
            <br />
            sales@company.com
          </p>
        </div>
      </div>

      {/* Phone Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 transform transition-transform hover:scale-105">
        <div className="flex flex-col items-center text-center">
          <div className="bg-yellow-400 p-3 rounded-full mb-4">
            <img src={callVector} alt="Phone Icon" className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Call Us</h3>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            Toll-free: (800) 123-4567
            <br />
            Fax: (800) 123-4568
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactCards;
