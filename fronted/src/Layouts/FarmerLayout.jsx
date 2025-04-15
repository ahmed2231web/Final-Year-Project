import React, { useState, useEffect } from 'react';
import { Sidebar } from '../Features/Farmer/Sidebar';
import { FaCommentAlt } from "react-icons/fa";
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../assets/Logo.png";
import { FaBars } from 'react-icons/fa';
import authService from '../Services/autheServices';
import { toast } from 'react-hot-toast';

function Header({ toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      authService.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <div className="bg-[#0A690E] text-white flex justify-between items-center p-2 sm:p-3 md:p-4 sticky top-0 shadow-md relative z-50">
      {/* Sidebar Toggle Button */}
      <button 
        onClick={toggleSidebar} 
        className="lg:hidden text-xl sm:text-2xl p-2"
        aria-label="Toggle sidebar"
      >
        <FaBars />
      </button>

      {/* Logo & App Name */}
      <div className="flex items-center">
        <img src={Logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mr-2 sm:mr-3 rounded-full" />
        <NavLink to="/" className="text-lg sm:text-xl md:text-2xl font-medium font-agbaluma truncate">
          AgroConnect
        </NavLink>
      </div>

      {/* Chat & Logout Button */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        <NavLink to="/farmer/chat" className="text-xl sm:text-2xl relative p-2">
          <FaCommentAlt />
        </NavLink>
        <button 
          className="bg-red-600 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm md:text-base rounded-md hover:bg-red-700 transition-colors"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}



function FarmerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('FarmerLayout mounted');
    console.log('Current path:', location.pathname);
    
    const token = authService.getAccessToken();
    console.log('Has token:', !!token);
    
    if (!token) {
      console.log('No token found in FarmerLayout, redirecting to login');
      navigate('/login');
      return;
    }
    
    // If we're at exactly /farmer, redirect to /farmer/dashboard
    if (location.pathname === '/farmer') {
      console.log('At /farmer root, redirecting to /farmer/dashboard');
      navigate('/farmer/dashboard');
    }
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 relative">
        {/* Left column with sidebar */}
        <div className="lg:flex flex-col lg:w-64 hidden bg-[#0A690E]">
          {/* Sidebar */}
          <div className="flex-1 overflow-y-auto">
            <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
          </div>
          
          {/* Sidebar Footer */}
          <div className="bg-[#0A690E] text-white py-3 px-4 text-center border-t border-green-700">
            <p className="text-sm">© 2025 AgroConnect</p>
            <p className="text-xs text-green-300 mt-1">Connecting Farmers & Customers</p>
          </div>
        </div>
        
        {/* Mobile sidebar - conditionally visible */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed z-40 bg-[#0A690E] w-[80%] sm:w-[60%] md:w-[40%] h-screen flex flex-col transition-transform duration-300 ease-in-out shadow-xl"
          >
            <div className="flex-1 overflow-y-auto">
              <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
            </div>
            
            {/* Mobile Sidebar Footer */}
            <div className="bg-[#0A690E] text-white py-3 px-4 text-center border-t border-green-700">
              <p className="text-sm">© 2025 AgroConnect</p>
              <p className="text-xs text-green-300 mt-1">Connecting Farmers & Customers</p>
            </div>
          </div>
        )}

        {/* Overlay when sidebar is open on mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content area */}
        <div className="flex-1 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default FarmerLayout;