import React, { useState } from 'react';
import { Sidebar } from '../Features/Farmer/Sidebar';
import { IoIosNotifications } from "react-icons/io";
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from "../assets/Logo.png";
import { FaBars } from 'react-icons/fa';

function Header({ toggleSidebar }) {
  return (
    <div className="bg-[#0A690E] text-white flex justify-between items-center p-4 relative z-50">
      {/* Sidebar Toggle Button */}
      <button onClick={toggleSidebar} className="lg:hidden text-2xl">
        <FaBars />
      </button>

      {/* Logo & App Name */}
      <div className="flex items-center">
        <img src={Logo} alt="Logo" className="h-12 w-12 mr-3 rounded-full" />
        <NavLink to="/" className="text-2xl font-medium font-agbaluma">
          AgroConnect
        </NavLink>
      </div>

      {/* Notifications & Logout Button */}
      <div className="flex items-center gap-6">
        <NavLink to="/farmer/notifications" className="text-2xl">
          <IoIosNotifications />
        </NavLink>
        <button className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700">
          Logout
        </button>
      </div>
    </div>
  );
}



function FarmerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="h-screen flex flex-col">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1">
        {/* Sidebar - Always visible on large screens, conditionally visible on small screens */}
        <div className={`lg:block ${isSidebarOpen ? 'block' : 'hidden'} absolute lg:relative bg-[#0A690E] lg:w-64 w-3/4 min-h-screen`}>
          <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default FarmerLayout;