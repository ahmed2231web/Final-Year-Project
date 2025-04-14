import React, { useState, useEffect } from 'react';
import { FaUser, FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from "../../assets/Logo.png";
import Button from './Button';
import axios from 'axios';
import authService from '../../Services/authService';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated using authService
    const checkAuthStatus = async () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        try {
          const type = await authService.getUserType();
          setUserType(type);
        } catch (error) {
          console.error("Error getting user type:", error);
        }
      } else {
        setUserType(null);
      }
    };
    
    // Check authentication status initially
    checkAuthStatus();
    
    // Create a custom event to listen for auth state changes
    window.addEventListener('auth-state-change', checkAuthStatus);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('auth-state-change', checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    // Use authService to logout
    authService.logout();
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Update authentication state
    setIsAuthenticated(false);
    setUserType(null);
    
    // Dispatch auth state change event
    window.dispatchEvent(new Event('auth-state-change'));
    
    // Navigate to home page
    navigate('/');
  };

  // Navigation links for public pages
  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/faq", label: "FAQs" },
    { to: "/privacypolicy", label: "Privacy Policy" },
    { to: "/termsandconditions", label: "Terms and Conditions" }
  ];

  // Navigation links for authenticated users
  const getDashboardLink = () => {
    if (!isAuthenticated) return null;
    
    if (userType === 'farmer') {
      return { to: "/farmer/dashboard", label: "Farmer Dashboard" };
    } else if (userType === 'customer') {
      return { to: "/customer/dashboard", label: "Customer Dashboard" };
    }
    
    return null;
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className="bg-[#0A690E] shadow-lg w-full z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Hamburger Menu for Small to Medium Screens */}
          <div className="block lg:hidden">
            <button
              className="text-white hover:text-yellow-400 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
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
                className="h-8 w-8 sm:h-10 sm:w-10 mr-1 sm:mr-2" 
              />
            </NavLink>
            
            {/* Logo Text */}
            <NavLink to="/" className="text-xl sm:text-2xl text-white font-agbluma hover:text-yellow-400 transition duration-300 hover:scale-[1.1]">
              AgroConnect
            </NavLink>
          </div>

          {/* Links for Large Screens (Above 840px) */}
          <div className="hidden lg:flex space-x-4">
            {publicLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className="text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
                style={({ isActive }) => (isActive ? { color: 'yellow' } : {})}
              >
                {link.label}
              </NavLink>
            ))}
            
            {dashboardLink && (
              <NavLink
                to={dashboardLink.to}
                className="text-white hover:text-yellow-400 transition duration-300 hover:scale-[1.1] px-3 py-2"
                style={({ isActive }) => (isActive ? { color: 'yellow' } : {})}
              >
                {dashboardLink.label}
              </NavLink>
            )}
          </div>

          {/* Dropdown Menu for Small to Medium Screens */}
          {menuOpen && (
            <div
              className="fixed top-16 left-0 right-0 bg-white shadow-md rounded-b-md py-2 lg:hidden z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {publicLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="block px-6 py-3 text-gray-700 hover:text-green-800 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              
              {dashboardLink && (
                <NavLink
                  to={dashboardLink.to}
                  className="block px-6 py-3 text-gray-700 hover:text-green-800 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {dashboardLink.label}
                </NavLink>
              )}
            </div>
          )}

          {/* Auth Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated && (
              <Button
                to={userType === 'farmer' ? "/farmer/dashboard" : "/customer/dashboard"}
                variant="button"
                className="bg-yellow-400 text-stone-800 hover:bg-yellow-300 focus:bg-yellow-300 focus:ring-yellow-300 mr-1 sm:mr-2 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
              >
                Dashboard
              </Button>
            )}
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                variant="button"
                className="bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 focus:ring-red-500 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
              >
                Logout
              </Button>
            ) : (
              <Button
                to="/login"
                variant="button"
                className="bg-yellow-400 text-stone-800 hover:bg-yellow-300 focus:bg-yellow-300 focus:ring-yellow-300 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
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
