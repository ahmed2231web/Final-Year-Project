import React from 'react';
import Hero from '../../ui/Hero'
import TeamMember from '../../ui/TeamMember';

// Import images directly
import ahmedImage from '../../assets/ahmed.jpeg';
import ahsanImage from '../../assets/Ahsan.jpg';
import ahmed2Image from '../../assets/ahmed_2.jpg';

function About() {
  const team = [
    {
      name: 'Ahmad Atta',
      role: 'Founder & CEO',
      image: ahmedImage
    },
    {
      name: 'Ahsanullah',
      role: 'Head of Agriculture',
      image: ahsanImage
    },
    {
      name: 'Ahmad Mubashar',
      role: 'Tech Lead',
      image: ahmed2Image
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Hero>About Us</Hero>
      
      <div className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Team
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base md:text-xl text-gray-500">
              Meet the people behind AgroConnect who are passionate about
              transforming agriculture.
            </p>
          </div>
          
          <div className="mt-8 md:mt-10">
            <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
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