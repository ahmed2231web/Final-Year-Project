import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import Logo from "../assets/Logo.png";
import Button from './Button';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <NavLink to="/">
              <img 
                src={Logo} 
                alt="Logo" 
                className="h-10 w-10 mr-2" 
              />
            </NavLink>
            <NavLink 
              to="/" 
              className="text-2xl text-white font-agbaluma hover:text-yellow-400 transition duration-300 hover:scale-[1.1]"
            >
              AgroConnect
            </NavLink>
          </div>

          {/* Links for Large Screens (Above 840px) */}
          <div className="hidden lg:flex space-x-4">
            <NavLink 
              to="/" 
              className={({ isActive }) =>
                isActive 
                  ? "text-yellow-400 font-bold px-3 py-2" 
                  : "text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) =>
                isActive 
                  ? "text-yellow-400 font-bold px-3 py-2" 
                  : "text-white hover:text-yellow-400 transition duration-300 px-3 py-2 hover:scale-[1.1]"
              }
            >
              About
            </NavLink>
            <NavLink 
              to="/faq" 
              className={({ isActive }) =>
                isActive 
                  ? "text-yellow-400 font-bold px-3 py-2" 
                  : "text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
              }
            >
              FAQs
            </NavLink>
            <NavLink 
              to="/termsandconditions" 
              className={({ isActive }) =>
                isActive 
                  ? "text-yellow-400 font-bold px-3 py-2" 
                  : "text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
              }
            >
              Terms and Conditions
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) =>
                isActive 
                  ? "text-yellow-400 font-bold px-3 py-2" 
                  : "text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
              }
            >
              Contact
            </NavLink>
          </div>

          {/* Dropdown Menu for Small to Medium Screens */}
          {menuOpen && (
            <div className="absolute top-16 left-4 bg-white shadow-md rounded-md w-48 py-2 lg:hidden z-50" onClick={(e) => e.stopPropagation()}>
              <NavLink 
                to="/" 
                className={({ isActive }) =>
                  isActive 
                    ? "block px-4 py-2 text-green-800 bg-gray-100 font-bold" 
                    : "block px-4 py-2 text-gray-700 hover:text-green-800 hover:bg-gray-100"
                } 
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink 
                to="/about" 
                className={({ isActive }) =>
                  isActive 
                    ? "block px-4 py-2 text-green-800 bg-gray-100 font-bold" 
                    : "block px-4 py-2 text-gray-700 hover:text-green-800 hover:bg-gray-100"
                } 
                onClick={() => setMenuOpen(false)}
              >
                About
              </NavLink>
              <NavLink 
                to="/faq" 
                className={({ isActive }) =>
                  isActive 
                    ? "block px-4 py-2 text-green-800 bg-gray-100 font-bold" 
                    : "block px-4 py-2 text-gray-700 hover:text-green-800 hover:bg-gray-100"
                } 
                onClick={() => setMenuOpen(false)}
              >
                FAQs
              </NavLink>
              <NavLink 
                to="/termsandconditions" 
                className={({ isActive }) =>
                  isActive 
                    ? "block px-4 py-2 text-green-800 bg-gray-100 font-bold" 
                    : "block px-4 py-2 text-gray-700 hover:text-green-800 hover:bg-gray-100"
                } 
                onClick={() => setMenuOpen(false)}
              >
                Terms and Conditions
              </NavLink>
              <NavLink 
                to="/contact" 
                className={({ isActive }) =>
                  isActive 
                    ? "block px-4 py-2 text-green-800 bg-gray-100 font-bold" 
                    : "block px-4 py-2 text-gray-700 hover:text-green-800 hover:bg-gray-100"
                } 
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </NavLink>
            </div>
          )}

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Button to="/login" variant="button" className="text-white hover:text-yellow-400">
              Join Now
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
