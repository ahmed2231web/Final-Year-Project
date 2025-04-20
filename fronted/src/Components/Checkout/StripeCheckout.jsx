import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../../Services/orderService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Load Stripe outside of component to avoid recreating it on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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

// CheckoutForm component that handles payment submission
const CheckoutForm = ({ orderData, token, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // Use the clientSecret and orderId from orderData (already set in Checkout.jsx from localStorage)
  const clientSecret = localStorage.getItem('payment_intent_client_secret');
  const orderId = orderData.orderId;

  // Validate that we have the necessary data
  useEffect(() => {
    console.log('StripeCheckout.jsx: Using clientSecret:', clientSecret, 'and orderId:', orderId);
    if (!clientSecret || !orderId) {
      setError('Missing payment information. Please try again from the cart.');
    }
  }, [clientSecret, orderId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements || !clientSecret) {
      // Stripe.js hasn't loaded yet or missing clientSecret
      setProcessing(false);
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: orderData.customerName || 'AgroConnect Customer',
            email: orderData.customerEmail || ''
          }
        }
      });

      if (result.error) {
        setError(result.error.message);
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'requires_capture') {
        // Payment authorized successfully but funds not captured yet
        console.log('StripeCheckout.jsx: Payment authorized successfully for orderId:', orderId);
        toast.success('Payment authorized! Awaiting farmer shipment.');
        
        // Call the success callback with order ID
        if (onSuccess) {
          console.log('StripeCheckout.jsx: Calling onSuccess with orderId:', orderId);
          onSuccess(orderId);
        }
        
        // Redirect to order details page
        navigate(`/orders/${orderId}`);
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
          <CardElement options={cardStyle} className="py-2" />
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
    </form>
  );
};

// Main StripeCheckout component that wraps the form with Elements provider
const StripeCheckout = ({ orderData, token, onSuccess }) => {
  return (
    <div className="w-full">
      {stripePromise && (
        <Elements stripe={stripePromise}>
          <CheckoutForm 
            orderData={orderData} 
            token={token} 
            onSuccess={onSuccess}
          />
        </Elements>
      )}
    </div>
  );
};

export default StripeCheckout;
