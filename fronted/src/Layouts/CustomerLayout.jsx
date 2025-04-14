import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CustomerHeader from '../Components/Customer/CustomerHeader';
import { Sidebar } from '../Features/Customer/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import Footer from '../Components/Common/Footer';

/**
 * Layout component for customer pages
 * Includes header, sidebar, and main content area
 */
function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes (mobile navigation)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar function to pass to Sidebar component
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header */}
      <CustomerHeader />
      
      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Toggle */}
        <button 
          className="md:hidden fixed z-50 bottom-4 left-4 bg-green-600 text-white p-3 rounded-full shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar */}
        <div 
          className={`fixed md:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar closeSidebar={closeSidebar} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 w-full">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default CustomerLayout;