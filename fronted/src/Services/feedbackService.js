/**
 * Feedback service for managing product feedback and responses
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_DOMAIN || 'http://localhost:8000';

/**
 * Submits feedback for a completed order
 * @param {Object} feedbackData - The feedback data
 * @param {string} feedbackData.order_id - ID of the completed order
 * @param {number} feedbackData.rating - Rating (1-5)
 * @param {string} feedbackData.comment - Optional comment
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the created feedback
 */
export const submitFeedback = async (feedbackData, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/reviews/feedback/`,
            feedbackData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error submitting feedback:', error);
        throw error;
    }
};

/**
 * Responds to feedback (farmer action)
 * @param {string} feedbackId - ID of the feedback to respond to
 * @param {string} responseText - The response text
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the created response
 */
export const respondToFeedback = async (feedbackId, responseText, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/reviews/feedback/${feedbackId}/respond/`,
            { response: responseText },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error responding to feedback:', error);
        throw error;
    }
};

/**
 * Gets feedback for a specific product
 * @param {string} productId - ID of the product
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to an array of feedback
 */
export const getProductFeedback = async (productId, token) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/reviews/feedback/?product=${productId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching product feedback:', error);
        throw error;
    }
};

/**
 * Gets feedback for a specific farmer
 * @param {string} farmerId - ID of the farmer
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to an array of feedback
 */
export const getFarmerFeedback = async (farmerId, token) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/reviews/feedback/?farmer=${farmerId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching farmer feedback:', error);
        throw error;
    }
};
