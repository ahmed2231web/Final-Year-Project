import React, { useState, useEffect } from 'react';
import { getProductFeedback } from '../../Services/feedbackService';
import { useAuth } from '../../hooks/useAuth';

// Enhanced star rating display component
const StarRating = ({ rating, size = 'md' }) => {
  // Size classes for different star sizes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeClasses[size]} ${i < rating ? 'text-yellow-400' : 'text-gray-200'} transition-colors duration-200`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
      <span className="ml-2 text-gray-600 font-medium">{rating}/5</span>
    </div>
  );
};

// Enhanced feedback item component
const FeedbackItem = ({ feedback }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-4 border-l-4 border-green-500 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.03-.696-.085-1.038A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-800">{feedback.customer_name}</p>
              <p className="text-xs text-gray-500">{new Date(feedback.created_at).toLocaleDateString()} • {new Date(feedback.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
        </div>
        <StarRating rating={feedback.rating} />
      </div>
      
      {feedback.comment && (
        <div className="bg-gray-50 p-3 rounded-md mt-2">
          <p className="text-gray-700">{feedback.comment}</p>
        </div>
      )}
      
      {feedback.response && (
        <div className="mt-4 bg-green-50 p-3 rounded-md border-l-2 border-green-400">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green-700">Response from {feedback.farmer_name}:</p>
          </div>
          <p className="text-sm text-gray-700">{feedback.response.response}</p>
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
    <div>
      {feedback.length > 0 ? (
        <div>
          {/* Rating Summary */}
          <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-lg mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-6 text-center">
                <span className="block text-4xl font-bold text-green-600">{averageRating.toFixed(1)}</span>
                <span className="block text-sm text-gray-500 mt-1">out of 5</span>
              </div>
              <div>
                <StarRating rating={Math.round(averageRating)} size="lg" />
                <span className="block text-sm text-gray-500 mt-1">{feedback.length} verified {feedback.length === 1 ? 'review' : 'reviews'}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Review List */}
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Customer Reviews</h3>
          <div className="space-y-4">
            {feedback.map((item) => (
              <FeedbackItem key={item.id} feedback={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-600 text-lg">No feedback yet for this product.</p>
          <p className="text-gray-500 mt-2">Be the first to leave a review!</p>
        </div>
      )}
    </div>
  );
};

export default ProductFeedback;
