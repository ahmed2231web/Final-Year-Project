import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaPlus, FaMinus, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import authService from '../../../Services/autheServices'; 
import toast from 'react-hot-toast';
import { createChatRoom } from '../../../Services/chatService';

/**
 * Cart Component
 * Displays a sliding cart panel with product items, quantity controls, and checkout options
 */
function Cart({ isOpen, closeCart, cartItems, removeFromCart, updateQuantity, clearCart }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  // Get user ID on component mount
  useEffect(() => {
    const getUserId = () => {
      // Try to get user ID from localStorage
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        // Try to get from userData
        const userData = authService.getUserData();
        if (userData && userData.user_id) {
          setUserId(userData.user_id);
          localStorage.setItem('user_id', userData.user_id);
        }
      }
    };

    getUserId();
  }, []);

  // Calculate discounted price if applicable
  const calculateItemPrice = (item) => {
    if (item.discount > 0) {
      return item.price - (item.price * (item.discount / 100));
    }
    return item.price;
  };

  // Calculate total price with discounts applied
  const totalPrice = cartItems.reduce((total, item) => {
    const itemPrice = calculateItemPrice(item);
    return total + (itemPrice * item.quantity);
  }, 0);
  
  const shippingCost = totalPrice > 0 ? 5.00 : 0;
  const totalWithShipping = totalPrice + shippingCost;

  // Process the checkout
  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      // Refresh token to ensure we have a valid one
      const freshToken = await authService.refreshToken();

      if (!freshToken) {
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
        setIsProcessing(false);
        return;
      }

      // Get user data from local storage
      const customerId = localStorage.getItem('user_id');
      if (!customerId) {
        toast.error('Cannot identify user. Please login again.');
        navigate('/login');
        setIsProcessing(false);
        return;
      }

      // Group cart items by farmer
      const farmerGroups = {};
      cartItems.forEach(item => {
        // Try to get farmer ID from either farmer_id or farmer field
        const farmerId = item.farmer_id || item.farmer;
        
        if (farmerId && farmerId !== 'undefined') {
          if (!farmerGroups[farmerId]) {
            farmerGroups[farmerId] = [];
          }
          farmerGroups[farmerId].push({...item, farmer_id: farmerId});
        } else {
          console.error('Missing farmer information in cart item:', item);
        }
      });
      
      // Check if we have any valid farmer groups
      if (Object.keys(farmerGroups).length === 0) {
        toast.error('Could not process your order. Missing farmer information for products.');
        setIsProcessing(false);
        return;
      }
      
      // Create chat rooms and send initial messages for each farmer
      const chatPromises = Object.entries(farmerGroups).map(async ([farmerId, items]) => {
        try {
          // For each farmer, create a chat room with their first product
          const firstItem = items[0];
          
          const roomData = {
            customer: customerId,
            farmer: farmerId,
            product: firstItem.id,
            quantity: firstItem.quantity,
            is_post_checkout: true
          };
          
          // Create or get existing chat room
          const chatRoom = await createChatRoom(roomData, freshToken);
          
          return chatRoom;
        } catch (error) {
          console.error('Error creating chat room:', error);
          return null;
        }
      });
      
      // Wait for all chat rooms to be created
      const createdChatRooms = await Promise.all(chatPromises);
      const successfulRooms = createdChatRooms.filter(room => room !== null);
      
      // Store order information for future implementation
      const orderSummary = Object.entries(farmerGroups).map(([farmerId, items]) => {
        const firstItem = items[0];
        return {
          farmerId: farmerId,
          farmerName: firstItem.farmer_name || 'Farmer',
          products: items.map(item => ({
            id: item.id,
            name: item.productName,
            quantity: item.quantity,
            price: item.price
          }))
        };
      });
      
      // Store in localStorage for potential later use
      localStorage.setItem('last_order_summary', JSON.stringify(orderSummary));
      
      // Close the cart modal
      closeCart();
      
      // If chat rooms were created, redirect to the first one
      if (successfulRooms.length > 0) {
        const firstRoom = successfulRooms[0];
        localStorage.setItem('last_chat_room', firstRoom.room_id);
        // Redirect directly to chat with the farmer without an alert
        navigate(`/customer/chat/${firstRoom.room_id}`);
      } else {
        toast.success('Your order has been placed successfully!');
        // If no chat rooms were created, redirect to dashboard
        navigate('/customer/dashboard');
      }
      
      // Clear the cart
      clearCart();

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`} 
        onClick={closeCart}
      ></div>
      
      <div 
        className={`absolute top-0 right-0 w-full max-w-md h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white">
            <div className="flex items-center">
              <FaShoppingCart className="mr-2 text-xl" />
              <h2 className="text-xl font-semibold">Your Cart</h2>
              <span className="ml-2 bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </div>
            <button 
              onClick={closeCart}
              className="p-1 rounded-full hover:bg-green-700 transition-colors"
              aria-label="Close cart"
            >
              <FaTimes className="text-white text-lg" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <div className="text-green-600 mb-4">
                  <FaShoppingCart className="w-16 h-16 mx-auto opacity-30" />
                </div>
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button 
                  onClick={closeCart}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <li key={item.id} className="py-4">
                    <div className="flex items-center">
                      <img 
                        src={item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                        alt={item.productName} 
                        className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                      />
                      
                      <div className="ml-4 flex-grow">
                        <h3 className="text-sm font-medium text-gray-800">{item.productName}</h3>
                        {item.discount > 0 ? (
                          <div>
                            <p className="text-sm text-gray-500 line-through">${parseFloat(item.price).toFixed(2)} each</p>
                            <p className="text-sm text-green-600">${calculateItemPrice(item).toFixed(2)} each ({item.discount}% off)</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">${parseFloat(item.price).toFixed(2)} each</p>
                        )}
                        
                        <div className="flex items-center mt-2">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="text-gray-500 hover:text-green-600 focus:outline-none p-1"
                            aria-label="Decrease quantity"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="mx-2 w-8 text-center text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-green-600 focus:outline-none p-1"
                            aria-label="Increase quantity"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                          
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-red-500 hover:text-red-700"
                            aria-label="Remove item"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t">
                <span>Total</span>
                <span>${totalWithShipping.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full mt-4 py-3 bg-green-600 text-white rounded-md text-center font-semibold ${
                  isProcessing ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
