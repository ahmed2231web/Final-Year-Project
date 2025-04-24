import React, { useState, useEffect } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
  PaymentElement
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Card element styling
const cardStyle = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

// Debug helper function
const logPaymentData = (data, prefix = '') => {
  if (!data) {
    console.log(`${prefix} data is null or undefined`);
    return;
  }
  
  // Create a safe copy with sensitive data partially masked
  const safeData = {...data};
  if (safeData.clientSecret && typeof safeData.clientSecret === 'string') {
    safeData.clientSecret = safeData.clientSecret.substring(0, 10) + '...';
  }
  
  console.log(`${prefix}:`, safeData);
};

// CheckoutForm component that handles payment submission
const CheckoutForm = ({ orderData, token, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [hasValidToken, setHasValidToken] = useState(!!token);
  const navigate = useNavigate();

  // Client secret can come from two places: directly from orderData or from localStorage
  // Prefer the one from orderData as it's fresher
  const clientSecret = orderData?.clientSecret || localStorage.getItem('payment_intent_client_secret');
  const orderId = orderData?.orderId;

  // Add enhanced debugging to trace the values
  useEffect(() => {
    console.log('StripeCheckout - Component Mounted');
    logPaymentData(orderData, 'StripeCheckout orderData');
    console.log('StripeCheckout - Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'missing');
    console.log('StripeCheckout - Stripe loaded:', !!stripe);
    console.log('StripeCheckout - Elements loaded:', !!elements);
    
    // Get token from multiple sources to ensure we have it if available
    const effectiveToken = token || localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    console.log('StripeCheckout - Has valid token:', !!effectiveToken);
    
    // Update token validity state
    setHasValidToken(!!effectiveToken);
  }, [orderData, clientSecret, stripe, elements, token]);

  // Validate that we have the necessary data
  useEffect(() => {
    console.log('StripeCheckout.jsx: Validating payment data');
    
    if (!stripe || !elements) {
      console.warn('Stripe or Elements not loaded yet');
      return;
    }
    
    if (!clientSecret) {
      console.error('Missing client secret');
      setError('Missing payment information. Please try again from the cart.');
      return;
    }
    
    if (!orderId) {
      console.error('Missing order ID');
      setError('Missing order information. Please try again from the cart.');
      return;
    }
    
    console.log('StripeCheckout.jsx: Payment data validation passed');
  }, [clientSecret, orderId, stripe, elements]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements || !clientSecret) {
      // Stripe.js hasn't loaded yet or missing clientSecret
      setProcessing(false);
      return;
    }

    try {
      // Make sure we have all required data before proceeding
      if (!clientSecret || clientSecret === 'placeholder') {
        throw new Error('Invalid client secret. Please try again from the cart.');
      }
      
      if (!elements) {
        throw new Error('Stripe Elements not initialized. Please refresh the page.');
      }

      console.log('Confirming payment with Stripe using client secret:', clientSecret.substring(0, 10) + '...');
      
      let result;
      
      // Use the proper confirmation method based on the client secret format
      if (clientSecret.startsWith('pi_')) {
        // Using Payment Intent flow
        console.log('Using confirmCardPayment API');
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: orderData?.customerName || 'AgroConnect Customer',
              email: orderData?.customerEmail || ''
            }
          }
        });
      } else {
        // Using generic confirmation
        console.log('Using confirm API');
        const { error: submitError } = await elements.submit();
        if (submitError) {
          throw submitError;
        }
        
        result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/payment-success',
          },
          redirect: 'if_required'
        });
      }

      if (result.error) {
        console.error('Payment confirmation error:', result.error);
        setError(result.error.message);
        toast.error(result.error.message || 'Payment failed');
      } else if (result.paymentIntent && 
                (result.paymentIntent.status === 'requires_capture' || 
                 result.paymentIntent.status === 'succeeded' || 
                 result.paymentIntent.status === 'processing')) {
        // Payment authorized successfully but funds not captured yet
        console.log('StripeCheckout.jsx: Payment authorized successfully for orderId:', orderId);
        console.log('StripeCheckout.jsx: Payment status:', result.paymentIntent.status);
        toast.success('Payment authorized! Awaiting farmer shipment.');
        
        // Store payment status in localStorage for the order confirmation step
        localStorage.setItem('payment_status', result.paymentIntent.status);
        localStorage.setItem('payment_intent_id', result.paymentIntent.id);
        
        // Call the success callback with order ID
        if (onSuccess) {
          console.log('StripeCheckout.jsx: Calling onSuccess with orderId:', orderId);
          onSuccess(orderId);
        }
        
        // Store payment success info in localStorage in case token is missing
        localStorage.setItem('payment_success', 'true');
        localStorage.setItem('payment_success_order_id', orderId);
        
        // Redirect to order details page
        if (hasValidToken) {
          // Add a small delay to ensure all localStorage updates are complete
          setTimeout(() => {
            navigate(`/orders/${orderId}`);
          }, 500);
        } else {
          // If we don't have a valid token, we should redirect to a page that doesn't require authentication
          // or a page that can handle re-authentication
          toast.success('Payment successful! Redirecting to dashboard.');
          setTimeout(() => {
            navigate('/customer/dashboard');
          }, 500);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred during payment processing');
      toast.error('Payment failed. Please try again.');
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Payment Details</h2>
        <p className="text-gray-600 mb-4">
          Your payment will be authorized but only captured after you confirm receipt of your order.
        </p>
        
        <div className="p-4 border rounded-md bg-white">
          {/* Use the appropriate payment element based on the type of secret we have */}
          {clientSecret && clientSecret.startsWith('pi_') ? (
            <CardElement options={cardStyle} className="py-2" />
          ) : (
            <PaymentElement />
          )}
        </div>
        
        {error && (
          <div className="text-red-500 mt-2 text-sm">{error}</div>
        )}
      </div>

      <button
        type="submit"
        disabled={processing || !stripe || !clientSecret}
        className={`w-full py-3 px-6 rounded-md text-white font-medium transition-colors ${
          processing || !stripe || !clientSecret
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
      
      {!hasValidToken && (
        <div className="mt-3 text-sm text-amber-600">
          <p>Note: Your session may have expired, but you can still complete payment.</p>
        </div>
      )}
    </form>
  );
};

// Main StripeCheckout component - note we don't need to wrap with Elements here since
// it's already wrapped in the parent Checkout.jsx component
const StripeCheckout = ({ orderData, token, onSuccess }) => {
  return (
    <div className="w-full">
      <CheckoutForm 
        orderData={orderData} 
        token={token} 
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default StripeCheckout;
