import stripe
import json
import logging
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import Order, OrderStatus

# Configure logger
logger = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    Webhook handler for Stripe events.
    
    This endpoint receives and processes webhook events from Stripe,
    such as payment confirmations, failures, and disputes.
    """
    # Debug logging
    logger.info(f"Received webhook request at {request.path}")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    # Get the webhook payload and signature header
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    # Debug logging for webhook verification
    logger.info(f"Webhook signature header present: {bool(sig_header)}")
    logger.info(f"Webhook secret configured: {bool(settings.STRIPE_WEBHOOK_SECRET)}")
    
    if not sig_header:
        logger.error("No Stripe signature found in request headers")
        return HttpResponse("No Stripe signature found", status=400)
    
    if not settings.STRIPE_WEBHOOK_SECRET:
        logger.error("STRIPE_WEBHOOK_SECRET not configured in settings")
        return HttpResponse("Webhook secret not configured", status=500)
    
    try:
        # Verify the webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
        logger.info(f"Successfully verified webhook: {event['type']} with ID {event['id']}")
    except ValueError as e:
        # Invalid payload
        logger.error(f"Invalid webhook payload: {str(e)}")
        return HttpResponse(f"Invalid payload: {str(e)}", status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        logger.error(f"Invalid webhook signature: {str(e)}")
        return HttpResponse(f"Invalid signature: {str(e)}", status=400)
    except Exception as e:
        logger.error(f"Unexpected error processing webhook: {str(e)}")
        return HttpResponse(f"Unexpected error: {str(e)}", status=500)
    
    # Handle specific event types
    if event['type'] == 'payment_intent.succeeded':
        handle_payment_intent_succeeded(event['data']['object'])
    elif event['type'] == 'payment_intent.payment_failed':
        handle_payment_intent_failed(event['data']['object'])
    elif event['type'] == 'charge.refunded':
        handle_charge_refunded(event['data']['object'])
    
    # Return a success response to Stripe
    return HttpResponse(status=200)

def handle_payment_intent_succeeded(payment_intent):
    """Handle successful payment intent events."""
    try:
        logger.info(f"Payment intent succeeded: {payment_intent['id']}")
        
        # Find the associated order
        order = Order.objects.filter(payment_intent_id=payment_intent['id']).first()
        if not order:
            logger.error(f"Order not found for payment intent: {payment_intent['id']}")
            return
        
        # If the payment was automatically captured (not our default flow, but possible)
        if payment_intent.get('status') == 'succeeded' and payment_intent.get('capture_method') != 'manual':
            order.status = OrderStatus.COMPLETED
            
            # Store charge ID if available
            if payment_intent.get('charges', {}).get('data'):
                order.stripe_charge_id = payment_intent['charges']['data'][0]['id']
            
            order.save()
            logger.info(f"Order {order.id} marked as completed")
    
    except Exception as e:
        logger.error(f"Error handling payment_intent.succeeded: {str(e)}")

def handle_payment_intent_failed(payment_intent):
    """Handle failed payment intent events."""
    try:
        logger.info(f"Payment intent failed: {payment_intent['id']}")
        
        # Find the associated order
        order = Order.objects.filter(payment_intent_id=payment_intent['id']).first()
        if not order:
            logger.error(f"Order not found for payment intent: {payment_intent['id']}")
            return
        
        # Update order status to indicate failure
        order.status = OrderStatus.NEW  # Reset to NEW so customer can try again
        order.save()
        logger.info(f"Order {order.id} marked as new due to payment failure")
    
    except Exception as e:
        logger.error(f"Error handling payment_intent.payment_failed: {str(e)}")

def handle_charge_refunded(charge):
    """Handle refunded charge events."""
    try:
        logger.info(f"Charge refunded: {charge['id']}")
        
        # Find the associated order
        order = Order.objects.filter(stripe_charge_id=charge['id']).first()
        if not order:
            logger.error(f"Order not found for charge: {charge['id']}")
            return
        
        # Check if it's a full or partial refund
        if charge['amount_refunded'] == charge['amount']:
            logger.info(f"Full refund processed for order {order.id}")
            # For now, we'll keep the order status as COMPLETED
            # In a more complex system, you might want a REFUNDED status
        else:
            logger.info(f"Partial refund processed for order {order.id}")
            # Similarly, you might want a PARTIALLY_REFUNDED status
    
    except Exception as e:
        logger.error(f"Error handling charge.refunded: {str(e)}")
