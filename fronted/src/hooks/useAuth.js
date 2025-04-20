import { useState, useEffect } from 'react';
import authService from '../Services/authService';

/**
 * Custom hook for authentication
 * Provides authentication state and methods
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is authenticated
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          // Get current token
          const currentToken = authService.getToken();
          setToken(currentToken);

          // Get user type and ID
          const userData = await authService.getUserType();
          if (userData) {
            setUserType(userData.user_type);
            setUserId(userData.user_id);
          }
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      setIsAuthenticated(true);
      setToken(result.token);
      
      // Get user type after login
      const userData = await authService.getUserType();
      if (userData) {
        setUserType(userData.user_type);
        setUserId(userData.user_id);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.'
      };
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setToken('');
    setUserType(null);
    setUserId(null);
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const newToken = await authService.refreshToken();
      if (newToken) {
        setToken(newToken);
        setIsAuthenticated(true);
        return newToken;
      } else {
        setIsAuthenticated(false);
        setToken('');
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      setIsAuthenticated(false);
      setToken('');
      return null;
    }
  };

  return {
    isAuthenticated,
    token,
    userType,
    userId,
    loading,
    login,
    logout,
    refreshToken
  };
};

export default useAuth;
