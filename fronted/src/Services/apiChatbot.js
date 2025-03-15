import axios from 'axios';
import authService from './authService';

// API base URL
const API_URL = 'http://localhost:8000/api';

/**
 * Upload an image for disease detection
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} - Response with disease detection and AI analysis
 */
export const uploadImageForDetection = async (imageFile) => {
    try {
        // Create form data for the image upload
        const formData = new FormData();
        formData.append('image', imageFile);

        // Get authentication token
        const token = authService.getToken();
        
        // Make the API request
        const response = await axios.post(`${API_URL}/chatbot/upload/`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            }
        });
        
        console.log('Disease detection response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading image for disease detection:', 
            error.response?.data || error.message || error);
        throw error;
    }
};

/**
 * Send a chat message to continue conversation about a detected disease
 * @param {string} disease - The detected disease name
 * @param {string} query - The user's question about the disease
 * @returns {Promise<Object>} - Response with AI-generated answer
 */
export const sendChatMessage = async (disease, query) => {
    try {
        // Get authentication token
        const token = authService.getToken();
        
        // Make the API request
        const response = await axios.post(`${API_URL}/chatbot/chat/`, 
            { disease, query },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        
        console.log('Chat response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending chat message:', 
            error.response?.data || error.message || error);
        throw error;
    }
};
