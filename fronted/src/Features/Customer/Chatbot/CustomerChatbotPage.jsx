import React from 'react';
import CustomerChatbot from './CustomerChatbot';
import { FaRobot } from 'react-icons/fa';

const CustomerChatbotPage = () => {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200 py-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
          <FaRobot className="mr-2 text-green-600" />
          AgroBot Assistant
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Your farming assistant for crop information and agricultural guidance
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <CustomerChatbot />
      </div>
    </div>
  );
};

export default CustomerChatbotPage;
