import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [userId, setUserId] = useState(null);

  // Initialize user ID and cart items
  useEffect(() => {
    // Get user ID from localStorage
    const currentUserId = localStorage.getItem('user_id');
    setUserId(currentUserId);

    // Load cart items
    loadCartItems(currentUserId);
  }, []);

  // Load cart items from localStorage
  const loadCartItems = (currentUserId) => {
    try {
      // If user is logged in, try to load user-specific cart
      if (currentUserId) {
        const userCartKey = `agroConnectCart_${currentUserId}`;
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
        if (currentUserId) {
          localStorage.setItem(`agroConnectCart_${currentUserId}`, savedCart);
        }
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      localStorage.removeItem('agroConnectCart');
      if (currentUserId) {
        localStorage.removeItem(`agroConnectCart_${currentUserId}`);
      }
    }
  };

  // Save cart items to localStorage
  useEffect(() => {
    // Always save to general cart for non-logged-in users
    localStorage.setItem('agroConnectCart', JSON.stringify(cartItems));
    
    // If user is logged in, also save to user-specific cart
    if (userId) {
      localStorage.setItem(`agroConnectCart_${userId}`, JSON.stringify(cartItems));
    }
  }, [cartItems, userId]);

  // Add product to cart
  const addToCart = (product) => {
    // Create a cart item with necessary fields
    const cartItem = {
      id: product.id,
      productName: product.productName,
      price: product.discount > 0 
        ? product.price - (product.price * (product.discount / 100))
        : product.price,
      originalPrice: product.price,
      discount: product.discount,
      quantity: 1,
      imageUrl: product.imageUrl || 'https://via.placeholder.com/100',
      farmer_id: product.farmer_id || product.farmer,
      farmer_name: product.farmer_name,
      farmer_city: product.farmer_city,
      stockQuantity: product.stockQuantity
    };

    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => 
        item.id === cartItem.id && item.farmer_id === cartItem.farmer_id
      );
      
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        const updatedItems = [...prevItems];
        
        // Check stock limit
        if (updatedItems[existingItemIndex].quantity < cartItem.stockQuantity) {
          updatedItems[existingItemIndex].quantity += 1;
          return updatedItems;
        } else {
          toast.error(`Cannot add more. Maximum stock (${cartItem.stockQuantity}) reached.`);
          return prevItems;
        }
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, cartItem];
      }
    });
    
    toast.success(`Added ${product.productName} to cart!`);
  };

  // Add multiple of the same product to cart
  const addMultipleToCart = (product, quantity) => {
    if (quantity <= 0) return;
    
    // Create a cart item with necessary fields
    const cartItem = {
      id: product.id,
      productName: product.productName,
      price: product.discount > 0 
        ? product.price - (product.price * (product.discount / 100))
        : product.price,
      originalPrice: product.price,
      discount: product.discount,
      quantity: 1,
      imageUrl: product.imageUrl || 'https://via.placeholder.com/100',
      farmer_id: product.farmer_id || product.farmer,
      farmer_name: product.farmer_name,
      farmer_city: product.farmer_city,
      stockQuantity: product.stockQuantity
    };

    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => 
        item.id === cartItem.id && item.farmer_id === cartItem.farmer_id
      );
      
      if (existingItemIndex >= 0) {
        // Item exists, add quantity
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Check stock limit
        if (newQuantity <= cartItem.stockQuantity) {
          updatedItems[existingItemIndex].quantity = newQuantity;
          return updatedItems;
        } else {
          toast.error(`Cannot add ${quantity} more. Maximum stock (${cartItem.stockQuantity}) reached.`);
          return prevItems;
        }
      } else {
        // Item doesn't exist, add new item with specified quantity
        if (quantity <= cartItem.stockQuantity) {
          return [...prevItems, {...cartItem, quantity}];
        } else {
          toast.error(`Cannot add ${quantity}. Maximum stock (${cartItem.stockQuantity}) reached.`);
          return prevItems;
        }
      }
    });
    
    toast.success(`Added ${quantity} ${product.productName} to cart!`);
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Update product quantity in cart
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === productId) {
          // Check stock limit
          if (newQuantity <= item.stockQuantity) {
            return { ...item, quantity: newQuantity };
          } else {
            toast.error(`Cannot add more. Maximum stock (${item.stockQuantity}) reached.`);
            return item;
          }
        }
        return item;
      });
    });
  };

  // Clear cart
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

  // Calculate total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get cart item count
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      showCart,
      addToCart,
      addMultipleToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart,
      setShowCart,
      getTotalPrice,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
