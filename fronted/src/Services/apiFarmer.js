import axios from 'axios';
import { API_URL } from '../config';
import authService from './authService';

/**
 * Get dashboard data for the farmer
 * @returns {Promise} Dashboard data including stats and recent orders
 */
export const getFarmerDashboardData = async () => {
  try {
    // Get the authentication token
    const token = authService.getToken();
    console.log('Token retrieved for dashboard API call:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication token not found');
    }
    
    // Check if user is authenticated
    const isAuth = authService.isAuthenticated();
    console.log('User is authenticated:', isAuth);
    
    // Check user type
    const userType = await authService.getUserType();
    console.log('User type:', userType);
    
    // Make the API request with the token
    console.log(`Making request to ${API_URL}/api/orders/farmer/dashboard-data/ with token`);
    const response = await axios.get(`${API_URL}/api/orders/farmer/dashboard-data/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Dashboard API response received:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error fetching farmer dashboard data:', error);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
    throw error;
  }
};
