import React from 'react';
import ContactCards from '../../Components/Cards/ContactCards';
import Hero from '../../Components/Common/Hero';

function ContactUs() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="w-full text-white">
        <Hero>Contact Us</Hero>
      </div>

      {/* Contact Cards Section */}
      <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="w-full">
          <ContactCards />
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
