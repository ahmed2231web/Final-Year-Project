import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaImage, FaSpinner, FaTimes, FaEllipsisV, FaComment } from 'react-icons/fa';
import authService from '../../../Services/autheServices';
import { getChatMessages, createChatConnection, markChatAsRead, getChatRoomDetails, registerWebSocket } from '../../../Services/chatService';
import { markRoomAsActive, markRoomAsInactive, updateOnlineStatus } from '../../../Services/statusService';
import toast from 'react-hot-toast';

/**
 * CustomerChatRoom Component - Handles chat functionality for customers
 * Features WhatsApp-style message alignment and real-time messaging
 */
function CustomerChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatSocket, setChatSocket] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [farmerTyping, setFarmerTyping] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [farmerOnline, setFarmerOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Get user information
  useEffect(() => {
    const userData = authService.getUserData();
    console.log("Current user data:", userData);
    if (userData?.user_id) {
      setCurrentUserId(userData.user_id);
      console.log("Set current user ID:", userData.user_id);
      
      // Setup online/offline status tracking
      const token = authService.getAccessToken();
      if (token) {
        updateOnlineStatus(true);
      }
    }
  }, []);
  
  // Load chat messages and setup WebSocket connection
  useEffect(() => {
    const loadChatData = async () => {
      if (!roomId) return;
      
      try {
        setLoading(true);
        const token = authService.getAccessToken();
        
        // Load room details
        const roomData = await getChatRoomDetails(roomId, token);
        setRoomDetails(roomData);
        
        // Set initial farmer online status if available
        if (roomData.farmer && roomData.farmer.is_online !== undefined) {
          setFarmerOnline(roomData.farmer.is_online);
        }
        
        // Load messages
        const messagesData = await getChatMessages(roomId, token);
        setMessages(messagesData);
        
        // Mark messages as read - this will clear the red dot notification
        await markChatAsRead(roomId, token);
        
        // Setup WebSocket connection
        setupWebSocketConnection(token);
        
        // Mark room as active
        markRoomAsActive(roomId);
        
        // Trigger a custom event to update unread count in sidebars
        window.dispatchEvent(new CustomEvent('chat-read', { detail: { roomId } }));
      } catch (error) {
        console.error('Error loading chat data:', error);
        toast.error('Failed to load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadChatData();
    
    // Cleanup function
    return () => {
      if (chatSocket) {
        chatSocket.close();
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Mark room as inactive
      markRoomAsInactive(roomId);
    };
  }, [roomId]);
  
  // Setup WebSocket connection
  const setupWebSocketConnection = (token) => {
    const socket = createChatConnection(roomId, token);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      
      // Register this WebSocket for status updates
      registerWebSocket(roomId, socket);
      
      setIsOnline(true);
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      if (data.type === 'message') {
        // New message received
        const newMessage = {
          id: data.message_id,
          message: data.message,
          sender: data.sender_id,
          sender_name: data.sender_name,
          timestamp: data.timestamp,
          image: data.image,
          all_image_urls: data.all_image_urls || []
        };
        
        // Check if message with this ID already exists to avoid duplicates
        setMessages(prevMessages => {
          // More robust check for duplicates
          if (prevMessages.some(msg => msg.id === newMessage.id || 
             (msg.message === newMessage.message && 
              msg.sender === newMessage.sender && 
              Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 1000))) {
            console.log('Duplicate message detected, not adding:', newMessage);
            return prevMessages;
          } else {
            console.log('Adding new message:', newMessage);
            
            // If the message is from the other user and we're not in the active room,
            // trigger an event to update the unread indicator in the sidebar
            if (newMessage.sender !== currentUserId && !document.hasFocus()) {
              window.dispatchEvent(new CustomEvent('new-message', { 
                detail: { roomId } 
              }));
            }
            
            return [...prevMessages, newMessage];
          }
        });
        
        // Mark as read if we're in the chat room
        if (data.sender_id !== currentUserId) {
          markChatAsRead(roomId, token);
        }
      } else if (data.type === 'typing_status') {
        // Typing status update
        if (data.user_id !== currentUserId && roomDetails) {
          setFarmerTyping(data.is_typing);
        }
      } else if (data.type === 'user_status') {
        // User status update (online/offline)
        console.log('User status update:', data);
        if (data.user_id !== currentUserId && roomDetails?.farmer?.user_id === data.user_id) {
          setFarmerOnline(data.is_online);
        }
      } else if (data.is_online !== undefined) {
        // Direct online/offline status update
        if (roomDetails?.farmer?.user_id !== currentUserId) {
          setFarmerOnline(data.is_online);
        }
      }
    };
    
    socket.onclose = (e) => {
      console.log('WebSocket connection closed:', e);
      setIsOnline(false);
      
      // Send offline status before attempting reconnect
      if (e.code !== 1000) {  // Not a normal closure
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (authService.isAuthenticated()) {
            setupWebSocketConnection(authService.getAccessToken());
          }
        }, 3000);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    setChatSocket(socket);
    return socket;
  };
  
  // Scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, farmerTyping]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle typing status
  const handleTyping = () => {
    if (chatSocket?.readyState === WebSocket.OPEN) {
      // Send typing status to WebSocket
      if (!isTyping) {
        setIsTyping(true);
        chatSocket.send(JSON.stringify({
          is_typing: true
        }));
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (chatSocket?.readyState === WebSocket.OPEN) {
          chatSocket.send(JSON.stringify({
            is_typing: false
          }));
        }
      }, 2000);
    }
  };
  
  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      toast.error('You can only select up to 5 images at once');
      return;
    }
    
    setSelectedImages(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };
  
  // Remove selected image
  const removeSelectedImage = (index) => {
    const newSelectedImages = [...selectedImages];
    const newPreviewImages = [...previewImages];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewImages[index]);
    
    newSelectedImages.splice(index, 1);
    newPreviewImages.splice(index, 1);
    
    setSelectedImages(newSelectedImages);
    setPreviewImages(newPreviewImages);
  };
  
  // Send message
  const sendMessage = async () => {
    if ((!message.trim() && selectedImages.length === 0) || !chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      setSending(true);
      
      // Prepare images data
      const imagesData = [];
      if (selectedImages.length > 0) {
        for (const file of selectedImages) {
          const reader = new FileReader();
          const imageData = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
          });
          imagesData.push(imageData);
        }
      }
      
      // Send message via WebSocket
      chatSocket.send(JSON.stringify({
        message: message.trim(),
        images: imagesData
      }));
      
      // Clear input fields
      setMessage('');
      setSelectedImages([]);
      setPreviewImages([]);
      
      // Clear typing status
      if (isTyping) {
        setIsTyping(false);
        chatSocket.send(JSON.stringify({
          is_typing: false
        }));
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Show image preview modal
  const openImagePreview = (imageUrl) => {
    setSelectedPreviewImage(imageUrl);
    setShowImagePreview(true);
  };
  
  // Go back to chat list
  const goBack = () => {
    navigate('/customer/chat');
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 -ml-4 md:-ml-6 -mt-4 md:-mt-6">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <button onClick={goBack} className="mr-4 text-white hover:bg-green-700 p-2 rounded-full transition-colors">
            <FaArrowLeft size={18} />
          </button>
          {roomDetails ? (
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-lg mr-3">
                  {(roomDetails.farmer_detail?.full_name || roomDetails.farmer_detail?.username || roomDetails.farmer?.full_name || roomDetails.farmer_name || 'Farmer').charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-green-600"></div>
              </div>
              <div>
                <div className="font-medium text-lg">
                  {roomDetails.farmer_detail?.full_name || 
                   roomDetails.farmer_detail?.username || 
                   roomDetails.farmer?.full_name || 
                   roomDetails.farmer_name || 
                   'Farmer'}
                </div>
                {roomDetails.product && (
                  <div className="text-xs text-green-200">Product: {roomDetails.product.productName}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-700 rounded-full mr-3 animate-pulse"></div>
              <div>
                <div className="h-5 w-32 bg-green-700 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-24 bg-green-700 rounded animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
        <div>
          <button className="p-2 hover:bg-green-700 rounded-full transition-colors">
            <FaEllipsisV size={16} />
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#e5ded8]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-green-600 text-3xl" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FaComment className="text-green-600 text-2xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-green-700 text-center mb-2">Start a Conversation</h3>
              <p className="text-center mb-4">This is the beginning of your conversation with {roomDetails?.farmer_detail?.full_name || roomDetails?.farmer?.full_name || 'the farmer'}.</p>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">💡 <strong>Tip:</strong> Ask specific questions about the product to get the information you need!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              // Check if the current user is the sender
              const isCurrentUser = msg.sender === currentUserId;
              
              // Format the message display name properly
              const displayName = isCurrentUser ? 'You' : (msg.sender_name || 'Farmer');
              
              return (
                <div 
                  key={msg.id || `msg-${index}`} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] break-words ${
                      isCurrentUser 
                        ? 'bg-[#dcf8c6] rounded-tl-lg rounded-bl-lg rounded-br-lg' 
                        : 'bg-white rounded-tr-lg rounded-bl-lg rounded-br-lg'
                    } p-3 shadow-sm relative`}
                  >
                    {/* Sender name for incoming messages */}
                    {!isCurrentUser && (
                      <div className="text-xs text-blue-600 font-medium mb-1">
                        {displayName}
                      </div>
                    )}
                    
                    {/* Message text */}
                    {msg.message && (
                      <div className="whitespace-pre-wrap mb-2">{msg.message}</div>
                    )}
                    
                    {/* Single image */}
                    {msg.image && (
                      <div className="mt-2" onClick={() => openImagePreview(msg.image)}>
                        <img 
                          src={msg.image} 
                          alt="Attached" 
                          className="rounded-md cursor-pointer max-h-60 max-w-full"
                        />
                      </div>
                    )}
                    
                    {/* Multiple images */}
                    {msg.all_image_urls && msg.all_image_urls.length > 0 && (
                      <div className={`grid gap-1 mt-2 ${
                        msg.all_image_urls.length === 1 ? '' :
                        msg.all_image_urls.length === 2 ? 'grid-cols-2' :
                        msg.all_image_urls.length >= 3 ? 'grid-cols-3' : ''
                      }`}>
                        {msg.all_image_urls.map((img, i) => (
                          <div 
                            key={`img-${i}-${msg.id || index}`}
                            className="relative"
                            onClick={() => openImagePreview(img)}
                          >
                            <img 
                              src={img} 
                              alt={`Attached ${i+1}`} 
                              className="rounded-md cursor-pointer h-24 w-24 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {farmerTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-2 rounded-lg max-w-[75%]">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Selected Images Preview */}
      {previewImages.length > 0 && (
        <div className="bg-white p-2 flex space-x-2 overflow-x-auto">
          {previewImages.map((preview, index) => (
            <div key={index} className="relative">
              <img 
                src={preview} 
                alt={`Selected ${index+1}`} 
                className="h-16 w-16 object-cover rounded"
              />
              <button 
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                onClick={() => removeSelectedImage(index)}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Message Input */}
      <div className="bg-white p-3 border-t border-gray-200">
        <div className="flex items-center">
          <button 
            className="text-gray-600 mr-3"
            onClick={() => fileInputRef.current.click()}
          >
            <FaImage size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageSelect}
          />
          <textarea
            className="flex-1 border border-gray-300 rounded-full py-2 px-4 resize-none h-10 max-h-24 overflow-auto"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyPress}
            disabled={sending}
            rows={1}
            style={{lineHeight: '1.5', paddingTop: '6px'}}
          />
          <button 
            className={`ml-3 bg-green-600 text-white rounded-full p-2 ${
              (!message.trim() && selectedImages.length === 0) || sending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={sendMessage}
            disabled={(!message.trim() && selectedImages.length === 0) || sending}
          >
            {sending ? (
              <FaSpinner className="animate-spin" size={18} />
            ) : (
              <FaPaperPlane size={18} />
            )}
          </button>
        </div>
      </div>
      
      {/* Image Preview Modal */}
      {showImagePreview && selectedPreviewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="max-w-3xl max-h-[90vh]">
            <img 
              src={selectedPreviewImage} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerChatRoom;
