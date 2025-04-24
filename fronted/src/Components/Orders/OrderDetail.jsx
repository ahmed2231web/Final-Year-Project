import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, confirmOrderReceipt, confirmOrderPayment } from '../../Services/orderService';
import { submitFeedback } from '../../Services/feedbackService';
import { getProductById } from '../../Services/apiCustomerProducts';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

// Enhanced order status badges with icons and better styling
const StatusBadge = ({ status, size = 'md' }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border border-yellow-300', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Pending'
        };
      case 'shipped':
        return { 
          color: 'bg-blue-100 text-blue-800 border border-blue-300', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          ),
          label: 'Shipped'
        };
      case 'delivered':
        return { 
          color: 'bg-indigo-100 text-indigo-800 border border-indigo-300', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          ),
          label: 'Delivered'
        };
      case 'completed':
        return { 
          color: 'bg-green-100 text-green-800 border border-green-300', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Completed'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border border-gray-300', 
          icon: null,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const { color, icon, label } = getStatusInfo();
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`${sizeClasses[size]} rounded-full font-medium flex items-center shadow-sm ${color} transition-all duration-300`}>
      {icon}
      {label}
    </span>
  );
};

// Feedback form component
const FeedbackForm = ({ orderId, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await onSubmit({ rating, comment });
      setRating(5);
      setComment('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Submit Feedback</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating (1-5 stars)
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-8 w-8 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-gray-600">{rating}/5</span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="4"
            placeholder="Share your experience with this product..."
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            submitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Define fetchOrder function outside useEffect so it can be called from anywhere in the component
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(orderId, token);
      
      // Process the order items to ensure they have proper image URLs
      if (data && data.items && Array.isArray(data.items)) {
        // Make sure each item has a product_image property
        data.items = data.items.map(item => {
          // If the item already has a valid image URL, use it
          if (item.product_image && (item.product_image.startsWith('http') || item.product_image.startsWith('/'))) {
            return item;
          }
          
          // Try to get image from localStorage if available
          try {
            // Try from agroConnectCart first (used in checkout)
            const cartItems = JSON.parse(localStorage.getItem('agroConnectCart') || '[]');
            const matchingCartItem = cartItems.find(cartItem => 
              cartItem.id === item.product_id || 
              cartItem.id === item.id || 
              cartItem.product_id === item.product_id
            );
            
            if (matchingCartItem && matchingCartItem.imageUrl) {
              return { ...item, product_image: matchingCartItem.imageUrl };
            }
            
            // Try from product cache as fallback
            const cachedProduct = localStorage.getItem(`product_${item.product_id}`);
            if (cachedProduct) {
              const productData = JSON.parse(cachedProduct);
              if (productData.image) {
                return { ...item, product_image: productData.image };
              }
            }
            
            // If we still don't have an image, try to fetch it
            getProductById(item.product_id)
              .then(productData => {
                if (productData && productData.image) {
                  // Update the order item with the image URL
                  setOrder(prevOrder => {
                    if (!prevOrder || !prevOrder.items) return prevOrder;
                    
                    const updatedItems = prevOrder.items.map(orderItem => {
                      if (orderItem.product_id === item.product_id) {
                        return { ...orderItem, product_image: productData.image };
                      }
                      return orderItem;
                    });
                    
                    return { ...prevOrder, items: updatedItems };
                  });
                  
                  // Cache the product data
                  localStorage.setItem(`product_${item.product_id}`, JSON.stringify(productData));
                }
              })
              .catch(err => console.error(`Error fetching product ${item.product_id}:`, err));
          } catch (err) {
            console.error('Error processing cart data:', err);
          }
          
          // Return the item as is if we couldn't find an image
          return item;
        });
      }
      
      setOrder(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Could not load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Call fetchOrder when component mounts or when orderId/token changes
  useEffect(() => {
    if (orderId && token) {
      fetchOrder();
    }
  }, [orderId, token]); // eslint-disable-line react-hooks/exhaustive-deps
  // We're intentionally not including fetchOrder in the dependency array
  // to avoid infinite re-renders

  // Handle confirming receipt of order
  const handleConfirmReceipt = async () => {
    setProcessingAction(true);
    try {
      const result = await confirmOrderReceipt(orderId, token);
      setOrder(result.order);
      toast.success('Receipt confirmed successfully!');
    } catch (err) {
      console.error('Error confirming receipt:', err);
      toast.error('Failed to confirm receipt. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle confirming payment
  const handleConfirmPayment = async () => {
    setProcessingAction(true);
    try {
      console.log(`Attempting to confirm payment for order ${orderId} with token: ${token ? 'exists' : 'missing'}`);
      
      // Check if we have a valid token before proceeding
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        setProcessingAction(false);
        return;
      }
      
      // Make sure we have a valid order ID
      if (!orderId) {
        toast.error('Invalid order ID. Please try again.');
        setProcessingAction(false);
        return;
      }
      
      // Check if the order has payment data and validate payment status
      if (order) {
        // Log order payment data for debugging
        console.log('Order payment data:', {
          orderId: order.id,
          orderStatus: order.status,
          paymentStatus: order.payment_status,
          paymentData: order.payment_data || 'Not available'
        });
        
        // Check if the order is in a state that can be confirmed
        // This is a more robust check using the existing order data
        if (order.status === 'pending' && !order.payment_status) {
          toast.error('This order cannot be confirmed yet. The payment must be processed through Stripe first.');
          setTimeout(() => {
            toast.error('Please complete the payment process from your cart before confirming.');
          }, 100);
          setProcessingAction(false);
          return;
        }
      }
      
      // Also check localStorage for payment success information as a fallback
      const paymentSuccess = localStorage.getItem('payment_success');
      const paymentSuccessOrderId = localStorage.getItem('payment_success_order_id');
      
      console.log('Payment success data from localStorage:', {
        paymentSuccess,
        paymentSuccessOrderId,
        currentOrderId: orderId
      });
      
      // Use the order ID from the current order state if available (more reliable)
      const targetOrderId = order?.id || orderId;
      console.log(`Using order ID for confirmation: ${targetOrderId}`);
      
      // Show loading toast for the confirmation process
      const loadingToast = toast.loading('Processing payment confirmation...');
      
      let result;
      try {
        result = await confirmOrderPayment(targetOrderId, token);
        // Clear the loading toast on success
        toast.dismiss(loadingToast);
        
        // Clear payment success data from localStorage after successful confirmation
        if (paymentSuccess && paymentSuccessOrderId === orderId) {
          localStorage.removeItem('payment_success');
          localStorage.removeItem('payment_success_order_id');
        }
      } catch (error) {
        // Clear the loading toast on error
        toast.dismiss(loadingToast);
        
        // If the error is related to payment status, provide a clearer message
        if (error.message && error.message.includes('PaymentIntent')) {
          console.log('Payment intent error detected, providing clearer message');
          error.message = 'Payment must be completed through Stripe checkout before confirming. Please complete the payment process from your cart.';
        }
        
        throw error; // Re-throw to be caught by the outer try/catch
      }
      
      // Update the local order state with the result
      if (result && result.order) {
        setOrder(result.order);
        toast.success('Payment confirmed successfully! Funds have been released to the farmer.');
      } else if (result) {
        // If we got a result but no order object, update anyway
        setOrder(prev => ({ ...prev, status: 'completed' }));
        toast.success('Payment confirmed successfully!');
      }
      
      // Refresh the order data to ensure we have the latest state
      // Use setTimeout to ensure state updates complete before fetching
      setTimeout(() => {
        fetchOrder();
      }, 500);
    } catch (err) {
      console.error('Error confirming payment:', err);
      
      // Provide more specific error messages based on the error type
      if (err.message && err.message.includes('Payment confirmation failed:')) {
        // Use the specific error message from the backend
        toast.error(err.message);
      } else if (err.response && err.response.status === 400) {
        // Handle common 400 errors
        const errorDetail = err.response.data?.detail || 'Invalid request';
        toast.error(`Payment confirmation failed: ${errorDetail}`);
      } else if (err.response && err.response.status === 401) {
        // Authentication error
        toast.error('Your session has expired. Please log in again.');
      } else {
        // Generic error
        toast.error('Failed to confirm payment. Please try again.');
      }
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle feedback submission
  const handleSubmitFeedback = async (feedbackData) => {
    try {
      await submitFeedback(
        {
          order_id: orderId,
          rating: feedbackData.rating,
          comment: feedbackData.comment
        },
        token
      );
      setFeedbackSubmitted(true);
      toast.success('Feedback submitted successfully! It will be visible after approval.');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error('Failed to submit feedback. Please try again.');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/orders" className="text-green-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Order not found</p>
        <Link to="/orders" className="text-green-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Enhanced Order Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-50 to-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
              </div>
              <div className="flex items-center mt-2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>
                  Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
            <StatusBadge status={order.status} size="lg" />
          </div>
          
          {/* Order Progress Tracker */}
          <div className="mt-6 pt-4">
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${order.status === 'pending' ? 'bg-yellow-500 w-1/4' : order.status === 'shipped' ? 'bg-blue-500 w-2/4' : order.status === 'delivered' ? 'bg-indigo-500 w-3/4' : 'bg-green-500 w-full'}`}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <div className="text-center">
                  <div className={`w-6 h-6 mb-1 rounded-full mx-auto flex items-center justify-center ${order.status ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>✓</div>
                  <span>Order Placed</span>
                </div>
                <div className="text-center">
                  <div className={`w-6 h-6 mb-1 rounded-full mx-auto flex items-center justify-center ${order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>✓</div>
                  <span>Shipped</span>
                </div>
                <div className="text-center">
                  <div className={`w-6 h-6 mb-1 rounded-full mx-auto flex items-center justify-center ${order.status === 'delivered' || order.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>✓</div>
                  <span>Delivered</span>
                </div>
                <div className="text-center">
                  <div className={`w-6 h-6 mb-1 rounded-full mx-auto flex items-center justify-center ${order.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>✓</div>
                  <span>Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Order Items */}
        <div className="p-6 border-b">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">Order Items</h2>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            {order.items.map((item, index) => (
              <div key={item.id} className={`py-4 ${index !== order.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-800 text-lg">{item.product_name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <span>Quantity: {item.quantity}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Unit Price: ${typeof item.price_at_order_time === 'number' ? 
                        item.price_at_order_time.toFixed(2) : 
                        parseFloat(item.price_at_order_time || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                      <span>Subtotal: ${(typeof item.price_at_order_time === 'number' ? 
                        item.price_at_order_time * item.quantity : 
                        parseFloat(item.price_at_order_time || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Order Summary</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${typeof order.total === 'number' ? 
                  order.total.toFixed(2) : 
                  parseFloat(order.total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>$0.00</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">${typeof order.total === 'number' ? 
                    order.total.toFixed(2) : 
                    parseFloat(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Order Actions */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">Order Actions</h2>
          </div>
          
          {/* Show different buttons based on order status */}
          {order.status === 'shipped' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 text-lg">Your Order Has Been Shipped</h3>
                  <p className="text-gray-600 mt-1">Please confirm when you receive your order.</p>
                </div>
              </div>
              <button
                onClick={handleConfirmReceipt}
                disabled={processingAction}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center ${
                  processingAction
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300'
                }`}
              >
                {processingAction ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Receipt
                  </>
                )}
              </button>
            </div>
          )}
          
          {order.status === 'delivered' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex items-start mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 text-lg">Your Order Has Been Delivered</h3>
                  <p className="text-gray-600 mt-1">Please confirm your payment to complete the order.</p>
                </div>
              </div>
              <button
                onClick={handleConfirmPayment}
                disabled={processingAction}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center ${
                  processingAction
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300'
                }`}
              >
                {processingAction ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Confirm Payment
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Feedback section - only show for completed orders */}
          {order.status === 'completed' && !feedbackSubmitted && (
            <FeedbackForm orderId={order.id} onSubmit={handleSubmitFeedback} />
          )}
          
          {order.status === 'completed' && feedbackSubmitted && (
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-green-800 text-lg">Thank You for Your Feedback!</h3>
                <p className="text-green-700 mt-1">
                  Your feedback has been submitted successfully and will be visible after approval.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <Link
              to="/customer/orders"
              className="inline-flex items-center text-green-600 hover:text-green-800 font-medium transition-colors duration-200 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
