import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, confirmOrderReceipt, confirmOrderPayment } from '../../Services/orderService';
import { submitFeedback } from '../../Services/feedbackService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

// Order status badges with appropriate colors
const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
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

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId, token);
        setOrder(data);
        setFeedbackSubmitted(data.has_feedback);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Could not load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token) {
      fetchOrder();
    }
  }, [orderId, token]);

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
      const result = await confirmOrderPayment(orderId, token);
      setOrder(result.order);
      toast.success('Payment confirmed successfully! Funds have been released to the farmer.');
    } catch (err) {
      console.error('Error confirming payment:', err);
      toast.error('Failed to confirm payment. Please try again.');
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
        {/* Order Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-gray-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Order Items */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center">
                {item.product_image && (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="h-16 w-16 object-cover rounded-md mr-4"
                  />
                )}
                <div>
                  <h3 className="font-medium">{item.product_name}</h3>
                  <p className="text-gray-600">
                    {item.quantity} x ${typeof item.price_at_order_time === 'number' ? 
                      item.price_at_order_time.toFixed(2) : 
                      parseFloat(item.price_at_order_time || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold">${typeof order.total === 'number' ? 
                order.total.toFixed(2) : 
                parseFloat(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Actions</h2>
          
          {/* Show different buttons based on order status */}
          {order.status === 'shipped' && (
            <button
              onClick={handleConfirmReceipt}
              disabled={processingAction}
              className={`w-full py-2 px-4 mb-4 rounded-md text-white font-medium ${
                processingAction
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {processingAction ? 'Processing...' : 'Confirm Receipt'}
            </button>
          )}
          
          {order.status === 'delivered' && (
            <button
              onClick={handleConfirmPayment}
              disabled={processingAction}
              className={`w-full py-2 px-4 mb-4 rounded-md text-white font-medium ${
                processingAction
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {processingAction ? 'Processing...' : 'Confirm Payment'}
            </button>
          )}
          
          {/* Feedback section - only show for completed orders */}
          {order.status === 'completed' && !feedbackSubmitted && (
            <FeedbackForm orderId={order.id} onSubmit={handleSubmitFeedback} />
          )}
          
          {order.status === 'completed' && feedbackSubmitted && (
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-green-700">
                Thank you for your feedback! It will be visible after approval.
              </p>
            </div>
          )}
          
          <Link
            to="/orders"
            className="block text-center mt-4 text-green-600 hover:underline"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
