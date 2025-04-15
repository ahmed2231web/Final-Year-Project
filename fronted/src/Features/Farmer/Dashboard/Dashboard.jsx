import React from 'react';
import { FaShoppingCart, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import StatCard from "./StatCard";
import RecentOrders from './RecentOrders';
import { getFarmerDashboardData } from '../../../Services/apiFarmer';

export default function HeroMain() {
  // Fetch dashboard data using React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['farmerDashboardData'],
    queryFn: getFarmerDashboardData,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,      // Consider data stale after 30 seconds
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
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-full mx-auto overflow-x-hidden">
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

        {/* Recent Orders */}
        <RecentOrders orders={data.recent_orders} />
      </div>
    </div>
  );
}
