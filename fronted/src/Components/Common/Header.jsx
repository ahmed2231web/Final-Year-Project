import React, { useState, useEffect } from 'react';
import { FaUser, FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from "../../assets/Logo.png";
import Button from './Button';
import axios from 'axios';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Update authentication state
    setIsAuthenticated(false);
    
    // Force page reload to update all components
    window.location.href = '/';
  };

  return (
    <nav className="bg-[#0A690E] shadow-lg w-full z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Hamburger Menu for Small to Medium Screens */}
          <div className="block lg:hidden">
            <button
              className="text-white hover:text-yellow-400"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center">
            {/* Logo Image */}
            <NavLink to="/">
              <img 
                src={Logo} 
                alt="Logo" 
                className="h-10 w-10 mr-2" 
              />
            </NavLink>
            
            {/* Logo Text */}
            <NavLink to="/" className="text-2xl text-white font-agbluma hover:text-yellow-400 transition duration-300 hover:scale-[1.1]">
              AgroConnect
            </NavLink>
          </div>

          {/* Links for Large Screens (Above 840px) */}
          <div className="hidden lg:flex space-x-4">
          <NavLink
              to="/"
              className="text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
              style={({ isActive }) => (isActive ? { color: 'yellow' } : {})}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className="text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
              style={({ isActive }) => (isActive ? { color: 'yellow' } : {})}
            >
              About
            </NavLink>
            <NavLink
                to="/faq"
                className="text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
                style={({ isActive }) => (isActive ? { color: 'yellow' } : {})}
              >
                FAQs
              </NavLink>
            
              <NavLink
              to="/termsandconditions"
              className="text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
                style={({ isActive }) => (isActive ? { color: 'yellow' } : {})}
            >
              Terms and Conditions
            </NavLink>
            <NavLink
              to="/contact"
              className="text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
                style={({ isActive }) => (isActive ? { color: 'yellow' } : {})}
            >
              Contact
            </NavLink>
          </div>

          {/* Dropdown Menu for Small to Medium Screens */}
          {menuOpen && (
            <div
              className="absolute top-16 left-4 bg-white shadow-md rounded-md w-48 py-2 lg:hidden z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <NavLink
                to="/"
                className="block px-4 py-2 text-gray-700 hover:text-green-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className="block px-4 py-2 text-gray-700 hover:text-green-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                About
              </NavLink>
              <NavLink
                to="/faq"
                className="block px-4 py-2 text-gray-700 hover:text-green-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                FAQs
              </NavLink>
              <NavLink
                to="/termsandconditions"
                className="block px-4 py-2 text-gray-700 hover:text-green-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Terms and Conditions
              </NavLink>
              <NavLink
                to="/contact"
                className="block px-4 py-2 text-gray-700 hover:text-green-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </NavLink>
            </div>
          )}

          {/* Auth Button */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                variant="button"
                className="bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 focus:ring-red-500"
              >
                Logout
              </Button>
            ) : (
              <Button
                to="/login"
                variant="button"
                className="bg-yellow-400 text-stone-800 hover:bg-yellow-300 focus:bg-yellow-300 focus:ring-yellow-300"
              >
                Join Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
