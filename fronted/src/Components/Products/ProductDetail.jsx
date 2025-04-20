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
        
        <div className="flex items-center gap-3">
          {/* View Cart Button */}
          <button 
            onClick={toggleCart}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            aria-label="View Cart"
          >
            <FaShoppingBag className="w-5 h-5" />
            <span>View Cart</span>
            {cartItems.length > 0 && (
              <span className="bg-white text-green-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
          
          {/* Checkout Button */}
          {cartItems.length > 0 && (
            <button 
              onClick={() => navigate('/customer/dashboard/cart')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              aria-label="Proceed to Checkout"
            >
              <FaCreditCard className="w-5 h-5" />
              <span>Checkout</span>
            </button>
          )}
        </div>
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
          
          {/* Stock Status */}
          <div className="mb-6">
            <span className={`text-sm ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'} font-medium`}>
              {product.stockQuantity > 0 
                ? `In Stock (${product.stockQuantity} available)` 
                : 'Out of Stock'}
            </span>
          </div>
          
          {/* Quantity Selector and Add to Cart */}
          {product.stockQuantity > 0 && (
            <div className="flex items-center mb-6">
              <label htmlFor="quantity" className="mr-3 text-gray-700">Quantity:</label>
              <input 
                type="number" 
                id="quantity"
                min="1"
                max={product.stockQuantity}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
              />
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleAddToCart}
                  className="ml-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium flex items-center"
                >
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </button>
                <button 
                  onClick={handleCheckout}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium flex items-center"
                >
                  <FaCreditCard className="mr-2" />
                  Buy Now
                </button>
              </div>
            </div>
          )}
          
          {/* Additional Product Details */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Category:</p>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Weight/Size:</p>
                <p className="font-medium">{product.weight || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600">Harvest Date:</p>
                <p className="font-medium">{product.harvestDate || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600">Expiry Date:</p>
                <p className="font-medium">{product.expiryDate || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Feedback Section */}
      <div className="mt-12">
        <ProductFeedback productId={productId} />
      </div>
    </div>
  );
};

export default ProductDetail;
