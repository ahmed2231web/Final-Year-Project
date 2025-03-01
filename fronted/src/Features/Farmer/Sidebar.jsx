import React from 'react';
import { LiaBoxSolid } from 'react-icons/lia';
import { MdOutlineDashboard } from 'react-icons/md';
import { MdOutlineChat } from "react-icons/md";
import { NavLink } from 'react-router-dom';
import { AiOutlineOpenAI } from 'react-icons/ai';
import { IoMdClose } from "react-icons/io";

export function Sidebar({ closeSidebar }) {
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
          className={({ isActive }) => `flex items-center text-2xl font-agbaluma font-normal transition duration-300 ${
            isActive ? "bg-yellow-400 text-black rounded-full p-3" : "text-white hover:text-yellow-400"
          }`}
        >
          <MdOutlineDashboard className="mr-3 text-2xl" /> Dashboard
        </NavLink>

        {/* All Products */}
        <NavLink
          to="/farmer/products"
          className={({ isActive }) => `flex items-center text-2xl font-agbaluma font-normal transition duration-300 ${
            isActive ? "bg-yellow-400 text-black rounded-full p-3" : "text-white hover:text-yellow-400"
          }`}
        >
          <LiaBoxSolid className="mr-3 text-2xl" /> All Products
        </NavLink>

        {/* Chat System */}
        <NavLink
          to="/farmer/chat"
          className={({ isActive }) =>
            `flex items-center text-2xl font-agbaluma font-normal transition duration-300 ${
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
            `flex items-center text-2xl font-agbaluma font-normal transition duration-300 ${
              isActive ? "bg-yellow-400 text-black rounded-full p-3" : "text-white hover:text-yellow-400"
            }`
          }
        >
          <AiOutlineOpenAI className="mr-3 text-2xl" /> ChatBOT
        </NavLink>
      </div>
    </div>
  );
}
