import React from "react";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function RecentOrders({ orders }) {
  const navigate = useNavigate();
  
  // Navigate to chat room when clicking on an order
  const handleOrderClick = (roomId) => {
    navigate(`/farmer/chat/${roomId}`);
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
      case 'active':
        return "bg-blue-100 text-blue-800";
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
      case 'active':
        return "Active";
      case 'new':
        return "New";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
      
      {/* Table for medium and larger screens */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="border-b bg-gray-100 text-gray-700">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Order ID</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Customer</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Product</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Quantity</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Date</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order.room_id} 
                className="border-b hover:bg-gray-50 transition cursor-pointer" 
                onClick={() => handleOrderClick(order.room_id)}
              >
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm md:text-base">#{order.room_id}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm md:text-base">{order.customer_name}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm md:text-base">{order.product_name}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-800 font-semibold text-xs sm:text-sm md:text-base">{order.quantity}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm md:text-base">{formatDate(order.created_at)}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-sm sm:shadow-md ${getStatusStyle(order.order_status)}`}>
                    {getStatusText(order.order_status)}
                  </span>
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
            key={order.room_id} 
            className="bg-gray-50 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition"
            onClick={() => handleOrderClick(order.room_id)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700">#{order.room_id}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusStyle(order.order_status)}`}>
                {getStatusText(order.order_status)}
              </span>
            </div>
            <div className="text-xs text-gray-600 mb-1"><span className="font-medium">Customer:</span> {order.customer_name}</div>
            <div className="text-xs text-gray-600 mb-1"><span className="font-medium">Product:</span> {order.product_name}</div>
            <div className="text-xs text-gray-600 mb-1"><span className="font-medium">Quantity:</span> {order.quantity}</div>
            <div className="text-xs font-semibold text-gray-800"><span className="font-medium">Date:</span> {formatDate(order.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentOrders;
