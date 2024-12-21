import React from 'react';
import Hero from '../../Components/Common/Hero'
import TeamMember from '../../Components/AboutCompnents/TeamMember';

function About() {
  const team = [
    {
      name: 'Ahmad Atta',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Ahsanullah',
      role: 'Head of Agriculture',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Ahmad Mubashar',
      role: 'Tech Lead',
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero>About Us</Hero>
      
      <div className="py-12 bg-white">
        <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Team
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Meet the people behind AgroConnect who are passionate about
              transforming agriculture.
            </p>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <TeamMember key={member.name} {...member} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;