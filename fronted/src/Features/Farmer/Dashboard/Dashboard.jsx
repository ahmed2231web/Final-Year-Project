import React, { useState } from 'react';
import { FaShoppingCart, FaCheckCircle, FaSpinner, FaBoxOpen } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import StatCard from "./StatCard";
import RecentOrders from './RecentOrders';
import { getFarmerDashboardData } from '../../../Services/apiFarmer';

export default function HeroMain() {
  // State for orders that can be updated by child components
  const [recentOrders, setRecentOrders] = useState([]);
  // Fetch dashboard data using React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['farmerDashboardData'],
    queryFn: getFarmerDashboardData,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,      // Consider data stale after 30 seconds
    onSuccess: (data) => {
      // Initialize recentOrders state when data is fetched
      if (data && data.recent_orders && recentOrders.length === 0) {
        setRecentOrders(data.recent_orders);
      }
    }
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-10 w-10 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl font-bold">Error loading dashboard</p>
          <p className="mt-2">{error.message || 'Failed to load dashboard data'}</p>
        </div>
      </div>
    );
  }

  // Map data to stats format
  const stats = [
    { 
      title: 'Total Orders',
      value: data.total_orders.toString(),
      icon: FaShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Completed Orders',
      value: data.completed_orders.toString(),
      icon: FaCheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Active Orders',
      value: data.active_orders.toString(),
      icon: FaSpinner,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-full mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">Farmer Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
        
        {/* Order Management Link */}
        <div className="mt-6 mb-8">
          <Link 
            to="/farmer/orders" 
            className="flex items-center justify-between p-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <div className="flex items-center">
              <FaBoxOpen className="text-2xl mr-3" />
              <span className="text-lg font-medium">Manage Orders</span>
            </div>
            <span className="text-sm bg-white text-green-700 px-3 py-1 rounded-full font-medium">
              View All Orders
            </span>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <Link to="/farmer/orders" className="text-green-600 hover:text-green-800 font-medium">
              View All
            </Link>
          </div>
          <RecentOrders orders={recentOrders.length > 0 ? recentOrders : data.recent_orders} setOrders={setRecentOrders} />
        </div>
      </div>
    </div>
  );
}
