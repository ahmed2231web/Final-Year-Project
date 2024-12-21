import React from 'react';

function TeamMember({ name, role, image }) {
  return (
    <div className="flex flex-col items-center p-6">
      <img 
        src={image} 
        alt={name} 
        className="w-32 h-32 rounded-full object-cover mb-4"
      />
      <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
      <p className="text-gray-600">{role}</p>
    </div>
  );
}

export default TeamMember;