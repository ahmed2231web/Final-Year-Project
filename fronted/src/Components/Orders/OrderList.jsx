import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../../Services/orderService';
import { useAuth } from '../../hooks/useAuth';
import { FaBoxOpen, FaShippingFast, FaCheckCircle, FaSpinner } from 'react-icons/fa';

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return { 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: <FaSpinner className="mr-1" />,
          label: 'Pending'
        };
      case 'shipped':
        return { 
          color: 'bg-blue-100 text-blue-800', 
          icon: <FaShippingFast className="mr-1" />,
          label: 'Shipped'
        };
      case 'delivered':
        return { 
          color: 'bg-indigo-100 text-indigo-800', 
          icon: <FaBoxOpen className="mr-1" />,
          label: 'Delivered'
        };
      case 'completed':
        return { 
          color: 'bg-green-100 text-green-800', 
          icon: <FaCheckCircle className="mr-1" />,
          label: 'Completed'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800', 
          icon: null,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const { color, icon, label } = getStatusInfo();

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${color}`}>
      {icon}
      {label}
    </span>
  );
};

const OrderList = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders(token);
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Could not load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

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
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">No Orders Yet</h2>
        <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
        <Link 
          to="/customer/dashboard" 
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
