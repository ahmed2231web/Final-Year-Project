import axios from 'axios';

// Base URL for API requests
const API_URL = 'http://localhost:8000/auth';

// In-memory storage for user data
let userData = null;

// Initialize tokens from localStorage if available
const getStoredAccessToken = () => {
  const token = localStorage.getItem('access_token');
  console.log('Getting stored access token:', token ? 'Token exists' : 'No token');
  return token;
};

const getStoredRefreshToken = () => {
  const token = localStorage.getItem('refresh_token');
  console.log('Getting stored refresh token:', token ? 'Token exists' : 'No token');
  return token;
};

/**
 * Service for authentication-related API calls
 */
const authService = {
  /**
   * Check if the user is authenticated and is a farmer
   * @returns {boolean} True if the user is authenticated and is a farmer
   */
  checkFarmerAuth: () => {
    const isFarmer = userData && userData.user_type === 'FARMER';
    console.log('Checking farmer auth:', isFarmer ? 'Is farmer' : 'Not a farmer', userData);
    return isFarmer;
  },

  /**
   * Get the user type of the authenticated user
   * @returns {Promise<string|null>} User type or null if not authenticated
   */
  getUserType: async () => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
      console.log('getUserType: No access token available');
      return null;
    }

    if (userData) {
      console.log('getUserType: Using cached user data:', userData);
      return userData.user_type;
    }

    try {
      console.log('getUserType: Fetching user type from API');
      const userResponse = await axios.get(`${API_URL}/user/user-type/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      userData = userResponse.data;
      console.log('getUserType: Received user data:', userData);
      
      // Dispatch auth state change event when user data is fetched
      window.dispatchEvent(new Event('auth-state-change'));
      
      return userData.user_type;
    } catch (error) {
      console.error('Error fetching user type:', error);
      return null;
    }
  },

  /**
   * Get user data
   * @returns {Object|null} User data or null if not authenticated
   */
  getUserData: () => {
    console.log('getUserData:', userData);
    return userData;
  },

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Promise object that resolves to the response data
   */
  login: async (email, password) => {
    try {
      console.log('login: Attempting login for email:', email);
      // First, get the JWT tokens
      const response = await axios.post(`${API_URL}/jwt/create/`, {
        email,
        password
      });
      
      console.log('login: Login successful, storing tokens');
      // Store tokens in localStorage for cross-tab persistence
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Then, get the user data
      try {
        console.log('login: Fetching user data after login');
        const userResponse = await axios.get(`${API_URL}/user/user-type/`, {
          headers: {
            'Authorization': `Bearer ${response.data.access}`
          }
        });
        userData = userResponse.data;
        console.log('login: User data received:', userData);
        
        // Dispatch auth state change event when user data is set
        window.dispatchEvent(new Event('auth-state-change'));
      } catch (userError) {
        console.error('Error fetching user data:', userError);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Refresh the access token
   * @returns {Promise} Promise object that resolves to the response data
   */
  refreshToken: async () => {
    try {
      console.log('refreshToken: Attempting to refresh token');
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        console.log('refreshToken: No refresh token available');
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(`${API_URL}/jwt/refresh/`, {
        refresh: refreshToken
      });
      
      console.log('refreshToken: Token refresh successful');
      localStorage.setItem('access_token', response.data.access);
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout
      authService.logout();
      throw error;
    }
  },

  /**
   * Logout a user
   */
  logout: () => {
    console.log('logout: Removing tokens and user data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    userData = null;
    
    // Dispatch auth state change event when user logs out
    window.dispatchEvent(new Event('auth-state-change'));
  },

  /**
   * Check if the user is authenticated
   * @returns {boolean} True if the user is authenticated, false otherwise
   */
  isAuthenticated: () => {
    const hasToken = !!getStoredAccessToken();
    console.log('isAuthenticated:', hasToken);
    return hasToken;
  },

  /**
   * Get the access token
   * @returns {string|null} The access token or null if not available
   */
  getToken: () => {
    return getStoredAccessToken();
  },

  /**
   * Set up axios interceptors to handle token refresh
   */
  setupAxiosInterceptors: () => {
    // Response interceptor for handling 401 errors
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('Interceptor: 401 error detected, attempting token refresh');
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            await authService.refreshToken();
            
            // Update the authorization header
            originalRequest.headers['Authorization'] = `Bearer ${getStoredAccessToken()}`;
            console.log('Interceptor: Token refreshed, retrying original request');
            
            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Interceptor: Token refresh failed, redirecting to login');
            // If refresh fails, redirect to login
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
};

// Set up axios interceptors
authService.setupAxiosInterceptors();

// Initialize user data on page load if tokens exist
const initializeUserData = async () => {
  console.log('initializeUserData: Checking for tokens on page load');
  if (authService.isAuthenticated()) {
    try {
      console.log('initializeUserData: Found token, fetching user data');
      await authService.getUserType();
      // Note: No need to dispatch event here as getUserType already does it
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  } else {
    console.log('initializeUserData: No token found on page load');
  }
};

// Add cross-tab communication for logout
window.addEventListener('storage', (event) => {
  // If another tab clears the tokens, log out in this tab too
  if (event.key === 'access_token' && !event.newValue) {
    console.log('storage event: Token cleared in another tab, logging out in this tab');
    userData = null;
    window.dispatchEvent(new Event('auth-state-change'));
  }
});

// Run initialization
console.log('authService: Running initialization');
initializeUserData();

export default authService;
