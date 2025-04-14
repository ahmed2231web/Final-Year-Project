import React from 'react';

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md transition-all hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mt-1 sm:mt-2">{value}</h3>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default StatCard;