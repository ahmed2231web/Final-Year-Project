import React from "react";

function RecentOrders({ orders }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 mt-4 sm:mt-5 md:mt-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Recent Orders</h2>
      
      {/* Table for medium and larger screens */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="border-b bg-gray-100 text-gray-700">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Order ID</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Customer</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Product</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Amount</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm md:text-base">#{order.id}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm md:text-base">{order.customer}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm md:text-base">{order.product}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-800 font-semibold text-xs sm:text-sm md:text-base">${order.amount}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-sm sm:shadow-md ${
                    order.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Active"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {order.status}
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
          <div key={order.id} className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700">#{order.id}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                order.status === "Completed"
                  ? "bg-green-100 text-green-800"
                  : order.status === "Active"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {order.status}
              </span>
            </div>
            <div className="text-xs text-gray-600 mb-1"><span className="font-medium">Customer:</span> {order.customer}</div>
            <div className="text-xs text-gray-600 mb-1"><span className="font-medium">Product:</span> {order.product}</div>
            <div className="text-xs font-semibold text-gray-800"><span className="font-medium">Amount:</span> ${order.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentOrders;
