import React, { useState, useEffect } from 'react';
import { getProductFeedback } from '../../Services/feedbackService';
import { useAuth } from '../../hooks/useAuth';

// Star rating display component
const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${
            i < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
      <span className="ml-2 text-gray-600">{rating}/5</span>
    </div>
  );
};

// Feedback item component
const FeedbackItem = ({ feedback }) => {
  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <StarRating rating={feedback.rating} />
          <p className="text-sm text-gray-500 mt-1">
            By {feedback.customer_name} • {new Date(feedback.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {feedback.comment && (
        <p className="text-gray-700 mt-2">{feedback.comment}</p>
      )}
      
      {feedback.response && (
        <div className="mt-3 pl-4 border-l-2 border-gray-200">
          <p className="text-sm font-medium">Response from {feedback.farmer_name}:</p>
          <p className="text-sm text-gray-700 mt-1">{feedback.response.response}</p>
        </div>
      )}
    </div>
  );
};

const ProductFeedback = ({ productId }) => {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await getProductFeedback(productId, token);
        
        // Only show approved feedback
        const approvedFeedback = data.filter(item => item.is_approved);
        setFeedback(approvedFeedback);
        
        // Calculate average rating
        if (approvedFeedback.length > 0) {
          const total = approvedFeedback.reduce((sum, item) => sum + item.rating, 0);
          setAverageRating(total / approvedFeedback.length);
        }
      } catch (err) {
        console.error('Error fetching product feedback:', err);
        setError('Could not load feedback. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (productId && token) {
      fetchFeedback();
    }
  }, [productId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Customer Feedback</h2>
      
      {feedback.length > 0 ? (
        <div>
          <div className="flex items-center mb-6">
            <div className="mr-4">
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-gray-500">/5</span>
            </div>
            <StarRating rating={Math.round(averageRating)} />
            <span className="ml-2 text-gray-500">({feedback.length} reviews)</span>
          </div>
          
          <div className="space-y-2">
            {feedback.map((item) => (
              <FeedbackItem key={item.id} feedback={item} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No feedback yet for this product.</p>
      )}
    </div>
  );
};

export default ProductFeedback;
