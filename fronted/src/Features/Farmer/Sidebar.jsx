import React, { useState, useEffect } from 'react';
import { LiaBoxSolid } from 'react-icons/lia';
import { MdOutlineDashboard } from 'react-icons/md';
import { MdOutlineChat } from "react-icons/md";
import { NavLink } from 'react-router-dom';
import { AiOutlineOpenAI } from 'react-icons/ai';
import { IoMdClose } from "react-icons/io";
import { FaNewspaper} from 'react-icons/fa';
import authService from '../../Services/autheServices';
import { getUnreadChatsInfo } from '../../Services/chatService';

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
    <div className="p-6 min-h-screen border-r-2 border-black">
      {/* Close Button (Only on small screens) */}
      <button onClick={closeSidebar} className="lg:hidden text-3xl text-white mb-6">
        <IoMdClose />
      </button>

      {/* Navigation Links */}
      <div className="space-y-6">
        {/* Dashboard */}
        <NavLink
          to="/farmer/dashboard"
          className={({ isActive }) => `flex items-center text-2xl font-agbaluma font-normal ${
            isActive ? "bg-yellow-400 text-black rounded-full p-3" : "text-white hover:text-yellow-400"
          }`}
        >
          <MdOutlineDashboard className="mr-3 text-2xl" /> Dashboard
        </NavLink>

        {/* All Products */}
        <NavLink
          to="/farmer/products"
          className={({ isActive }) => `flex items-center text-2xl font-agbaluma font-normal ${
            isActive ? "bg-yellow-400 text-black rounded-full p-3" : "text-white hover:text-yellow-400"
          }`}
        >
          <LiaBoxSolid className="mr-3 text-2xl" /> All Products
        </NavLink>

        {/* Chat System */}
        <NavLink
          to="/farmer/chat"
          className={({ isActive }) =>
            `flex items-center text-2xl font-agbaluma font-normal ${
              isActive ? "bg-yellow-400 text-black rounded-full p-3" : "text-white hover:text-yellow-400"
            }`
          }
        >
          <MdOutlineChat className="mr-3 text-2xl" /> Chats
        </NavLink>

        {/* ChatBOT */}
        <NavLink
          to="/farmer/chatbot"
          className={({ isActive }) =>
            `flex items-center text-2xl font-agbaluma font-normal ${
              isActive ? "bg-yellow-400 text-black rounded-full p-3" : "text-white hover:text-yellow-400"
            }`
          }
        >
          <AiOutlineOpenAI className="mr-3 text-2xl" /> ChatBOT
        </NavLink>

        {/* News */}
        <NavLink
          to="/farmer/news"
          className={({ isActive }) =>
            `flex items-center text-2xl font-agbaluma font-normal ${
              isActive ? "bg-yellow-400 text-black rounded-full p-3" : "text-white hover:text-yellow-400"
            }`
          }
        >
          <FaNewspaper className="mr-3 text-2xl" /> News
        </NavLink>
      </div>
    </div>
  );
}
