import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaCommentAlt } from 'react-icons/fa';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from "../../assets/Logo.png";
import authService from '../../Services/autheServices';
import { MdOutlineDashboard } from 'react-icons/md';
import { AiOutlineOpenAI } from 'react-icons/ai';

/**
 * Customer-specific header component with navigation links
 * Includes links to public pages and customer dashboard features
 */
function CustomerHeader({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated using authService
    const checkAuthStatus = () => {
      setIsAuthenticated(authService.isAuthenticated());
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
    
    // Update authentication state
    setIsAuthenticated(false);
    
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
    { to: "/faqs", label: "FAQs" },
    { to: "/privacypolicy", label: "Privacy Policy" },
    { to: "/termsandconditions", label: "Terms and Conditions" },
    { to: "/customer/news", label: "News" }
  ];

  // Dashboard links for mobile menu
  const dashboardLinks = [
    { to: "/customer/dashboard", label: "Dashboard", icon: <MdOutlineDashboard className="mr-2" /> },
    { to: "/customer/chatbot", label: "ChatBOT", icon: <AiOutlineOpenAI className="mr-2" /> },
    { 
      to: "/customer/chat", 
      label: "Chat", 
      icon: <FaCommentAlt className="mr-2" /> 
    }
  ];

  return (
    <nav className="bg-[#0A690E] shadow-lg w-full z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center group">
              <div className="relative overflow-hidden rounded-full bg-white p-1 transition-all duration-300 group-hover:scale-110">
                <img 
                  src={Logo} 
                  alt="Logo" 
                  className="h-8 w-8" 
                />
              </div>
              <span className="ml-2 text-xl text-white font-bold transition-all duration-300 group-hover:text-yellow-400">AgroConnect</span>
            </NavLink>
          </div>

          {/* Links for Large Screens */}
          <div className="hidden lg:flex space-x-1">
            {publicLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive 
                    ? "text-yellow-400 font-bold px-3 py-2 rounded-md transition-all duration-300" 
                    : "text-white hover:text-yellow-400 px-3 py-2 rounded-md hover:bg-green-800 transition-all duration-300"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Logout Button */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Chat icon for desktop */}
                <div className="hidden lg:flex items-center mr-2">
                  <NavLink to="/customer/chat" className="text-white hover:text-yellow-400 transition-all duration-300">
                    <FaCommentAlt className="text-xl" />
                  </NavLink>
                </div>
                
                {/* Notification Bell Component */}
                {children && (
                  <div className="hidden lg:flex items-center mr-2">
                    {children}
                  </div>
                )}
                
                <button
                  onClick={handleLogout}
                  className="bg-[#0A690E] text-red-500 font-bold px-4 py-2 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:text-yellow-400 font-medium transition-all duration-300 hidden sm:block"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white hover:text-yellow-400 transition-all duration-300 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? 
                <FaTimes className="text-xl" /> : 
                <FaBars className="text-xl" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        } bg-[#0A690E]`}
      >
        <div className="px-4 py-2 space-y-1 border-t border-green-800">
          {/* Dashboard Links (only show when authenticated) */}
          {isAuthenticated && (
            <div className="py-2 border-b border-green-800">
              <p className="text-yellow-400 font-medium text-sm mb-2">Dashboard</p>
              {dashboardLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive 
                      ? "flex items-center text-yellow-400 font-bold py-2 px-3 rounded-md" 
                      : "flex items-center text-white hover:text-yellow-400 py-2 px-3 rounded-md hover:bg-green-800 transition-all duration-300"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Public Links */}
          {publicLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive 
                  ? "block text-yellow-400 font-bold py-2 px-3 rounded-md" 
                  : "block text-white hover:text-yellow-400 py-2 px-3 rounded-md hover:bg-green-800 transition-all duration-300"
              }
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default CustomerHeader;
