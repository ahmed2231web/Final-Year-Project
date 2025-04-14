import React from 'react';
import { FaShoppingCart, FaCheckCircle, FaSpinner, FaUndo } from 'react-icons/fa';
import StatCard from "./StatCard";
import RecentOrders from './RecentOrders';

export default function HeroMain() {
  // Sample data - In a real app, this would come from an API
  const stats = [
    { 
      title: 'Total Orders',
      value: '1,284',
      icon: FaShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Completed Orders',
      value: '854',
      icon: FaCheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Active Orders',
      value: '342',
      icon: FaSpinner,
      color: 'bg-yellow-500'
    },
    {
      title: 'Return Orders',
      value: '88',
      icon: FaUndo,
      color: 'bg-red-500'
    }
  ];

  const recentOrders = [
    {
      id: '1001',
      customer: 'John Doe',
      product: 'Organic Tomatoes',
      amount: '125.00',
      status: 'Completed'
    },
    {
      id: '1002',
      customer: 'Jane Smith',
      product: 'Fresh Lettuce',
      amount: '75.50',
      status: 'Active'
    },
    {
      id: '1003',
      customer: 'Bob Wilson',
      product: 'Carrots Bundle',
      amount: '45.00',
      status: 'Returned'
    },
    {
      id: '1004',
      customer: 'Alice Brown',
      product: 'Mixed Vegetables',
      amount: '95.00',
      status: 'Active'
    },
    {
      id: '1005',
      customer: 'Charlie Davis',
      product: 'Organic Potatoes',
      amount: '65.00',
      status: 'Completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">Farmer Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
