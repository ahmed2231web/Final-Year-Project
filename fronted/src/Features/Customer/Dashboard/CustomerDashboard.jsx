import { useState, useEffect } from 'react';
import ProductList from './ProductList';
import Cart from './Cart';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';
import { getAllProducts, getProductCategories } from '../../../Services/apiCustomerProducts';
import LoadingSpinner from '../../../Components/Common/LoadingSpinner';
import authService from '../../../services/authService';

/**
 * Customer Dashboard Component
 * Displays products with filtering, search, and shopping cart functionality
 */
function CustomerDashboard() {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
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

  // Load cart items from localStorage on initial render and when userId changes
  useEffect(() => {
    const loadCartItems = () => {
      try {
        // If user is logged in, try to load user-specific cart
        if (userId) {
          const userCartKey = `agroConnectCart_${userId}`;
          const savedUserCart = localStorage.getItem(userCartKey);
          
          if (savedUserCart) {
            setCartItems(JSON.parse(savedUserCart));
            return;
          }
        }
        
        // Fallback to general cart if no user-specific cart found
        const savedCart = localStorage.getItem('agroConnectCart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
          
          // If user is now logged in, migrate the general cart to user-specific cart
          if (userId) {
            localStorage.setItem(`agroConnectCart_${userId}`, savedCart);
            // Keep the general cart for now as a backup
          }
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        localStorage.removeItem('agroConnectCart');
        if (userId) {
          localStorage.removeItem(`agroConnectCart_${userId}`);
        }
      }
    };
    
    loadCartItems();
  }, [userId]);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    // Always save to general cart for non-logged-in users
    localStorage.setItem('agroConnectCart', JSON.stringify(cartItems));
    
    // If user is logged in, also save to user-specific cart
    if (userId) {
      localStorage.setItem(`agroConnectCart_${userId}`, JSON.stringify(cartItems));
    }
  }, [cartItems, userId]);

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

  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  // Update product quantity in cart
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Clear cart after checkout
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('agroConnectCart');
    if (userId) {
      localStorage.removeItem(`agroConnectCart_${userId}`);
    }
  };

  // Toggle cart visibility
  const toggleCart = () => {
    setShowCart(!showCart);
  };

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
        
        <button 
          onClick={toggleCart}
          className="ml-6 relative p-3 text-gray-700 hover:text-green-600 transition-colors"
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
        cartItems={cartItems} 
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
      />
    </div>
  );
}

export default CustomerDashboard;