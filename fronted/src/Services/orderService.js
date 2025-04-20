/**
 * Order service for managing orders, payments, and related functionality
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_DOMAIN || 'http://localhost:8000';

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

/**
 * Creates a payment intent for a new order
 * @param {Object} orderData - Data for the new order
 * @param {string} orderData.farmer_id - ID of the farmer selling the product
 * @param {string|number} orderData.product_id - ID of the product being ordered
 * @param {number} orderData.quantity - Quantity of the product
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the payment intent data
 */
export const createPaymentIntent = async (orderData, token) => {
    try {
        console.log('Creating payment intent with data:', JSON.stringify(orderData, null, 2));
        
        // Validate required fields
        if (!orderData.farmer_id) {
            throw new Error('Missing farmer_id in order data');
        }
        if (!orderData.product_id) {
            throw new Error('Missing product_id in order data');
        }
        if (!orderData.quantity) {
            throw new Error('Missing quantity in order data');
        }
        
        // Ensure product_id and quantity are in the correct format
        const paymentData = {
            product_id: orderData.product_id,
            quantity: parseInt(orderData.quantity, 10),
            farmer_id: orderData.farmer_id
        };
        
        console.log('Sending payment data to backend:', paymentData);
        
        // The correct URL format based on the backend URL configuration
        // The router.register(r'orders', OrderViewSet) creates a URL pattern with 'orders' prefix
        const response = await axios.post(
            `${API_URL}/api/orders/orders/create-payment-intent/`,
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Payment intent created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        console.error('Error details:', error.response?.data || 'No response data');
        throw error;
    }
};

/**
 * Marks an order as shipped (farmer action)
 * @param {string} orderId - ID of the order to mark as shipped
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the updated order
 */
export const shipOrder = async (orderId, token) => {
    // Extract numeric Order PK from chat-room ID 'order_<id>_...'
    let targetId = orderId;
    if (typeof orderId === 'string' && orderId.startsWith('order_')) {
        const parts = orderId.split('_');
        if (parts.length >= 2) targetId = parts[1];
    }
    if (!targetId) throw new Error('Order ID is required');
    if (!token) throw new Error('Authentication token is required');
    const url = `${API_URL}/api/orders/orders/${targetId}/ship/`;
    try {
        const response = await axios.post(
            url,
            {},
            { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
        );
        console.log('Order shipped:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error shipping order at', url, error.response?.status, error.response?.data);
        throw error;
    }
};

/**
 * Confirms receipt of an order (customer action)
 * @param {string} orderId - ID of the order to confirm receipt
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the updated order
 */
export const confirmOrderReceipt = async (orderId, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/orders/orders/${orderId}/confirm-receipt/`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error confirming order receipt:', error);
        throw error;
    }
};

/**
 * Confirms payment for an order (customer action)
 * @param {string} orderId - ID of the order to confirm payment
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the updated order
 */
export const confirmOrderPayment = async (orderId, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/orders/orders/${orderId}/confirm-payment/`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error confirming order payment:', error);
        throw error;
    }
};

/**
 * Fetches an order by ID
 * @param {string} orderId - ID of the order to fetch
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the order data
 */
export const getOrderById = async (orderId, token) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/orders/orders/${orderId}/`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

/**
 * Fetches all orders for the current user
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to an array of orders
 */
export const getUserOrders = async (token) => {
    try {
        if (!token) {
            console.error('getUserOrders called without a token');
            throw new Error('Authentication token is required');
        }

        console.log('Fetching user orders from:', `${API_URL}/api/orders/orders/`);
        
        // Add timeout and retry logic for better reliability
        const response = await axios.get(
            `${API_URL}/api/orders/orders/`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );
        
        console.log('Orders API response status:', response.status);
        console.log('Orders API response headers:', response.headers);
        
        // Check if response data is valid
        if (!response.data) {
            console.warn('No data received from server');
            return [];
        }
        
        // Return empty array if data is not in expected format
        if (!Array.isArray(response.data)) {
            console.warn('Expected array of orders but received:', typeof response.data);
            console.log('Response data preview:', JSON.stringify(response.data).substring(0, 200));
            
            // If it's an object with a results property that is an array, return that
            if (response.data && typeof response.data === 'object' && Array.isArray(response.data.results)) {
                console.log('Found results array in response object');
                return response.data.results;
            }
            
            return [];
        }
        
        console.log(`Successfully fetched ${response.data.length} orders`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        console.error('Error details:', error.response?.status, error.response?.data);
        
        // For certain error types, we should throw to allow proper handling upstream
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw error; // Authentication errors should be handled by the calling component
        }
        
        // For other errors, return empty array to prevent UI crashes
        return [];
    }
};
