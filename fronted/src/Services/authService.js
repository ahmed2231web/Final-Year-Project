import axios from 'axios';

// Base URL for API requests
const API_URL = `${import.meta.env.VITE_BACKEND_DOMAIN}/auth`;

// In-memory storage for user data
let userData = null;

// Initialize tokens from storage (localStorage or sessionStorage)
const getStoredAccessToken = () => {
  // Try to get token from localStorage first, then sessionStorage
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  console.log('Getting stored access token:', token ? 'Token exists' : 'No token');
  return token;
};

const getStoredRefreshToken = () => {
  // Try to get token from localStorage first, then sessionStorage
  const token = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  console.log('Getting stored refresh token:', token ? 'Token exists' : 'No token');
  return token;
};

// Save and retrieve last visited page
const saveLastVisitedPage = (path) => {
  if (path && !path.includes('/login') && !path.includes('/signup')) {
    localStorage.setItem('last_visited_page', path);
    console.log('Saved last visited page:', path);
  }
};

const getLastVisitedPage = () => {
  const page = localStorage.getItem('last_visited_page');
  console.log('Retrieved last visited page:', page);
  return page || '/farmer/dashboard'; // Default to dashboard if no page is saved
};

// Get the appropriate redirect path based on user type
const getRedirectPathForUserType = (userType) => {
  if (userType === 'FARMER') {
    return '/farmer/dashboard';
  } else if (userType === 'CUSTOMER') {
    return '/customer'; // Redirect customers to customer dashboard
  } else {
    return '/';
  }
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
   * Check if the user is authenticated and is a customer
   * @returns {boolean} True if the user is authenticated and is a customer
   */
  checkCustomerAuth: () => {
    const isCustomer = userData && userData.user_type === 'CUSTOMER';
    console.log('Checking customer auth:', isCustomer ? 'Is customer' : 'Not a customer', userData);
    return isCustomer;
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
   * @param {boolean} rememberMe - Whether to remember the user's login
   * @returns {Promise} Promise object that resolves to the response data
   */
  login: async (email, password, rememberMe = false) => {
    try {
      console.log('login: Attempting login for email:', email);
      // First, get the JWT tokens
      const response = await axios.post(`${API_URL}/jwt/create/`, {
        email,
        password
      });
      
      console.log('login: Login successful, storing tokens');
      // Store tokens based on rememberMe preference
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Clear any existing tokens from both storages to avoid conflicts
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      
      // Store tokens in the appropriate storage
      storage.setItem('access_token', response.data.access);
      storage.setItem('refresh_token', response.data.refresh);
      
      // Store rememberMe preference
      localStorage.setItem('remember_me', rememberMe.toString());
      
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
        
        // Store user_id in localStorage - use the correct property name
        localStorage.setItem('user_id', userData.user_id);

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
   * Get the appropriate redirect path after login based on user type
   * @returns {Promise<string>} The path to redirect to
   */
  getRedirectPath: async () => {
    try {
      const userType = await authService.getUserType();
      return getRedirectPathForUserType(userType);
    } catch (error) {
      console.error('Error determining redirect path:', error);
      return '/';
    }
  },

  /**
   * Refresh the access token
   * @returns {Promise} Promise object that resolves to the response data
   */
  refreshToken: async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      console.log('refreshToken: No refresh token available');
      throw new Error('No refresh token available');
    }
    
    try {
      console.log('refreshToken: Attempting to refresh token');
      const response = await axios.post(`${API_URL}/jwt/refresh/`, {
        refresh: refreshToken
      });
      
      console.log('refreshToken: Token refresh successful');
      
      // Determine which storage to use based on remember_me preference
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Store the new access token in the appropriate storage
      storage.setItem('access_token', response.data.access);
      
      return response.data;
    } catch (error) {
      console.error('refreshToken: Token refresh failed', error);
      // Clear tokens on refresh failure from both storages
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      userData = null;
      throw error;
    }
  },

  /**
   * Logout a user
   */
  logout: () => {
    console.log('logout: Removing tokens and user data');
    // Clear tokens from both storages
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    
    // Clear remember_me preference
    localStorage.removeItem('remember_me');
    
    userData = null;
    
    // Dispatch auth state change event
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
   * Save the current page for later restoration
   * @param {string} path - Current path to save
   */
  saveCurrentPage: (path) => {
    saveLastVisitedPage(path);
  },

  /**
   * Get the last visited page
   * @returns {string} The last visited page or default dashboard
   */
  getLastVisitedPage: () => {
    return getLastVisitedPage();
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
            
            // Update the Authorization header with the new token
            const newToken = getStoredAccessToken();
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            
            // Retry the original request
            console.log('Interceptor: Retrying original request with new token');
            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Interceptor: Token refresh failed, redirecting to login', refreshError);
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
  if (authService.isAuthenticated()) {
    console.log('Initializing user data on page load');
    try {
      const userType = await authService.getUserType();
      
      // Redirect based on user type if we're at the root or login page
      if (window.location.pathname === '/' || window.location.pathname === '/login') {
        const redirectPath = getRedirectPathForUserType(userType);
        if (redirectPath !== window.location.pathname) {
          console.log(`Redirecting ${userType} to ${redirectPath}`);
          window.location.href = redirectPath;
        }
      }
      
      // Prevent customers from accessing farmer pages
      if (userType === 'CUSTOMER' && window.location.pathname.startsWith('/farmer')) {
        console.log('Customer attempting to access farmer page, redirecting to home');
        window.location.href = '/';
      }
      
      // Prevent farmers from accessing customer pages
      if (userType === 'FARMER' && window.location.pathname.startsWith('/customer')) {
        console.log('Farmer attempting to access customer page, redirecting to farmer dashboard');
        window.location.href = '/farmer/dashboard';
      }
    } catch (error) {
      console.error('Failed to initialize user data:', error);
    }
  }
};

// Initialize user data
initializeUserData();

// Add cross-tab communication for logout
window.addEventListener('storage', (event) => {
  // If another tab clears the tokens, log out in this tab too
  if (event.key === 'access_token' && !event.newValue) {
    console.log('Token cleared in another tab, logging out in this tab');
    userData = null;
    window.dispatchEvent(new Event('auth-state-change'));
    
    // Redirect to home if not already there
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
});

// Add function to ensure user_id is available
const ensureUserId = async () => {
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    try {
      const userData = await authService.getUserData();
      if (userData) {
        localStorage.setItem('user_id', userData.user_id);
      }
    } catch (error) {
      console.error('Error ensuring user_id:', error);
    }
  }
};

// Call ensureUserId function
ensureUserId();

export default authService;
