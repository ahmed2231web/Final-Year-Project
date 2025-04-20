// src/Components/Farmer/FarmerOrderManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaShippingFast } from 'react-icons/fa';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { getUserOrders, shipOrder } from '../../Services/orderService'; // Ensure this path matches your directory structure
import toast from 'react-hot-toast';

const FarmerOrderManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Fetching orders with token:', token ? 'Token exists' : 'No token');
        
        // Validate token
        if (!token || typeof token !== 'string' || token.length < 10) {
          console.error('Invalid token format:', token);
          setError('Authentication error. Please log in again.');
          setLoading(false);
          return;
        }

        // Manually check localStorage as a fallback
        const localToken = localStorage.getItem('token');
        if (!localToken && token) {
          console.log('Token not found in localStorage but exists in context, using context token');
        } else if (localToken && !token) {
          console.log('Using token from localStorage as fallback');
          // We won't use this directly but it's good for debugging
        }
        
        // Make the API call
        console.log('Making API call to fetch orders...');
        const data = await getUserOrders(token);
        console.log('Orders API response:', data);
        
        if (Array.isArray(data)) {
          console.log(`Successfully fetched ${data.length} orders`);
          setOrders(data);
        } else {
          console.warn('API returned non-array data:', data);
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        console.error('Error response:', err.response?.status, err.response?.data);
        
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view these orders.');
        } else if (err.response?.status === 404) {
          setError('The orders endpoint could not be found. Please contact support.');
        } else {
          setError('Failed to load orders. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      console.warn('No authentication token found in context');
      // Check if token exists in localStorage as a fallback
      const localToken = localStorage.getItem('token');
      if (localToken) {
        console.log('Found token in localStorage, attempting to use it');
        // We could use this token directly, but it's better to handle this at the page level
        // by redirecting to login if the auth context isn't properly initialized
      }
      setError('You must be logged in to view orders.');
      setLoading(false);
    }
  }, [token]);

  // Handle shipping an order
  const handleShipOrder = async (orderId) => {
    try {
      console.log('Shipping order:', orderId, 'with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        return;
      }
      
      const updatedOrder = await shipOrder(orderId, token);
      console.log('Order shipped successfully:', updatedOrder);
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: updatedOrder.status } : order
        )
      );
      toast.success('Order marked as shipped!');
    } catch (err) {
      console.error('Error shipping order:', err);
      console.error('Error details:', err.response?.data || 'No response data');
      
      if (err.response?.status === 401) {
        toast.error('Authentication error. Please log in again.');
      } else if (err.response?.status === 404) {
        toast.error('Order not found. It may have been deleted or moved.');
      } else {
        toast.error('Failed to ship order. Please try again.');
      }
    }
  };

  // Navigate to chat room
  const handleOrderClick = (roomId) => {
    navigate(`/farmer/chat/${roomId}`);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Map order status to styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-indigo-100 text-indigo-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status text
  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You don't have any orders yet.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* Table for medium and larger screens */}
          <div className="hidden sm:block">
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="border-b bg-gray-100 text-gray-700">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Quantity</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-700 font-medium">
                      #{order.id}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{order.customer_name}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.items.map((item) => item.product_name).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">
                      {order.items.reduce((total, item) => total + item.quantity, 0)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleOrderClick(order.id)}
                          className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                          title="View order details"
                        >
                          <FaEye size={14} />
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleShipOrder(order.id)}
                            className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                            title="Ship order"
                          >
                            <FaShippingFast size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card layout for small screens */}
          <div className="sm:hidden space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-50 p-3 rounded-lg shadow-sm hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-700">
                    #{order.id}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="flex justify-end mb-2 space-x-2">
                  <button
                    onClick={() => handleOrderClick(order.id)}
                    className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                    title="View order details"
                  >
                    <FaEye size={14} />
                  </button>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleShipOrder(order.id)}
                      className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      title="Ship order"
                    >
                      <FaShippingFast size={14} />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Customer:</span> {order.customer_name}
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Product:</span>{' '}
                  {order.items.map((item) => item.product_name).join(', ')}
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Quantity:</span>{' '}
                  {order.items.reduce((total, item) => total + item.quantity, 0)}
                </div>
                <div className="text-xs font-semibold text-gray-800">
                  <span className="font-medium">Date:</span> {formatDate(order.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrderManagement;