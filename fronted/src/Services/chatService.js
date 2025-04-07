/**
 * Chat service for managing WebSocket connections and chat-related functionality
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetches all chat rooms for the current user
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the chat rooms
 */
export const getChatRooms = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/api/chat/rooms/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        throw error;
    }
};

/**
 * Fetches messages for a specific chat room
 * @param {string} roomId - The ID of the chat room
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the messages
 */
export const getChatMessages = async (roomId, token) => {
    try {
        const response = await axios.get(`${API_URL}/api/chat/rooms/${roomId}/messages/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
    }
};

/**
 * Creates a new WebSocket connection for a chat room
 * @param {string} roomId - The ID of the chat room to connect to
 * @param {string} token - The user's authentication token
 * @returns {WebSocket} - The WebSocket connection
 */
export const createChatConnection = (roomId, token) => {
    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = import.meta.env.VITE_WS_HOST || 'localhost:8000';
    const wsUrl = `${wsScheme}://${wsHost}/ws/chat/${roomId}/?token=${token}`;
    
    console.log(`Creating WebSocket connection to: ${wsUrl}`);
    
    try {
        const socket = new WebSocket(wsUrl);
        
        // Add event listeners for debugging
        socket.addEventListener('open', () => {
            console.log(`WebSocket connection established to room ${roomId}`);
        });
        
        socket.addEventListener('error', (error) => {
            console.error(`WebSocket error for room ${roomId}:`, error);
        });
        
        socket.addEventListener('close', (event) => {
            console.log(`WebSocket connection closed for room ${roomId}:`, event.code, event.reason);
        });
        
        return socket;
    } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        throw error;
    }
};

/**
 * Creates a new chat room or returns an existing one
 * @param {Object} roomData - Data for the new chat room
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the created or existing chat room
 */
export const createChatRoom = async (roomData, token) => {
    try {
        console.log('Creating chat room with data:', roomData);
        const response = await axios.post(`${API_URL}/api/chat/rooms/`, roomData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Chat room created/found:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating chat room:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
        }
        throw error;
    }
};

/**
 * Gets the count of unread notifications for the current user
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the count of unread notifications
 */
export const getUnreadNotificationsCount = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/api/chat/notifications/unread-count/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data.count;
    } catch (error) {
        console.error('Error fetching unread notifications count:', error);
        return 0;
    }
};

/**
 * Gets chat rooms with unread messages information
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to an object with roomIds that have unread messages
 */
export const getUnreadChatsInfo = async (token) => {
    try {
        const rooms = await getChatRooms(token);
        const unreadRooms = {};
        
        // For customer: rooms with has_unread_customer = true
        // For farmer: rooms with has_unread_farmer = true
        rooms.forEach(room => {
            if (room.has_unread_customer) {
                unreadRooms[room.room_id] = true;
            }
            if (room.has_unread_farmer) {
                unreadRooms[room.room_id] = true;
            }
        });
        
        return unreadRooms;
    } catch (error) {
        console.error('Error getting unread chats info:', error);
        return {};
    }
};

/**
 * Marks all messages in a chat room as read for the current user
 * @param {string} roomId - The ID of the chat room
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves when the messages are marked as read
 */
export const markChatAsRead = async (roomId, token) => {
    try {
        console.log(`Marking chat room ${roomId} as read`);
        const response = await axios.post(
            `${API_URL}/api/chat/messages/mark_read/`,
            { room_id: roomId },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        console.log('Mark as read response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error marking chat as read:', error);
        throw error;
    }
};

/**
 * Gets detailed information about a specific chat room
 * @param {string} roomId - The ID of the chat room
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the chat room details
 */
export const getChatRoomDetails = async (roomId, token) => {
    try {
        const response = await axios.get(`${API_URL}/api/chat/rooms/${roomId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching chat room details:', error);
        throw error;
    }
};

/**
 * Initialize the global WebSockets registry
 */
if (!window._chatWebSockets) {
  window._chatWebSockets = new Map();
}

/**
 * Register a WebSocket connection with the status service
 * @param {string} roomId - ID of the chat room
 * @param {WebSocket} socket - WebSocket connection
 */
export const registerWebSocket = (roomId, socket) => {
  if (roomId && socket) {
    console.log(`Registering WebSocket for room: ${roomId}`);
    window._chatWebSockets.set(roomId, socket);
    
    // Send initial online status
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        is_online: true
      }));
    }
  }
};

/**
 * Get a WebSocket connection by room ID
 * @param {string} roomId - ID of the chat room
 * @returns {WebSocket|null} - WebSocket connection or null if not found
 */
export const getWebSocket = (roomId) => {
  return window._chatWebSockets.get(roomId) || null;
};

/**
 * Close and unregister all WebSocket connections
 */
export const closeAllWebSockets = () => {
  window._chatWebSockets.forEach((socket) => {
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
  });
  window._chatWebSockets.clear();
};
