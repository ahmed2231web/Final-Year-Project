/**
 * Order service for managing order status and related functionality
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Updates the status of an order
 * @param {string} roomId - The ID of the chat room (order)
 * @param {string} status - The new status (new, active, completed)
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the updated order
 */
export const updateOrderStatus = async (roomId, status, token) => {
    try {
        console.log(`Updating order status for room ${roomId} to ${status}`);
        const response = await axios.post(
            `${API_URL}/api/chat/rooms/${roomId}/update_order_status/`,
            { status },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        console.log('Order status updated:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};
