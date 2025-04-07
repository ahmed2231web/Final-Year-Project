import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaTag } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../../config';
import LoadingSpinner from '../../../Components/Common/LoadingSpinner';

// Local fallback image - base64 encoded small placeholder
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/**
 * Farmer News Component
 * Displays agricultural news articles for farmers with external links
 */
function FarmerNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Fetch news articles from the backend
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/auth/news/`);
        setNews(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Get unique categories for filter
  const categoryMap = {
    'farming_techniques': 'Farming Techniques',
    'government': 'Government',
    'climate': 'Climate',
    'technology': 'Technology',
    'sustainability': 'Sustainability',
    'general': 'General'
  };
  
  // Extract unique categories from news data
  const categories = ['all'];
  if (news.length > 0) {
    const uniqueCategories = [...new Set(news.map(item => item.category))];
    uniqueCategories.forEach(category => {
      if (!categories.includes(category)) {
        categories.push(category);
      }
    });
  }
  
  // Filter news by category
  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  // Format date from ISO string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Function to get image source - multiple fallback strategies
  const getImageSource = (item) => {
    // First try to use the properly constructed image_url from the backend
    if (item.image_url) {
      return item.image_url;
    }
    
    // Then try the encoded image data
    if (item.image_data) {
      return item.image_data;
    }
    
    // If neither is available, try to construct the URL ourselves
    if (item.image) {
      // If it's already a complete URL, return it as is
      if (item.image.startsWith('http')) {
        return item.image;
      }
      
      // Otherwise, construct the URL based on our best knowledge
      const imagePath = item.image.startsWith('/') ? item.image.substring(1) : item.image;
      return `${API_URL}/${imagePath}`;
    }
    
    // Fallback to default image if no image available
    return FALLBACK_IMAGE;
  };
  
  // Handle opening external article link
  const handleReadMore = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Agricultural News</h1>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-green-100'
              }`}
            >
              {category === 'all' ? 'All' : categoryMap[category] || category}
            </button>
          ))}
        </div>
        
        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 text-lg">No news articles found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map(item => (
              <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src={getImageSource(item)} 
                  alt={item.title} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE;
                    e.target.onerror = null; // Prevent infinite loop
                  }}
                />
                
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FaCalendarAlt className="mr-1" />
                    <span>{formatDate(item.created_at)}</span>
                    <span className="mx-2">•</span>
                    <FaTag className="mr-1" />
                    <span>{categoryMap[item.category] || item.category}</span>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-3 text-gray-800">{item.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                  
                  <button 
                    onClick={() => handleReadMore(item.article_url)}
                    className="mt-4 text-green-600 font-medium hover:text-green-700 transition-colors"
                  >
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmerNews;
