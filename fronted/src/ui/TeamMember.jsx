import React from 'react';

function TeamMember({ name, role, image }) {
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 transition-all hover:shadow-md rounded-lg hover:bg-gray-50">
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 sm:mb-4 border-2 border-green-600">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">{name}</h3>
      <p className="text-sm sm:text-base text-gray-600 text-center">{role}</p>
    </div>
  );
}

export default TeamMember;