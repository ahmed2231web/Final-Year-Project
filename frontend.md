# AgroConnect Order Notification System Implementation Guide

This document provides a comprehensive guide for implementing the order notification and status indicator system in the AgroConnect application. It analyzes both the backend and frontend code to explain how to integrate the new features.

## Table of Contents
1. [Backend Implementation Overview](#backend-implementation-overview)
2. [Frontend Implementation Tasks](#frontend-implementation-tasks)
3. [Integration Steps](#integration-steps)
4. [Testing Checklist](#testing-checklist)
5. [Best Practices](#best-practices)

## Backend Implementation Overview

The backend has been updated with the following features to support order notifications:

### 1. Model Changes

- **OrderStatus Model**: Defines the possible order statuses (NEW, ACTIVE, COMPLETED)
- **ChatRoom Model Updates**: Added fields for tracking order status, new order indicators, and timestamps

```python
class OrderStatus(models.TextChoices):
    NEW = 'new', 'New Order'
    ACTIVE = 'active', 'Active Order'
    COMPLETED = 'completed', 'Completed Order'

# Added to ChatRoom model:
order_status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.NEW)
is_new_order = models.BooleanField(default=True)  # For blinking indicator
order_timestamp = models.DateTimeField(auto_now_add=True)
```

### 2. API Endpoints

- **`/api/chat/rooms/farmer_orders/`**: GET endpoint to retrieve all orders for a farmer, sorted by status and recency
- **`/api/chat/rooms/{room_id}/update_order_status/`**: POST endpoint to update the status of an order

### 3. WebSocket Events

- **Order Status Updates**: The WebSocket consumer sends real-time updates when order status changes
- **Automatic Order Detection**: The backend automatically detects post-checkout messages and marks rooms as new orders

## Frontend Implementation Tasks

Based on analysis of both the backend and frontend code, here are the tasks needed to implement the order notification system:

### 1. Update Chat Service

First, add new functions to the `chatService.js` file:

```javascript
/**
 * Fetches all orders for the current farmer
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the farmer's orders
 */
export const getFarmerOrders = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/api/chat/rooms/farmer_orders/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching farmer orders:', error);
        throw error;
    }
};

/**
 * Updates the status of an order
 * @param {string} roomId - The ID of the chat room
 * @param {string} status - The new status ('new', 'active', or 'completed')
 * @param {string} token - The user's authentication token
 * @returns {Promise} - A promise that resolves to the updated chat room
 */
export const updateOrderStatus = async (roomId, status, token) => {
    try {
        const response = await axios.post(`${API_URL}/api/chat/rooms/${roomId}/update_order_status/`, 
            { status }, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

/**
 * Updates order status via WebSocket
 * @param {WebSocket} socket - The WebSocket connection
 * @param {string} status - The new status ('new', 'active', or 'completed')
 */
export const sendOrderStatusUpdate = (socket, status) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            order_status: status
        }));
    } else {
        console.error('WebSocket not connected, cannot send order status update');
    }
};
```

### 2. Create FarmerOrderList Component

Create a new component at `/src/Features/Farmer/Dashboard/FarmerOrderList.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFarmerOrders, updateOrderStatus, sendOrderStatusUpdate } from '../../../services/chatService';
import { getAuthToken } from '../../../services/authService';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaCheckCircle, FaShoppingCart } from 'react-icons/fa';

const FarmerOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
    
    // Set up interval to refresh orders every minute
    const intervalId = setInterval(loadOrders, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const data = await getFarmerOrders(token);
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders. Please try again.');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const token = getAuthToken();
      await updateOrderStatus(roomId, newStatus, token);
      toast.success(`Order status updated to ${newStatus}`);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.room_id === roomId 
            ? { ...order, order_status: newStatus, is_new_order: newStatus === 'new' } 
            : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'new': return <FaShoppingCart className="text-yellow-500" />;
      case 'active': return <FaSpinner className="text-blue-500" />;
      case 'completed': return <FaCheckCircle className="text-green-500" />;
      default: return <FaShoppingCart className="text-gray-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'new': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <FaSpinner className="animate-spin text-3xl text-green-500" />
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={loadOrders}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">My Orders</h2>
        <button 
          onClick={loadOrders}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
        >
          <FaSpinner className={loading ? "animate-spin mr-2" : "hidden"} />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No orders found. When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div 
              key={order.id} 
              className={`border rounded-lg p-4 transition-all ${
                order.is_new_order ? 'new-order-blink' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-800">
                      Order from {order.customer_detail.full_name}
                    </h3>
                    <span className="ml-2 text-sm text-gray-500">
                      {order.time_since_order}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">
                    Product: {order.product_detail.productName}
                  </p>
                  <p className="text-gray-600">
                    Quantity: {order.quantity}
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass(order.order_status)} flex items-center`}>
                    {getStatusIcon(order.order_status)}
                    <span className="ml-1 capitalize">{order.order_status}</span>
                  </span>
                  
                  <div className="mt-4 flex space-x-2">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.room_id, e.target.value)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      <option value="new">New Order</option>
                      <option value="active">Active Order</option>
                      <option value="completed">Completed Order</option>
                    </select>
                    
                    <button
                      onClick={() => navigate(`/farmer/chat/${order.room_id}`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      View Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrderList;
```

### 3. Update Farmer Dashboard

Modify the Dashboard.jsx file to use the real order data:

```jsx
import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaCheckCircle, FaSpinner, FaUndo } from 'react-icons/fa';
import StatCard from "./StatCard";
import FarmerOrderList from './FarmerOrderList';
import { getFarmerOrders } from '../../../services/chatService';
import { getAuthToken } from '../../../services/authService';

export default function Dashboard() {
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    new: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderStats();
  }, []);

  const loadOrderStats = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const orders = await getFarmerOrders(token);
      
      // Calculate stats
      const stats = {
        total: orders.length,
        completed: orders.filter(order => order.order_status === 'completed').length,
        active: orders.filter(order => order.order_status === 'active').length,
        new: orders.filter(order => order.order_status === 'new').length
      };
      
      setOrderStats(stats);
    } catch (error) {
      console.error('Error loading order stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      title: 'Total Orders',
      value: loading ? '...' : orderStats.total.toString(),
      icon: FaShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Completed Orders',
      value: loading ? '...' : orderStats.completed.toString(),
      icon: FaCheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Active Orders',
      value: loading ? '...' : orderStats.active.toString(),
      icon: FaSpinner,
      color: 'bg-yellow-500'
    },
    {
      title: 'New Orders',
      value: loading ? '...' : orderStats.new.toString(),
      icon: FaUndo,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Farmer Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Orders */}
        <div className="mt-8">
          <FarmerOrderList onOrdersLoaded={loadOrderStats} />
        </div>
      </div>
    </div>
  );
}
```

### 4. Add CSS for Order Status and Blinking Indicator

Create a new CSS file at `/src/Features/Farmer/Dashboard/OrderStyles.css`:

```css
/* Order status colors */
.status-new {
  background-color: #ffeeba;
  border-left: 4px solid #ffc107;
}

.status-active {
  background-color: #d4edda;
  border-left: 4px solid #28a745;
}

.status-completed {
  background-color: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

/* Blinking indicator for new orders */
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.new-order-blink {
  animation: blink 1s linear infinite;
  position: relative;
}

.new-order-blink::before {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  background-color: #ff4d4f;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 10px;
}
```

Import this CSS in the FarmerOrderList component:

```jsx
import './OrderStyles.css';
```

### 5. Update ChatRoom Component to Handle Order Status

Update the WebSocket message handler in the Farmer's ChatRoom.jsx to handle order status updates:

```jsx
// In the WebSocket onmessage handler
newSocket.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log('WebSocket message received:', data);
  setIsConnected(true);
  
  // Handle user status updates
  if (data.type === 'user_status') {
    // Existing code...
    return;
  }
  
  // Handle typing status
  if (data.type === 'typing_status') {
    // Existing code...
    return;
  }
  
  // Handle order status updates
  if (data.type === 'order_status_update') {
    console.log('Order status update received:', data);
    
    // Update room details with new status
    setRoomDetails(prev => ({
      ...prev,
      order_status: data.status,
      is_new_order: data.status === 'new'
    }));
    
    // Show notification
    toast.success(`Order status updated to: ${data.status}`);
    return;
  }
  
  // Handle messages
  if (data.type === 'message') {
    // Existing code...
  }
};
```

### 6. Add Order Status Component to ChatRoom

Create a new component at `/src/Features/Farmer/Chat/OrderStatusIndicator.jsx`:

```jsx
import React from 'react';
import { sendOrderStatusUpdate } from '../../../services/chatService';
import { toast } from 'react-hot-toast';
import { FaShoppingCart, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const OrderStatusIndicator = ({ roomId, status, isFarmer, socket }) => {
  const handleStatusChange = (newStatus) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendOrderStatusUpdate(socket, newStatus);
      toast.success(`Updating order status to ${newStatus}...`);
    } else {
      toast.error('Cannot update status: WebSocket connection is closed');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'New Order';
      case 'active': return 'Active Order';
      case 'completed': return 'Completed Order';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'new': return <FaShoppingCart className="text-yellow-500" />;
      case 'active': return <FaSpinner className="text-blue-500" />;
      case 'completed': return <FaCheckCircle className="text-green-500" />;
      default: return <FaShoppingCart className="text-gray-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'new': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="order-status-indicator mb-4">
      <div className={`flex items-center px-4 py-2 rounded-lg border ${getStatusClass(status)}`}>
        {getStatusIcon(status)}
        <span className="ml-2 font-medium">{getStatusLabel(status)}</span>
      </div>
      
      {isFarmer && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Update Order Status:
          </label>
          <select 
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="new">New Order</option>
            <option value="active">Active Order</option>
            <option value="completed">Completed Order</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default OrderStatusIndicator;
```

Then integrate this component into the ChatRoom.jsx:

```jsx
// Import the component
import OrderStatusIndicator from './OrderStatusIndicator';

// Add inside the ChatRoom component's return statement, before the messages list
{roomDetails && (
  <OrderStatusIndicator 
    roomId={roomId}
    status={roomDetails.order_status}
    isFarmer={userData?.user_type === 'farmer'}
    socket={socket}
  />
)}
```

## Integration Steps

Follow these steps to integrate the order notification system:

1. **Update Backend Models**:
   - Ensure the backend models have been updated with the OrderStatus model and ChatRoom model changes
   - Run migrations to apply the changes to the database

2. **Update API Endpoints**:
   - Implement the farmer_orders and update_order_status endpoints in the backend

3. **Update WebSocket Consumer**:
   - Implement the order status update handling in the WebSocket consumer

4. **Frontend Implementation**:
   - Add the new functions to chatService.js
   - Create the FarmerOrderList component
   - Update the Dashboard component
   - Add the CSS for order status styling
   - Update the ChatRoom component to handle order status updates
   - Add the OrderStatusIndicator component to the ChatRoom

5. **Testing**:
   - Test the order notification system with real orders
   - Verify that the blinking indicator works for new orders
   - Test changing order status from NEW to ACTIVE to COMPLETED
   - Verify that WebSocket notifications work when order status changes

## Testing Checklist

- [ ] Verify that new orders appear at the top of the farmer's order list
- [ ] Confirm that the blinking indicator works for new orders
- [ ] Test changing order status from NEW to ACTIVE to COMPLETED
- [ ] Verify that WebSocket notifications work when order status changes
- [ ] Test that the time since order was placed displays correctly
- [ ] Verify that orders are properly sorted by status, newness, and recency
- [ ] Test the integration between the order list and chat functionality
- [ ] Verify that order statistics are correctly displayed on the dashboard
- [ ] Test the real-time updates when order status changes

## Best Practices

1. **Error Handling**: Implement proper error handling for all API calls and WebSocket operations
2. **Loading States**: Show loading indicators during API calls to improve user experience
3. **Responsive Design**: Ensure the order list and status indicators work well on all device sizes
4. **Accessibility**: Use proper ARIA attributes and ensure the UI is accessible
5. **Performance**: Optimize the order list for performance, especially when there are many orders
6. **Real-time Updates**: Ensure WebSocket connections are properly managed and reconnected if disconnected
7. **User Feedback**: Provide clear feedback when order status changes or when there are errors

By following this implementation guide, you will have a fully functional order notification system that allows farmers to efficiently manage their orders and provide better service to their customers.