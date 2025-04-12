import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/helpers';

function ProductDetailsModal({ product, onClose, onEdit, onDelete }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Collect all available images
  const images = [product.imageUrl, product.imageUrl2, product.imageUrl3].filter(Boolean);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        prevImage(e);
      } else if (e.key === 'ArrowRight') {
        nextImage(e);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);
  
  // Navigate to next image
  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  // Navigate to previous image
  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  // Calculate discounted price
  const discountedPrice = product.discount 
    ? product.price - (product.price * (product.discount / 100)) 
    : product.price;
  
  // Cloudinary transformation for optimized images
  const getOptimizedImageUrl = (url, fullscreen = false) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    // Add Cloudinary transformations for optimization
    return fullscreen 
      ? url.replace('/upload/', '/upload/c_fill,f_auto,q_auto,w_1200,h_900/') 
      : url.replace('/upload/', '/upload/c_fill,f_auto,q_auto,w_600,h_450/');
  };
  
  // Get stock status
  const getStockStatus = () => {
    if (product.stockQuantity > 20) return { color: '#10B981', text: 'In Stock' };
    if (product.stockQuantity > 5) return { color: '#F59E0B', text: 'Low Stock' };
    if (product.stockQuantity > 0) return { color: '#EF4444', text: 'Very Low Stock' };
    return { color: '#6B7280', text: 'Out of Stock' };
  };
  
  const stockStatus = getStockStatus();
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800">{product.productName}</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row overflow-hidden">
            {/* Image Gallery */}
            <div className="w-full md:w-1/2 relative bg-gray-100">
              {/* Main Image */}
              <div 
                className="relative h-64 md:h-96 overflow-hidden cursor-pointer group"
                onClick={() => setIsFullscreen(true)}
              >
                {images.length > 0 ? (
                  <img
                    src={getOptimizedImageUrl(images[currentImageIndex])}
                    alt={product.productName}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                
                {/* Zoom Hint Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-white bg-opacity-0 group-hover:bg-opacity-80 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3h-6" />
                    </svg>
                  </div>
                </div>
                
                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transform rotate-3">
                    {product.discount}% OFF
                  </div>
                )}
              </div>
              
              {/* Image Navigation (only show if multiple images) */}
              {images.length > 1 && (
                <>
                  <motion.button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2.5 shadow-lg hover:bg-green-50 transition-all duration-300"
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Previous image"
                  >
                    <FaChevronLeft className="text-green-700" />
                  </motion.button>
                  <motion.button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2.5 shadow-lg hover:bg-green-50 transition-all duration-300"
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Next image"
                  >
                    <FaChevronRight className="text-green-700" />
                  </motion.button>
                  
                  {/* Thumbnail Navigation */}
                  <div className="flex justify-center mt-3 p-2 gap-2">
                    {images.map((url, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? 'border-green-500 shadow-md' : 'border-transparent opacity-70'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img 
                          src={url} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Product Details */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Category */}
                <div className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {product.category}
                </div>
                
                {/* Price Display */}
                <div className="flex items-baseline">
                  {product.discount > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-green-600 mr-2">
                        {formatCurrency(discountedPrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-green-600">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                  <span className="text-sm text-gray-500 ml-2">per kg</span>
                </div>
                
                {/* Stock Status */}
                <div className="flex items-center">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{backgroundColor: stockStatus.color}}
                  ></span>
                  <span className="font-medium text-gray-700">
                    {stockStatus.text} ({product.stockQuantity} kg)
                  </span>
                </div>
                
                {/* Description */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {product.description || "No description available."}
                  </p>
                </div>
                
                {/* Improved Action Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                  <motion.button 
                    onClick={() => onEdit(product)} 
                    className="px-4 py-2 rounded-full bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 transition-all duration-300 flex items-center gap-2 shadow-sm"
                    whileHover={{ scale: 1.05, y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEdit /> <span className="font-medium">Edit Product</span>
                  </motion.button>
                  <motion.button 
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this product?")) {
                        onDelete(product.id);
                        onClose();
                      }
                    }} 
                    className="px-4 py-2 rounded-full bg-white border-2 border-red-400 text-red-500 hover:bg-red-50 transition-all duration-300 flex items-center gap-2 shadow-sm"
                    whileHover={{ scale: 1.05, y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTrash /> <span className="font-medium">Delete Product</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Fullscreen Image View */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div 
              className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFullscreen(false)}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(false);
                }}
                className="absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-300"
                aria-label="Close fullscreen"
              >
                <FaTimes className="text-black text-xl" />
              </button>
              
              <img
                src={getOptimizedImageUrl(images[currentImageIndex], true)}
                alt={product.productName}
                className="max-w-full max-h-[90vh] object-contain"
              />
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-4 shadow-lg hover:bg-opacity-100 transition-all duration-300"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft className="text-black text-xl" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-4 shadow-lg hover:bg-opacity-100 transition-all duration-300"
                    aria-label="Next image"
                  >
                    <FaChevronRight className="text-black text-xl" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProductDetailsModal;
