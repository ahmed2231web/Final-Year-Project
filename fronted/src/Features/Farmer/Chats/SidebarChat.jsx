import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Outlet } from "react-router-dom";

const mockCustomers = [
  { id: '1', name: 'John Doe', last_message: 'When will my order arrive?', last_message_time: new Date().toISOString() },
  { id: '2', name: 'Jane Smith', last_message: 'Do you have organic vegetables?', last_message_time: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', name: 'Mike Johnson', last_message: 'Thanks for the delivery!', last_message_time: new Date(Date.now() - 7200000).toISOString() },
];

function SidebarChat() {
  const [customers] = useState(mockCustomers);
  const { customerId } = useParams();
  const isSmallScreen = window.innerWidth < 1024; // Adjust breakpoint as needed

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] lg:flex-row">
      {/* SidebarChat - Always visible on large screens, conditionally visible on small screens */}
      {(isSmallScreen && !customerId) || !isSmallScreen ? (
        <div className="lg:w-80 w-full bg-white border-r">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Chats</h2>
          </div>
          {customers.map(customer => (
            <Link key={customer.id} to={`/farmer/chat/${customer.id}`} className={`block p-4 border-b hover:bg-gray-50 ${customerId === customer.id ? 'bg-gray-100' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{customer.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{customer.last_message}</p>
                </div>
                <span className="text-xs text-gray-400">{format(new Date(customer.last_message_time), 'HH:mm')}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {/* ChatComponent - Only visible on large screens or when a customer is selected on small screens */}
      {(isSmallScreen && customerId) || !isSmallScreen ? (
        <div className="flex-1">
          <Outlet />
        </div>
      ) : null}
    </div>
  );
}

export default SidebarChat;
