import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaPhone, FaVideo } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';

// Mock customer data
const mockCustomers = {
  '1': { id: '1', name: 'John Doe', phone: '+1 234-567-8901' },
  '2': { id: '2', name: 'Jane Smith', phone: '+1 234-567-8902' },
  '3': { id: '3', name: 'Mike Johnson', phone: '+1 234-567-8903' },
};

// Mock messages data
const mockMessages = {
  '1': [
    { id: 1, content: 'Hello, when will my order arrive?', sender_type: 'customer', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, content: 'Your order will arrive tomorrow morning', sender_type: 'farmer', created_at: new Date(Date.now() - 1800000).toISOString() },
  ],
  '2': [
    { id: 3, content: 'Do you have organic vegetables?', sender_type: 'customer', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 4, content: 'Yes, we have fresh organic vegetables', sender_type: 'farmer', created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
  '3': [
    { id: 5, content: 'Thanks for the delivery!', sender_type: 'customer', created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 6, content: "You're welcome! Enjoy your products", sender_type: 'farmer', created_at: new Date().toISOString() },
  ],
};

function ChatComponent({ session }) {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (customerId) {
      setCustomer(mockCustomers[customerId]);
      setMessages(mockMessages[customerId] || []);
    }
  }, [customerId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      content: newMessage,
      sender_type: 'farmer',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
  };

  const handleCall = (type) => {
    alert(`${type} call feature would be implemented with a service like Twilio`);
  };

  if (!customer) return null;

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header with Back Button */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            <IoArrowBack className="text-lg" />
          </button>
          <div>
            <h2 className="text-xl font-semibold">{customer.name}</h2>
            <p className="text-sm text-gray-500">{customer.phone}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => handleCall('voice')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaPhone className="text-green-500 text-xl" />
          </button>
          <button
            onClick={() => handleCall('video')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaVideo className="text-blue-500 text-xl" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_type === 'farmer' ? 'justify-end' : 'justify-start'
            } mb-4`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender_type === 'farmer'
                  ? 'bg-green-500 text-white'
                  : 'bg-white'
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs opacity-75">
                {format(new Date(message.created_at), 'HH:mm')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatComponent;
