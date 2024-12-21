import React from 'react';
import ContactCards from '../../Components/Cards/ContactCards';
import Hero from '../../Components/Common/Hero';

function ContactUs() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="w-full text-white">
        <Hero>Contact Us</Hero>
      </div>

      {/* Contact Cards Section */}
      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <ContactCards />
      </div>
    </div>
  );
}

export default ContactUs;
