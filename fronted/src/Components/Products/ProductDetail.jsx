import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLeaf, FaShoppingCart, FaMapMarkerAlt, FaArrowLeft, FaShoppingBag, FaCreditCard } from 'react-icons/fa';
import { getProductById } from '../../Services/apiCustomerProducts';
import ProductFeedback from './ProductFeedback';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToCart, addMultipleToCart, cartItems, toggleCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Function to calculate discounted price
  const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * (discount / 100));
  };

  const handleAddToCart = () => {
    if (product) {
      // Add the selected quantity to cart
      addMultipleToCart(product, quantity);
      toast.success(`Added ${quantity} ${product.productName} to cart`);
    }
  };

  const handleCheckout = () => {
    if (product) {
      // Add to cart and redirect to checkout
      addMultipleToCart(product, quantity);
      navigate('/customer/dashboard/cart');
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stockQuantity || 10)) {
      setQuantity(value);
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
        <button 
          onClick={() => navigate(-1)}
          className="text-green-600 hover:underline"
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Product not found</p>
        <button 
          onClick={() => navigate(-1)}
          className="text-green-600 hover:underline"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-green-600 hover:text-green-700"
        >
          <FaArrowLeft className="mr-2" /> Back to Products
        </button>
        
        {/* No buttons here as per requirements */}
      </div>
      
      {/* Floating Cart Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={toggleCart}
          className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="View Cart"
        >
          <FaShoppingBag className="w-6 h-6" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt={product.productName} 
            className="w-full h-auto rounded-lg shadow-md object-cover"
          />
          {/* Organic Badge */}
          {product.category === 'organic' && (
            <div className="absolute top-4 left-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
              <FaLeaf className="mr-1" /> Organic
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.productName}</h1>
          
          {/* Farmer Info */}
          <div className="flex items-center mb-4">
            <span className="text-gray-600">By </span>
            <span className="font-medium ml-1 text-green-700">{product.farmer_name}</span>
            <div className="flex items-center ml-4">
              <FaMapMarkerAlt className="text-gray-400 mr-1" />
              <span className="text-gray-500">{product.farmer_city}</span>
            </div>
          </div>
          
          {/* Price with discount if applicable */}
          <div className="flex items-center mb-6">
            {product.discount > 0 ? (
              <>
                <span className="text-3xl font-bold text-green-600">
                  ${calculateDiscountedPrice(product.price, product.discount).toFixed(2)}
                </span>
                <span className="text-xl text-gray-500 line-through ml-3">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                <span className="ml-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {product.discount}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-green-600">
                ${parseFloat(product.price).toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {/* Stock Status is now shown as a badge above */}
          
          {/* Stock Status Badge */}
          {product.stockQuantity > 0 ? (
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              In Stock ({product.stockQuantity} available)
            </div>
          ) : (
            <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Out of Stock
            </div>
          )}
          
          {/* Product Category */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Category</p>
                <p className="font-medium text-gray-800">{product.category || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Product Feedback Section */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Customer Reviews & Feedback</h2>
        <ProductFeedback productId={productId} />
      </div>
    </div>
  );
};

export default ProductDetail;
