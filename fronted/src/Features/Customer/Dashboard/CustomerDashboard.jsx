import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductList from './ProductList';
import Cart from './Cart';
import { FaShoppingCart, FaSearch, FaBoxOpen } from 'react-icons/fa';
import { getAllProducts } from '../../../Services/apiCustomerProducts';
import LoadingSpinner from '../../../Components/Common/LoadingSpinner';
import authService from '../../../Services/autheServices';
import { useCart } from '../../../contexts/CartContext';

/**
 * Customer Dashboard Component
 * Displays products with filtering, search, and shopping cart functionality
 */
function CustomerDashboard() {
  const { cartItems, showCart, toggleCart, setShowCart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get user ID on initial render
  useEffect(() => {
    const getUserData = async () => {
      try {
        // Try to get user ID from localStorage
        let currentUserId = localStorage.getItem('user_id');
        
        // If not available, try to get from userData
        if (!currentUserId) {
          const userData = authService.getUserData();
          if (userData && userData.user_id) {
            currentUserId = userData.user_id;
            localStorage.setItem('user_id', currentUserId);
          }
        }
        
        // If still not available, try to fetch from API
        if (!currentUserId && authService.isAuthenticated()) {
          const userData = await authService.getUserType();
          if (userData && userData.user_id) {
            currentUserId = userData.user_id;
            localStorage.setItem('user_id', currentUserId);
          }
        }
        
        setUserId(currentUserId);
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    };
    
    getUserData();
  }, []);



  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getAllProducts();
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(data.map(product => product.category))];
        setCategories(uniqueCategories);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (product.farmer_name && product.farmer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.farmer_city && product.farmer_city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4">
      {/* Search and Cart Bar */}
      <div className="flex items-center justify-between mb-8 mt-4">
        <div className="relative w-full max-w-xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, farmers, or cities..."
              className="w-full p-3 pl-12 border-2 border-green-500 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm text-gray-700"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <FaSearch className="text-green-500 text-lg" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Link 
            to="/customer/orders"
            className="relative p-3 text-gray-700 hover:text-green-600 transition-colors mr-4"
            aria-label="My Orders"
          >
            <FaBoxOpen className="w-6 h-6" />
          </Link>
          
          <button 
            onClick={toggleCart}
            className="relative p-3 text-gray-700 hover:text-green-600 transition-colors"
            aria-label="Shopping Cart"
          >
            <FaShoppingCart className="w-7 h-7" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Farm Fresh Products</h1>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                categoryFilter === category 
                  ? 'bg-green-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' 
                ? 'All Products' 
                : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Loading, Error, or Product Grid */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductList products={filteredProducts} addToCart={addToCart} />
          </div>
        )}
      </div>
      
      {/* Shopping Cart Sidebar */}
      <Cart 
        isOpen={showCart} 
        closeCart={toggleCart} 
      />
    </div>
  );
}

export default CustomerDashboard;