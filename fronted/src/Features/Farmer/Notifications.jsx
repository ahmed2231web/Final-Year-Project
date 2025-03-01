import React, { useState } from 'react';
import { Bell, Package, Truck, CheckCircle, Calendar, DollarSign } from 'lucide-react';

// Mock notifications data
const initialNotifications = [
  {
    id: 1,
    type: 'new-order',
    title: 'New Order Received',
    message: '5kg Organic Tomatoes ordered by John Smith',
    amount: 25.00,
    time: '2 minutes ago',
    read: false
  },
  {
    id: 2,
    type: 'delivery',
    title: 'Order Ready for Delivery',
    message: 'Package #2847 needs to be delivered to Sarah Wilson',
    amount: 42.50,
    time: '1 hour ago',
    read: false
  },
  {
    id: 3,
    type: 'completed',
    title: 'Order Completed',
    message: 'Order #2846 has been successfully delivered',
    amount: 35.75,
    time: '3 hours ago',
    read: true
  }
];

function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showAll, setShowAll] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new-order':
        return <Package className="w-6 h-6 text-yellow-500" />;
      case 'delivery':
        return <Truck className="w-6 h-6 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <Bell className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              {showAll ? 'Show Unread' : 'Show All'}
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications
              .filter(notification => showAll || !notification.read)
              .map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notification.read
                      ? 'bg-white border-gray-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center text-green-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {notification.amount.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {notification.time}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Empty State */}
          {notifications.filter(n => showAll || !n.read).length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-gray-500">No new notifications to show.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;