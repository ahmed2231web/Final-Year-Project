import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSpinner, FaComment, FaCircle } from 'react-icons/fa';
import authService from '../../../Services/autheServices';
import { getChatRooms } from '../../../Services/chatService';
import toast from 'react-hot-toast';

/**
 * FarmerChatList Component
 * Displays a list of chat rooms for the farmer
 */
function FarmerChatList() {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRooms, setFilteredRooms] = useState([]);

  // Load chat rooms on component mount
  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        const token = authService.getAccessToken();
        const rooms = await getChatRooms(token);
        console.log('Chat rooms loaded:', rooms);
        setChatRooms(rooms);
        setFilteredRooms(rooms);
      } catch (error) {
        console.error('Error loading chat rooms:', error);
        toast.error('Failed to load chat rooms');
      } finally {
        setLoading(false);
      }
    };

    loadChatRooms();
  }, []);

  // Sort and filter rooms based on search term and status
  useEffect(() => {
    let sorted = [...chatRooms];
    
    // Sort by status: new first, then active, then completed
    sorted.sort((a, b) => {
      // First priority: new orders at the top
      if (a.order_status === 'new' && b.order_status !== 'new') return -1;
      if (a.order_status !== 'new' && b.order_status === 'new') return 1;
      
      // Second priority: active orders before completed
      if (a.order_status === 'active' && b.order_status === 'completed') return -1;
      if (a.order_status === 'completed' && b.order_status === 'active') return 1;
      
      // Third priority: sort by recency (newest first)
      return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
    });
    
    // Apply search filter if there's a search term
    if (searchTerm.trim()) {
      sorted = sorted.filter(room => {
        const searchTermLower = searchTerm.toLowerCase();
        const customerName = room.customer?.full_name?.toLowerCase() || '';
        const productName = room.product?.productName?.toLowerCase() || '';
        return customerName.includes(searchTermLower) || productName.includes(searchTermLower);
      });
    }
    
    setFilteredRooms(sorted);
  }, [searchTerm, chatRooms]);

  // Format timestamp for last message
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If the message is from today, show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the message is from this week, show the day name
    const daysAgo = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show the date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Navigate to chat room
  const openChatRoom = (roomId) => {
    navigate(`/farmer/chat/${roomId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-semibold">Messages</h1>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white p-3 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      
      {/* Chat Rooms List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-green-600 text-3xl" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {searchTerm ? (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-center">No chats match your search</p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <FaComment className="text-5xl mb-3 text-green-600 opacity-50 mx-auto" />
                <p className="text-center">You don't have any conversations yet</p>
                <p className="text-sm text-center mt-2">Customers will reach out to you about your products</p>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredRooms.map((room) => (
              <li 
                key={room.id} 
                className={`hover:bg-gray-50 cursor-pointer ${room.order_status === 'completed' ? 'bg-gray-50' : ''}`}
                onClick={() => openChatRoom(room.room_id)}
              >
                <div className="flex p-4">
                  <div className="relative mr-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                      {(room.customer?.full_name || room.customer_name || room.customer?.username || 'Customer').charAt(0).toUpperCase()}
                    </div>
                    {room.has_unread_farmer && (
                      <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        <span>!</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`text-sm font-medium ${room.order_status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {room.customer?.full_name || room.customer_name || room.customer?.username || 'Customer'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${room.order_status === 'completed' ? 'bg-green-100 text-green-800' : room.order_status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {room.order_status === 'completed' ? 'Completed' : 
                           room.order_status === 'active' ? 'Active' : 'New'}
                        </span>
                        {room.last_message?.timestamp && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(room.last_message.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {room.product && (
                      <p className={`text-xs mb-1 truncate flex items-center ${room.order_status === 'completed' ? 'text-gray-500' : 'text-blue-600'}`}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${room.order_status === 'completed' ? 'bg-gray-500' : 'bg-blue-600'}`}></span>
                        {room.product.productName}
                      </p>
                    )}
                    
                    <div className="flex items-center">
                      <p className={`text-sm truncate ${room.order_status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                        {room.last_message?.message ? (
                          <span>{room.last_message.message}</span>
                        ) : (
                          <span className="italic text-gray-400">Start a conversation</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FarmerChatList;
