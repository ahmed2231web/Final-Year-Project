import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import Logo from "../../assets/Logo.png";

function Footer() {
  return (
    <footer className="bg-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center mb-7">
              <Link to="/">
                <img 
                  src={Logo} 
                  alt="Logo" 
                  className="h-10 w-10 mr-4" 
                />
              </Link>
              <Link to="/" className="text-2xl font-agbluma text-green-900">
                AgroConnect
              </Link>
            </div>
            <p className="text-sm mb-4 text-green-950">
              AgroConnect bridges the gap between farmers, customers, and medicine dealers. Our platform ensures a seamless exchange of products and services for agricultural needs.
            </p>
            <div className="flex space-x-4 text-green-900">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-700">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-700">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-700">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-700">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Right Column: Quality Trust */}
          <div className="col-span-1 lg:col-span-2 text-gray-600">
            <h3 className="text-2xl font-semibold mb-4 text-green-900">Quality Trust: Direct to the Farm</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Useful Links */}
              <div>
                <h4 className="text-lg font-semibold mb-2 text-green-900">Useful Links</h4>
                <ul className="space-y-2">
                  <li><Link to="/" className="hover:underline">Home</Link></li>
                  <li><Link to="/about" className="hover:underline">About</Link></li>
                  <li><Link to="/faq" className="hover:underline">FAQs</Link></li>
                  <li><Link to="/termsandconditions" className="hover:underline">Terms & Conditions</Link></li>
                  <li><Link to="/contact" className="hover:underline">Contact</Link></li>
                </ul>
              </div>

              {/* Working Time */}
              <div>
                <h4 className="text-lg font-semibold mb-2 text-green-900">Working Time</h4>
                <p className="text-sm">Monday - Friday: 9 AM - 6 PM</p>
                <p className="text-sm">Saturday: 10 AM - 4 PM</p>
                <p className="text-sm">Sunday: Closed</p>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-lg font-semibold mb-2 text-green-900">Address</h4>
                <p className="text-sm">123 AgroConnect Lane</p>
                <p className="text-sm">Greenfield City, AG 12345</p>
                <p className="text-sm">Phone: +92 332 6896520</p>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-400 pt-4 text-center lg:flex lg:justify-between lg:items-center">
              <div className="mb-4 lg:mb-0">
                <Link to="/terms" className="hover:underline text-sm">Terms & Conditions</Link>
                <span> | </span>
                <Link to="/privacy" className="hover:underline text-sm">Privacy Policy</Link>
              </div>
              <p className="text-sm">&copy; {new Date().getFullYear()} AgroConnect. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
