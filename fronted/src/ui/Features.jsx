import React from 'react';
import { FaStore, FaRobot, FaHandshake } from 'react-icons/fa';

function Features() {
  const features = [
    {
      icon: <FaStore className="h-12 w-12 text-primary" />,
      title: 'Online Marketplace',
      description: 'Connect directly with farmers and purchase fresh produce online or offline.'
    },
    {
      icon: <FaRobot className="h-12 w-12 text-primary" />,
      title: 'AI-Powered Support',
      description: 'Get intelligent solutions for crop-related issues and farming advice.'
    },
    {
      icon: <FaHandshake className="h-12 w-12 text-primary" />,
      title: 'Trusted Network',
      description: 'Join our community of verified farmers, customers, and medicine dealers.'
    }
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Why Choose AgroConnect?</h2>
          <p className="mt-4 text-xl text-gray-500">Everything you need to grow and succeed in agriculture.</p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="pt-6 transition delay-300 duration-300 ease-in-out hover:scale-[1.1]"
              >
                <div className="group flow-root bg-gray-50 hover:text-white rounded-lg px-6 pb-8 hover:bg-[#0A690E] hover:shadow-lg">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-yellow-400 rounded-full shadow-lg">
                      {feature.icon}
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight group-hover:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-5 text-base text-gray-500 group-hover:text-white">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Features;
