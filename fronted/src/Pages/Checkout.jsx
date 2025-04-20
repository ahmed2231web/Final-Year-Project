import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckout from '../Components/Checkout/StripeCheckout';
import { FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import authService from '../Services/autheServices';

// Load Stripe outside of component to avoid recreating it on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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
        // Get fresh token
        const freshToken = await authService.refreshToken();
        if (!freshToken) {
          toast.error('Your session has expired. Please login again.');
          navigate('/login');
          return;
        }
        setToken(freshToken);

        // Get client secret and other data from localStorage
        const storedClientSecret = localStorage.getItem('payment_intent_client_secret');
        const storedOrderId = localStorage.getItem('current_order_id');
        const storedFarmerId = localStorage.getItem('farmer_id');
        const storedOrderSummary = localStorage.getItem('last_order_summary');

        if (!storedClientSecret || !storedOrderId || !storedFarmerId) {
          toast.error('Payment information not found. Please try again.');
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
            setOrderSummary(parsedSummary);
          } catch (e) {
            console.error('Error parsing order summary:', e);
          }
        }
      } catch (error) {
        console.error('Error initializing checkout:', error);
        toast.error('Failed to initialize checkout. Please try again.');
        navigate('/customer/dashboard');
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
                  <ul className="space-y-3">
                    {orderSummary.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
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
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckout 
                  orderData={{
                    orderId: orderId,
                    farmerId: farmerId,
                    customerName: localStorage.getItem('user_name') || 'Customer',
                    customerEmail: localStorage.getItem('user_email') || ''
                  }}
                  token={token}
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
