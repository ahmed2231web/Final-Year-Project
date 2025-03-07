import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../Services/authService';

/**
 * ProtectedRoute component for farmer routes
 * Checks if the user is authenticated and is a farmer
 * Redirects to login page if not authenticated or not a farmer
 */
const ProtectedFarmerRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // First check if we have a token
    console.log('ProtectedFarmerRoute: Checking authentication');
    console.log('Current path:', location.pathname);
    console.log('Has token:', authService.isAuthenticated());
    
    if (!authService.isAuthenticated()) {
      console.log('No token found, redirecting to login');
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        // Get user type and check if the user is a farmer
        const userType = await authService.getUserType();
        console.log('User type:', userType);
        setIsAuthenticated(userType === 'FARMER');
        console.log('Is authenticated as farmer:', userType === 'FARMER');
      } catch (error) {
        console.error('Authentication check failed:', error);
        // If the token is invalid or expired, try to refresh
        if (error.response?.status === 401) {
          try {
            await authService.refreshToken();
            // Try again after refresh
            const userType = await authService.getUserType();
            setIsAuthenticated(userType === 'FARMER');
            console.log('After token refresh - User type:', userType);
            console.log('After token refresh - Is authenticated as farmer:', userType === 'FARMER');
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            setIsAuthenticated(false);
            // Clear tokens if refresh fails
            authService.logout();
          }
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-check when path changes

  if (isLoading) {
    // Show loading state while checking authentication
    console.log('Still loading authentication status');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page with the return URL
  if (!isAuthenticated) {
    console.log('Not authenticated as farmer, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated and is a farmer, render the children
  console.log('Authenticated as farmer, rendering farmer layout');
  return children;
};

export default ProtectedFarmerRoute;
