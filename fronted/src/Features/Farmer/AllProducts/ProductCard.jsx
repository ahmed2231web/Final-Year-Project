import React, { useState } from 'react';
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/helpers';
import { motion } from 'framer-motion';

function ProductCard({ product, onEdit, onDelete, onView }) {
  const { 
    productName, 
    category, 
    price, 
    discount, 
    stockQuantity, 
    imageUrl, 
    imageUrl2, 
    imageUrl3 
  } = product;
  
  // Collect all available images
  const images = [imageUrl, imageUrl2, imageUrl3].filter(Boolean);
  
  // State for current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // State for image loading errors
  const [imageError, setImageError] = useState(false);
  
  // State for hover effects
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Navigate to next image
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  // Navigate to previous image
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  // Calculate discounted price
  const discountedPrice = discount ? price - (price * (discount / 100)) : price;
  
  // Cloudinary transformation for optimized images
  const getOptimizedImageUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    // Add Cloudinary transformations for optimization
    return url.replace('/upload/', '/upload/c_fill,f_auto,q_auto,w_400,h_300/');
  };
  
  return (
    <motion.div 
      className="card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      onClick={() => onView(product)}
    >
      {/* Product Image with Carousel */}
      <div className="relative h-52 bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden cursor-pointer">
        {images.length > 0 ? (
          <>
            <img
              src={getOptimizedImageUrl(images[currentImageIndex])}
              alt={productName}
              className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
              onError={handleImageError}
              loading="lazy"
            />
            
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <p className="text-gray-500">Image not available</p>
              </div>
            )}
            
            {/* Image Navigation (only show if multiple images) */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-lg hover:bg-opacity-100 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:opacity-100"
                  aria-label="Previous image"
                >
                  <FaChevronLeft className="text-green-700" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-lg hover:bg-opacity-100 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:opacity-100"
                  aria-label="Next image"
                >
                  <FaChevronRight className="text-green-700" />
                </button>
                
                {/* Image Indicator Dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                  {images.map((_, index) => (
                    <span 
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentImageIndex ? 'w-6 bg-green-500' : 'w-1.5 bg-white bg-opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
            {discount}% OFF
          </div>
        )}
        
        {/* View Details Overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center`}>
          <motion.button
            className="bg-white text-green-600 rounded-full p-3 opacity-0 hover:opacity-100 transform scale-90 hover:scale-100 transition-all duration-300"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1 }}
            aria-label="View details"
          >
            <FaEye className="text-lg" />
          </motion.button>
        </div>
      </div>
      
      <div className="card-body p-5">
        <h2 className="card-title text-xl font-bold text-gray-800 mb-1 truncate">{productName}</h2>
        <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-3">
          {category}
        </div>
        
        {/* Price Display */}
        <div className="flex items-baseline mb-3">
          {discount > 0 ? (
            <>
              <span className="text-xl font-bold text-green-600 mr-2">
                {formatCurrency(discountedPrice)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(price)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(price)}
            </span>
          )}
          <span className="text-xs text-gray-500 ml-1">per kg</span>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" 
              style={{backgroundColor: stockQuantity > 10 ? '#10B981' : stockQuantity > 0 ? '#F59E0B' : '#EF4444'}}
            ></span>
            <span className="font-medium">{stockQuantity} kg</span> in stock
          </p>
        </div>
        
        {/* Action Buttons - Aligned in one row */}
        <div className="flex justify-end items-center mt-4">
          <div className="flex space-x-2">
            <motion.button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }} 
              className="px-3 py-1.5 rounded-full bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 transition-all duration-300 flex items-center gap-1.5 shadow-sm"
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <FaEdit className="text-sm" /> <span className="font-medium">Edit</span>
            </motion.button>
            <motion.button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }} 
              className="px-3 py-1.5 rounded-full bg-white border-2 border-red-400 text-red-500 hover:bg-red-50 transition-all duration-300 flex items-center gap-1.5 shadow-sm"
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTrash className="text-sm" /> <span className="font-medium">Delete</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
