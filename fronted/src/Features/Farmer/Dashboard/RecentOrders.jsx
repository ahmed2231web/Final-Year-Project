import React, { useState } from "react";
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { FaShippingFast, FaEye } from 'react-icons/fa';
import { shipOrder } from '../../../Services/orderService';
import authService from '../../../Services/authService';
import toast from 'react-hot-toast';

function RecentOrders({ orders, setOrders }) {
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const navigate = useNavigate();
  
  // Log the orders prop to debug the data structure
  console.log('RecentOrders orders prop:', orders);
  
  // Navigate to chat room when clicking on an order
  const handleOrderClick = (roomId) => {
    navigate(`/farmer/chat/${roomId}`);
  };

  // Handle shipping an order
  const handleShipOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('You must be logged in to ship orders');
        return;
      }
      
      console.log('Shipping order:', orderId);
      const updatedOrder = await shipOrder(orderId, token);
      console.log('Order shipped successfully:', updatedOrder);
      
      // Update the order in the list
      if (setOrders) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.room_id === orderId ? { ...order, order_status: 'shipped' } : order
          )
        );
      }
      
      toast.success('Order marked as shipped!');
    } catch (err) {
      console.error('Error shipping order:', err);
      toast.error('Failed to ship order. Please try again.');
    } finally {
      setProcessingOrderId(null);
    }
  };
  // Format date to be more readable
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Map order status to appropriate styling
  const getStatusStyle = (status) => {
    switch(status) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'shipped':
        return "bg-blue-100 text-blue-800";
      case 'delivered':
        return "bg-indigo-100 text-indigo-800";
      case 'active':
        return "bg-blue-100 text-blue-800";
      case 'pending':
      case 'new':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status text for display
  const getStatusText = (status) => {
    switch(status) {
      case 'completed':
        return "Completed";
      case 'shipped':
        return "Shipped";
      case 'delivered':
        return "Delivered";
      case 'active':
        return "Active";
      case 'pending':
        return "Pending";
      case 'new':
        return "New";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
      
      {/* Table for medium and larger screens */}
      <div className="hidden sm:block">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="border-b bg-gray-100 text-gray-700">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Order ID</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Customer</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Product</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Quantity</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Date</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Status</th>
              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              // Handle different data structures (ChatRoom vs Order)
              const isOrderData = 'chat_room_id' in order;
              const roomId = isOrderData ? order.chat_room_id : order.room_id;
              const displayId = isOrderData ? order.id : order.room_id;
              const productName = isOrderData ? (order.items?.[0]?.product_name || 'N/A') : order.product_name;
              const quantity = isOrderData ? (order.items?.[0]?.quantity || 0) : order.quantity;
              const status = isOrderData ? order.status : order.order_status;

              return (
                <tr
                  key={roomId}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm md:text-base">#{displayId}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm md:text-base">{order.customer_name}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm md:text-base">{productName}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-800 font-semibold text-xs sm:text-sm md:text-base">{quantity}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm md:text-base">{formatDate(order.created_at)}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-sm sm:shadow-md ${getStatusStyle(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                    <div className="flex space-x-2">
                      <Link
                        to={`/farmer/chat/${roomId}`}
                        className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                        title="Chat with customer"
                      >
                        <FaEye size={14} />
                      </Link>
                      {status === 'pending' && (
                        <button
                          onClick={() => handleShipOrder(roomId)}
                          disabled={processingOrderId === roomId}
                          className={`p-1.5 ${processingOrderId === roomId ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} rounded transition`}
                          title="Ship order"
                        >
                          <FaShippingFast size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Card layout for small screens */}
      <div className="sm:hidden space-y-3">
        {orders.map((order) => {
          // Handle different data structures (ChatRoom vs Order)
          const isOrderData = 'chat_room_id' in order;
          const roomId = isOrderData ? order.chat_room_id : order.room_id;
          const displayId = isOrderData ? order.id : order.room_id;
          const productName = isOrderData ? (order.items?.[0]?.product_name || 'N/A') : order.product_name;
          const quantity = isOrderData ? (order.items?.[0]?.quantity || 0) : order.quantity;
          const status = isOrderData ? order.status : order.order_status;

          return (
            <div
              key={roomId}
              className="bg-gray-50 p-3 rounded-lg shadow-sm hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-700">#{displayId}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusStyle(status)}`}>
                  {getStatusText(status)}
                </span>
              </div>
              <div className="flex justify-end mb-2 space-x-2">
                <Link
                  to={`/farmer/chat/${roomId}`}
                  className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                  title="Chat with customer"
                >
                  <FaEye size={14} />
                </Link>
                {status === 'pending' && (
                  <button
                    onClick={() => handleShipOrder(roomId)}
                    disabled={processingOrderId === roomId}
                    className={`p-1.5 ${processingOrderId === roomId ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} rounded transition`}
                    title="Ship order"
                  >
                    <FaShippingFast size={14} />
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-600 mb-1"><span className="font-medium">Customer:</span> {order.customer_name}</div>
              <div className="text-xs text-gray-600 mb-1"><span className="font-medium">Product:</span> {productName}</div>
              <div className="text-xs text-gray-600 mb-1"><span className="font-medium">Quantity:</span> {quantity}</div>
              <div className="text-xs font-semibold text-gray-800"><span className="font-medium">Date:</span> {formatDate(order.created_at)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentOrders;
