import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckout from '../Components/Checkout/StripeCheckout';
import { FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import authService from '../Services/authService';
import { getAuthToken, refreshToken } from '../Services/autheServices';
import { getProductById } from '../Services/apiCustomerProducts';

// Load Stripe outside of component to avoid recreating it on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Log Stripe key to verify it's loaded correctly
console.log('Stripe Public Key available:', !!import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Checkout = () => {
  const navigate = useNavigate();
  const [orderSummary, setOrderSummary] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [farmerId, setFarmerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const initCheckout = async () => {
      try {
        console.log('Initializing checkout page...');
        
        // Try to get the token, first checking if we have an access token directly
        let currentToken = null;
        
        try {
          // First try to get access token directly from both auth services
          // This ensures we check both localStorage and sessionStorage
          currentToken = authService.getToken() || getAuthToken();
          console.log('Using existing access token:', currentToken ? 'exists' : 'missing');
          
          // If we have a token, verify it's still valid
          if (currentToken) {
            // Set the token we'll use for the checkout
            setToken(currentToken);
          } else {
            // Try refreshing as a fallback using both auth services
            try {
              // Try authService first
              const freshToken = await authService.refreshToken();
              if (freshToken) {
                console.log('Successfully refreshed token with authService');
                setToken(freshToken.access || freshToken);
                currentToken = freshToken.access || freshToken;
              }
            } catch (innerError) {
              // If that fails, try autheServices
              try {
                const freshToken = await refreshToken();
                if (freshToken) {
                  console.log('Successfully refreshed token with autheServices');
                  setToken(freshToken.access || freshToken);
                  currentToken = freshToken.access || freshToken;
                }
              } catch (secondError) {
                console.log('Both token refresh attempts failed');
                // Continue without a token
              }
            }
          }
        } catch (tokenError) {
          console.warn('Token refresh failed, but will continue with stored data:', tokenError.message);
          // We'll continue even without a fresh token as the client secret should be enough for payment
        }
        
        // Even if we don't have a token, we'll try to proceed with the checkout
        // as long as we have the client secret, since that's what Stripe needs

        // Get client secret and other data from localStorage
        const storedClientSecret = localStorage.getItem('payment_intent_client_secret');
        const storedOrderId = localStorage.getItem('current_order_id');
        const storedFarmerId = localStorage.getItem('farmer_id');
        const storedOrderSummary = localStorage.getItem('last_order_summary');
        
        console.log('Retrieved from localStorage:',{
          clientSecret: storedClientSecret ? `${storedClientSecret.substring(0, 10)}...` : null,
          orderId: storedOrderId,
          farmerId: storedFarmerId,
          orderSummary: storedOrderSummary ? 'exists' : null
        });

        if (!storedClientSecret || !storedOrderId || !storedFarmerId) {
          console.error('Missing required checkout data:', {
            hasClientSecret: !!storedClientSecret,
            hasOrderId: !!storedOrderId,
            hasFarmerId: !!storedFarmerId
          });
          toast.error('Payment information not found. Please try again.');
          navigate('/customer/dashboard');
          return;
        }
        
        // Log if we're proceeding without a valid token
        if (!currentToken) {
          console.warn('Proceeding with checkout without a valid token. ' + 
                      'This might work for the payment confirmation but could cause issues with order updates.');
        }
        
        // Validate client secret format
        if (storedClientSecret === 'placeholder' || !storedClientSecret.startsWith('pi_')) {
          console.error('Invalid client secret format:', storedClientSecret.substring(0, 10));
          toast.error('Invalid payment information. Please try again from the cart.');
          navigate('/customer/dashboard');
          return;
        }

        setClientSecret(storedClientSecret);
        setOrderId(storedOrderId);
        setFarmerId(storedFarmerId);

        if (storedOrderSummary) {
          try {
            const parsedSummary = JSON.parse(storedOrderSummary);
            console.log('Parsed Order Summary:', parsedSummary);
            
            // Ensure each item has an image_url property
            if (parsedSummary.items && Array.isArray(parsedSummary.items)) {
              // Fetch product details for each item to get images
              const fetchProductImages = async () => {
                try {
                  const enhancedItems = await Promise.all(parsedSummary.items.map(async (item) => {
                    // If item already has image_url and it's valid, use it
                    if (item.image_url && item.image_url !== 'https://via.placeholder.com/100') {
                      return item;
                    }
                    
                    // Try to get image from cart items in localStorage
                    const cartItems = JSON.parse(localStorage.getItem('agroConnectCart') || '[]');
                    const cartItem = cartItems.find(ci => ci.id === item.id || ci.id === item.product_id);
                    
                    if (cartItem && cartItem.imageUrl && cartItem.imageUrl !== 'https://via.placeholder.com/100') {
                      return { ...item, image_url: cartItem.imageUrl };
                    }
                    
                    // If not found in cart, try to fetch product details
                    try {
                      const productId = item.id || item.product_id;
                      if (productId) {
                        const productData = await getProductById(productId);
                        if (productData && productData.imageUrl) {
                          // Store image URL in localStorage for future use
                          localStorage.setItem(`product_image_${productId}`, productData.imageUrl);
                          return { ...item, image_url: productData.imageUrl };
                        }
                      }
                    } catch (err) {
                      console.error(`Error fetching product ${item.id || item.product_id}:`, err);
                    }
                    
                    return item;
                  }));
                  
                  parsedSummary.items = enhancedItems;
                  setOrderSummary(parsedSummary);
                } catch (err) {
                  console.error('Error fetching product images:', err);
                }
              };
              
              fetchProductImages();
            }
            
            setOrderSummary(parsedSummary);
          } catch (e) {
            console.error('Error parsing order summary:', e);
          }
        }
      } catch (error) {
        console.error('Error initializing checkout:', error);
        
        // Check if we have enough to continue anyway
        const clientSecretExists = localStorage.getItem('payment_intent_client_secret');
        
        if (clientSecretExists && error.message && error.message.includes('refresh token')) {
          // We can continue despite the refresh token error if we have a client secret
          console.warn('Continuing with checkout despite token refresh error');
          setLoading(false);
          // We'll try to proceed with the checkout even without a fresh token
        } else {
          toast.error('Failed to initialize checkout. Please try again.');
          navigate('/customer/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [navigate]);

  const handlePaymentSuccess = (orderId) => {
    // Clear checkout data from localStorage
    localStorage.removeItem('payment_intent_client_secret');
    localStorage.removeItem('current_order_id');
    localStorage.removeItem('farmer_id');
    localStorage.removeItem('product_id');
    
    toast.success('Payment authorized successfully!');
    
    // Navigate to order details page
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-green-600 mr-4"
            aria-label="Go back"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold flex items-center">
            <FaShoppingBag className="mr-2" /> Secure Checkout
          </h1>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {orderSummary ? (
              <>
                <div className="border-b pb-4 mb-4">
                  <ul className="space-y-4">
                    {orderSummary.items.map((item, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden border">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name || item.productName} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                
                                // Try to fetch image from product if error occurs
                                const productId = item.id || item.product_id;
                                if (productId) {
                                  getProductById(productId).then(productData => {
                                    if (productData && productData.imageUrl) {
                                      e.target.src = productData.imageUrl;
                                      // Update the order summary with the new image URL
                                      const updatedSummary = {...orderSummary};
                                      const itemIndex = updatedSummary.items.findIndex(i => 
                                        (i.id === productId || i.product_id === productId)
                                      );
                                      if (itemIndex >= 0) {
                                        updatedSummary.items[itemIndex].image_url = productData.imageUrl;
                                        setOrderSummary(updatedSummary);
                                      }
                                    }
                                  }).catch(err => console.error('Error fetching product image:', err));
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-xs text-gray-500">Loading image...</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-grow flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${orderSummary.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>${orderSummary.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t mt-2">
                    <span>Total</span>
                    <span>${orderSummary.totalWithShipping.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-6 text-sm text-gray-500">
                  <p className="mb-2">
                    <strong>Note:</strong> Your payment will be authorized now but only captured 
                    after you confirm receipt of your order.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Order summary not available</p>
            )}
          </div>
          
          {/* Payment Form */}
          <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            
            {clientSecret && (
              <Elements 
                stripe={stripePromise} 
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#32925e',
                      colorBackground: '#ffffff',
                      colorText: '#32325d',
                      colorDanger: '#fa755a',
                      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                    }
                  },
                }}
              >
                <StripeCheckout 
                  orderData={{
                    orderId: orderId,
                    farmerId: farmerId,
                    clientSecret: clientSecret, // Pass client secret to child component
                    customerName: localStorage.getItem('user_name') || 'Customer',
                    customerEmail: localStorage.getItem('user_email') || ''
                  }}
                  token={localStorage.getItem('access_token')} // Use direct localStorage access for token
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
