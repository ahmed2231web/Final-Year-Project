import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaPlus, FaMinus, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import authService from '../../../Services/authService'; 
import toast from 'react-hot-toast';
import { createChatRoom } from '../../../Services/chatService';
import { createPaymentIntent } from '../../../Services/orderService';
import { useCart } from '../../../contexts/CartContext';

/**
 * Cart Component
 * Displays a sliding cart panel with product items, quantity controls, and checkout options
 */
function Cart({ isOpen, closeCart }) {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
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

      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        toast.error('Your cart is empty. Please add items before checkout.');
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
          toast.error(`Missing farmer information for ${item.productName}. Please try refreshing the page.`);
        }
      });
      
      // Check if we have any valid farmer groups
      if (Object.keys(farmerGroups).length === 0) {
        toast.error('Could not process your order. Missing farmer information for products.');
        setIsProcessing(false);
        return;
      }
      
      // Process each farmer group as a separate order with Stripe payment
      // For simplicity, we'll process the first farmer group only in this implementation
      // In a production environment, you might want to handle multiple farmers in a single checkout
      const [farmerId, items] = Object.entries(farmerGroups)[0];
      const firstItem = items[0];
      
      // Calculate accurate prices for each item
      const itemsWithPrices = items.map(item => {
        const price = calculateItemPrice(item);
        // Ensure product_id is properly formatted
        const productId = item.id || (item.product ? item.product.id : null);
        
        if (!productId) {
          console.error('Missing product ID in item:', item);
          toast.error('Error: Missing product information. Please try again.');
        }
        
        return {
          product_id: productId,
          quantity: parseInt(item.quantity, 10),
          price: parseFloat(price.toFixed(2))
        };
      });
      
      const calculatedTotal = itemsWithPrices.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
      
      // Log the first item to debug what's available
      console.log('First cart item details:', items[0]);
      
      // Prepare order data for Stripe payment - simplified for the backend API
      // The backend expects a direct product_id and quantity, not an array of items
      const orderData = {
        farmer_id: farmerId,
        product_id: items[0].id || items[0].product_id, // Use the direct ID from the item, with fallback
        quantity: items[0].quantity
      };
      
      // Validate the order data before proceeding
      if (!orderData.farmer_id || !orderData.product_id || !orderData.quantity) {
        console.error('Invalid order data:', orderData);
        toast.error('Missing required product information. Please try again.');
        setIsProcessing(false);
        return;
      }
      
      // Ensure product_id is a number if possible
      if (typeof orderData.product_id === 'string' && !isNaN(orderData.product_id)) {
        orderData.product_id = parseInt(orderData.product_id, 10);
      }
      
      console.log('Preparing order data for payment intent:', orderData);
      
      // Log before calling createPaymentIntent
      console.log('Calling createPaymentIntent in Cart.jsx with orderData:', orderData);
      
      try {
        // Create payment intent with Stripe
        console.log('Using token for payment intent:', freshToken ? 'Token exists' : 'No token');
        console.log('About to create payment intent with data:', JSON.stringify(orderData));
        const paymentData = await createPaymentIntent(orderData, freshToken.access || freshToken);
        
        console.log('Payment data received:', JSON.stringify(paymentData, null, 2));
        
        // The backend might return the client_secret directly or nested in a data object
        let clientSecret = null;
        let orderId = null;
        
        if (paymentData.client_secret) {
          // Direct format
          clientSecret = paymentData.client_secret;
          orderId = paymentData.order_id;
          console.log(`Found client_secret directly in response: ${clientSecret.substring(0, 10)}...`);
        } else if (paymentData.payment_intent && paymentData.payment_intent.client_secret) {
          // Nested in payment_intent object
          clientSecret = paymentData.payment_intent.client_secret;
          orderId = paymentData.id || paymentData.order_id;
          console.log(`Found client_secret in payment_intent: ${clientSecret.substring(0, 10)}...`);
        } else if (paymentData.id) {
          // If we just got an order ID, we can use that
          console.log('No client_secret found, using placeholder. Will redirect to order page.');
          clientSecret = 'placeholder'; // We'll redirect to order details instead
          orderId = paymentData.id;
        }
        
        if (!clientSecret) {
          console.error('Invalid payment data received:', JSON.stringify(paymentData, null, 2));
          throw new Error('Invalid payment data received from server. Missing client_secret.');
        }
        
        // Validate client secret format if not placeholder
        if (clientSecret !== 'placeholder') {
          // Client secret should be for a payment intent (pi_) or a setup intent (seti_)
          if (!clientSecret.includes('_secret_')) {
            console.error('Invalid client secret format received:', clientSecret.substring(0, 15));
            throw new Error('Invalid client secret format received from server');
          }
        }
        
        console.log('Payment intent created successfully in Cart.jsx, order_id:', paymentData.order_id);
        
        // Store client secret, order ID, farmer_id, and product_id for checkout page
        localStorage.setItem('payment_intent_client_secret', clientSecret);
        localStorage.setItem('current_order_id', orderId);
        localStorage.setItem('farmer_id', farmerId); // Store farmer_id for checkout page
        localStorage.setItem('product_id', items[0].id); // Store product_id for checkout page
        
        // Store order summary for checkout page
        const orderSummary = {
          items: items.map(item => ({
            id: item.id,
            name: item.productName,
            quantity: item.quantity,
            price: calculateItemPrice(item)
          })),
          totalPrice: parseFloat(totalPrice.toFixed(2)),
          shippingCost: parseFloat(shippingCost.toFixed(2)),
          totalWithShipping: parseFloat(totalWithShipping.toFixed(2))
        };
        localStorage.setItem('last_order_summary', JSON.stringify(orderSummary));
        
        toast.success('Redirecting to checkout...');
        
        // Log the data we're storing for checkout
        console.log('Stored checkout data:', {
          clientSecret: clientSecret ? `${clientSecret.substring(0, 10)}...` : null,
          orderId,
          farmerId
        });
        
        // Close cart and navigate to appropriate page
        closeCart();
        
        if (clientSecret === 'placeholder') {
          // If we don't have a real client secret, go to orders page instead
          navigate(`/orders/${orderId}`);
        } else {
          // Normal flow - go to checkout
          navigate('/checkout');
        }
        
        // Clear cart only after successful payment intent creation and navigation
        clearCart();
      } catch (stripeError) {
        console.error('Stripe payment error:', stripeError);
        console.error('Error response:', stripeError.response?.data);
        
        // Check if this is a network error
        if (stripeError.message && stripeError.message.includes('Network Error')) {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error(
            'Payment processing failed: ' + 
            (stripeError.response?.data?.detail || 
             stripeError.response?.data?.error || 
             stripeError.message || 
             'Please try again')
          );
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      toast.error('Failed to initialize checkout. Please try again.');
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
