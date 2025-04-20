/**
 * Authentication service for managing user authentication
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_DOMAIN || 'http://localhost:8000';

/**
 * Get the authentication token from localStorage
 * @returns {string|null} - The authentication token or null if not found
 */
export const getAuthToken = () => {
    console.log('Getting stored access token:', localStorage.getItem('access_token') ? 'Token exists' : 'No token');
    return localStorage.getItem('access_token');
};

/**
 * Save the last visited page to localStorage
 * @param {string} path - The path to save
 */
export const saveLastVisitedPage = (path) => {
    console.log('Saved last visited page:', path);
    localStorage.setItem('lastVisitedPage', path);
};

/**
 * Get the last visited page from localStorage
 * @returns {string|null} - The last visited page or null if not found
 */
export const getLastVisitedPage = () => {
    return localStorage.getItem('lastVisitedPage');
};

/**
 * Get the user type from localStorage or API
 * @returns {Promise<Object>} - A promise that resolves to the user type
 */
export const getUserType = async () => {
    // Try to get from localStorage first
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            console.log('getUserType: Using cached user data:', parsedData);
            return parsedData;
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }

    // If not in localStorage, fetch from API
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.get(
            `${API_URL}/auth/user/user-type/`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // Save to localStorage for future use
        localStorage.setItem('userData', JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('Error fetching user type:', error);
        throw error;
    }
};

/**
 * Login user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - A promise that resolves to the user data
 */
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/jwt/create/`, {
            email,
            password
        });

        // Store tokens in localStorage
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Get user data
        const userData = await getUserType();
        
        return userData;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Logout user by removing tokens from localStorage
 */
export const logout = () => {
    // Clear authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userData');
    localStorage.removeItem('user_id');
    localStorage.removeItem('unreadNotificationsCount');
    
    // Clear cart data
    localStorage.removeItem('agroConnectCart');
    
    // Clear any user-specific cart data (in case we have user-specific carts)
    const userId = localStorage.getItem('user_id');
    if (userId) {
        localStorage.removeItem(`agroConnectCart_${userId}`);
    }
};

/**
 * Refresh the authentication token
 * @returns {Promise<Object>} - A promise that resolves to the refreshed token data
 */
export const refreshToken = async () => {
    try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) {
            throw new Error('No refresh token found');
        }

        console.log('Refreshing token...');
        const response = await axios.post(
            `${API_URL}/auth/jwt/refresh/`,
            { refresh }
        );

        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            console.log('Token refreshed successfully');
            return response.data;
        } else {
            throw new Error('No access token in response');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        // If refresh fails, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userData');
        throw error;
    }
};

/**
 * Get the user data from localStorage
 * @returns {Object|null} - The user data or null if not found
 */
export const getUserData = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }
    return null;
};

/**
 * Check if the user is authenticated
 * @returns {boolean} - True if the user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
    console.log('isAuthenticated:', getAuthToken() !== null);
    return getAuthToken() !== null;
};

/**
 * Set up axios interceptors to handle token refresh
 */
export const setupAxiosInterceptors = () => {
    // Request interceptor
    axios.interceptors.request.use(
        config => {
            const token = getAuthToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );

    // Response interceptor
    axios.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config;
            
            // If error is 401 and not already retrying
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
                try {
                    // Try to refresh the token
                    await refreshToken();
                    
                    // Update the authorization header
                    originalRequest.headers['Authorization'] = `Bearer ${getAuthToken()}`;
                    
                    // Retry the original request
                    return axios(originalRequest);
                } catch (refreshError) {
                    // If refresh fails, redirect to login
                    logout();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
            
            return Promise.reject(error);
        }
    );
};

// Initialize interceptors
setupAxiosInterceptors();

/**
 * Get the access token - alias for getAuthToken for compatibility
 * @returns {string|null} - The authentication token or null if not found
 */
export const getAccessToken = () => {
    return getAuthToken();
};

export default {
    getAuthToken,
    getAccessToken,
    getUserData,
    isAuthenticated,
    getUserType,
    refreshToken,
    login,
    logout,
    saveLastVisitedPage,
    getLastVisitedPage,
    setupAxiosInterceptors
};
