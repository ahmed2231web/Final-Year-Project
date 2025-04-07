import React, { useState, useEffect } from 'react';
import { MdOutlineDashboard } from 'react-icons/md';
import { MdOutlineChat } from "react-icons/md";
import { NavLink } from 'react-router-dom';
import { AiOutlineOpenAI } from 'react-icons/ai';
import { IoMdClose } from "react-icons/io";
import { FaCircle } from 'react-icons/fa';
import authService from '../../services/authService';
import { getUnreadChatsInfo } from '../../services/chatService';

/**
 * Sidebar component for customer dashboard
 * Displays navigation links to different sections of the customer dashboard
 */
export function Sidebar({ closeSidebar }) {
  const [hasUnreadChats, setHasUnreadChats] = useState(false);
  
  // Check for unread messages
  useEffect(() => {
    const checkUnreadMessages = async () => {
      try {
        const token = authService.getAccessToken();
        if (!token) return;
        
        const unreadInfo = await getUnreadChatsInfo(token);
        setHasUnreadChats(Object.keys(unreadInfo).length > 0);
      } catch (error) {
        console.error('Error checking unread messages:', error);
      }
    };
    
    // Check immediately on mount
    checkUnreadMessages();
    
    // Listen for the custom chat-read event
    const handleChatRead = () => {
      // Refresh unread status when a chat is read
      checkUnreadMessages();
    };
    
    window.addEventListener('chat-read', handleChatRead);
    
    // Set up interval to check periodically
    const intervalId = setInterval(checkUnreadMessages, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('chat-read', handleChatRead);
    };
  }, []);

  return (
    <div className="h-full bg-[#0A690E] text-white w-full overflow-y-auto">
      {/* Close Button (Only on small screens) */}
      <div className="lg:hidden p-4 flex justify-end">
        <button onClick={closeSidebar} className="text-white">
          <IoMdClose size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="mt-8">
        <ul>
          {/* Dashboard */}
          <li className="mb-1">
            <NavLink
              to="/customer/dashboard"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 transition-all duration-300 hover:scale-[1.02] ${
                  isActive
                    ? "bg-yellow-400 text-black font-medium shadow-md"
                    : "text-white hover:bg-green-700"
                }`
              }
              onClick={closeSidebar}
            >
              <MdOutlineDashboard className="mr-3 text-xl" /> 
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* Chat System */}
          <li className="mb-1">
            <NavLink
              to="/customer/chat"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 transition-all duration-300 hover:scale-[1.02] ${
                  isActive
                    ? "bg-yellow-400 text-black font-medium shadow-md"
                    : "text-white hover:bg-green-700"
                }`
              }
              onClick={closeSidebar}
            >
              <MdOutlineChat className="mr-3 text-xl" /> 
              <span>Chats</span>
            </NavLink>
          </li>

          {/* ChatBOT */}
          <li className="mb-1">
            <NavLink
              to="/customer/chatbot"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 transition-all duration-300 hover:scale-[1.02] ${
                  isActive
                    ? "bg-yellow-400 text-black font-medium shadow-md"
                    : "text-white hover:bg-green-700"
                }`
              }
              onClick={closeSidebar}
            >
              <AiOutlineOpenAI className="mr-3 text-xl" /> 
              <span>ChatBOT</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
