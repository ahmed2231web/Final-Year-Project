import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FarmerOrderManagement from '../Components/Farmer/FarmerOrderManagement';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const FarmerOrderManagementPage = () => {
  const { token, isAuthenticated, user, refreshToken } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication status
        if (!isAuthenticated || !token) {
          console.log('User not authenticated, redirecting to login');
          toast.error('You must be logged in to view orders');
          navigate('/login', { state: { from: '/farmer/orders' } });
          return;
        }

        // Check if user is a farmer
        if (user?.user_type !== 'FARMER') {
          console.log('User is not a farmer, redirecting to dashboard');
          toast.error('You do not have permission to access this page');
          navigate('/');
          return;
        }

        // Try to refresh the token to ensure it's valid
        if (refreshToken) {
          try {
            console.log('Attempting to refresh token before loading orders page');
            await refreshToken();
            console.log('Token refreshed successfully');
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            // Continue anyway, the component will handle auth errors
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error in authentication check:', error);
        toast.error('Authentication error. Please try logging in again.');
        navigate('/login', { state: { from: '/farmer/orders' } });
      }
    };

    checkAuth();
  }, [isAuthenticated, token, user, navigate, refreshToken]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-3 text-green-600 font-medium">Loading orders...</p>
      </div>
    );
  }

  return <FarmerOrderManagement />;
};

export default FarmerOrderManagementPage;
