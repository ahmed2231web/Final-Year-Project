/**
 * Status service for managing online/offline status and active chat rooms
 */

// Track active chat rooms to detect when users are in a specific chat
const activeRooms = new Set();

/**
 * Mark a room as active (user is currently in the chat room)
 * @param {string} roomId - ID of the chat room
 */
export const markRoomAsActive = (roomId) => {
    if (roomId) {
        activeRooms.add(roomId);
        console.log('Room marked as active:', roomId);
    }
};

/**
 * Mark a room as inactive (user left the chat room)
 * @param {string} roomId - ID of the chat room
 */
export const markRoomAsInactive = (roomId) => {
    if (roomId) {
        activeRooms.delete(roomId);
        console.log('Room marked as inactive:', roomId);
    }
};

/**
 * Check if a room is active
 * @param {string} roomId - ID of the chat room
 * @returns {boolean} - Whether the room is active
 */
export const isRoomActive = (roomId) => {
    return activeRooms.has(roomId);
};

/**
 * Get access to the globally registered WebSockets
 * @returns {Map} - Map of roomId -> WebSocket
 */
const getActiveWebSockets = () => {
    if (!window._chatWebSockets) {
        window._chatWebSockets = new Map();
    }
    return window._chatWebSockets;
};

/**
 * Update user's online status via WebSocket
 * @param {boolean} isOnline - Whether the user is online
 */
export const updateOnlineStatus = async (isOnline) => {
    try {
        // Send status update to all active WebSockets
        const webSockets = getActiveWebSockets();
        webSockets.forEach((socket, roomId) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    is_online: isOnline
                }));
                console.log(`Sent online status (${isOnline}) to room: ${roomId}`);
            }
        });
        return true;
    } catch (error) {
        console.error('Failed to update online status:', error);
        return false;
    }
};

/**
 * Setup event listeners for page visibility and beforeunload
 * to automatically update online status
 */
export const setupStatusTracking = () => {
    // Update status when page becomes visible/invisible
    document.addEventListener('visibilitychange', () => {
        const isOnline = document.visibilityState === 'visible';
        updateOnlineStatus(isOnline);
    });
    
    // Update status when page is about to unload
    window.addEventListener('beforeunload', () => {
        updateOnlineStatus(false);
    });
    
    // Set initial status as online
    updateOnlineStatus(true);
};
