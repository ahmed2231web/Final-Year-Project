import React from "react";

function RecentOrders({ orders }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="border-b bg-gray-100 text-gray-700">
              <th className="text-left py-3 px-4">Order ID</th>
              <th className="text-left py-3 px-4">Customer</th>
              <th className="text-left py-3 px-4">Product</th>
              <th className="text-left py-3 px-4">Amount</th>
              <th className="text-left py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                <td className="py-3 px-4 text-gray-700 font-medium">#{order.id}</td>
                <td className="py-3 px-4 text-gray-600">{order.customer}</td>
                <td className="py-3 px-4 text-gray-600">{order.product}</td>
                <td className="py-3 px-4 text-gray-800 font-semibold">${order.amount}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-md ${
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
    </div>
  );
}

export default RecentOrders;
