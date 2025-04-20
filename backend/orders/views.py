import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from chat.models import ChatRoom, ChatMessage
from .models import Order, OrderItem, OrderStatus
from .serializers import FarmerDashboardSerializer, RecentOrderSerializer, OrderSerializer, OrderItemSerializer
from users.permissions import IsFarmer
from users.models import CustomUser
from products.models import Product
import logging

# Configure Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY

# Configure module logger
logger = logging.getLogger(__name__)

class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing orders with Stripe payment integration.
    
    Provides CRUD operations for orders with additional endpoints for
    payment processing, shipping, delivery, and payment confirmation.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        """
        Override the list method to add logging for debugging the serialized data.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"OrderViewSet list response data: {serializer.data}")
        return Response(serializer.data)

    def get_queryset(self):
        """
        Filter orders based on user role.
        
        Customers see only their own orders.
        Farmers see orders containing their products.
        Staff users see all orders.
        """
        user = self.request.user
        
        # Admin users can see all orders
        if user.is_staff:
            return self.queryset
        
        # Filter by user type
        if hasattr(user, 'user_type') and user.user_type == 'FARMER':
            try:
                # Farmers see orders containing their products
                # Use a safer approach by filtering products first, then orders
                farmer_products = Product.objects.filter(farmer=user)
                return self.queryset.filter(items__product__in=farmer_products).distinct()
            except Exception as e:
                logger.error(f"Error filtering orders for farmer {user.id}: {str(e)}")
                # Return empty queryset on error to prevent crashes
                return self.queryset.none()
        else:
            # Customers see only their own orders
            return self.queryset.filter(user=user)
    
    @action(detail=False, methods=['post'], url_path='create-payment-intent')
    def create_payment_intent(self, request):
        """
        Create a Stripe Payment Intent for a new order.
        
        This endpoint creates a payment intent with manual capture,
        saves the order with PENDING status, and creates a chat room
        for communication between customer and farmer.
        """
        try:
            # Log incoming request for debugging
            logger.info(f"Incoming create_payment_intent request from user {request.user.email}")
            logger.info(f"Request data: {request.data}")
            
            # Extract order data
            data = request.data
            product_id = data.get('product_id')
            quantity = int(data.get('quantity', 1))
            farmer_id = data.get('farmer_id')
            
            # Validate required fields
            if not all([product_id, farmer_id]):
                return Response(
                    {'error': 'Missing required fields'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get product and calculate total
            try:
                product = Product.objects.get(id=product_id)
                farmer = CustomUser.objects.get(id=farmer_id)
            except (Product.DoesNotExist, CustomUser.DoesNotExist):
                return Response(
                    {'error': 'Product or farmer not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Calculate total in cents for Stripe
            total_amount = int(float(product.price) * quantity * 100)
            
            # Create Stripe customer if needed
            stripe_customer = stripe.Customer.create(
                email=request.user.email,
                metadata={'user_id': request.user.id}
            )
            
            # Create payment intent with manual capture
            payment_intent = stripe.PaymentIntent.create(
                amount=total_amount,
                currency='usd',
                customer=stripe_customer.id,
                metadata={
                    'product_id': product_id,
                    'farmer_id': farmer_id,
                    'quantity': quantity
                },
                capture_method='manual',  # Important: funds are only authorized, not captured yet
                description=f'Order for {quantity} of {product.productName} from AgroConnect'
            )
            
            # Create order record
            order = Order.objects.create(
                user=request.user,
                total=total_amount / 100,  # Convert back to dollars for database
                status=OrderStatus.PENDING,
                payment_intent_id=payment_intent.id
            )
            
            # Create order item
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price_at_order_time=product.price
            )
            
            # Create chat room for order communication
            chat_room = ChatRoom.objects.create(
                room_id=f"order_{order.id}_{request.user.id}_{farmer.id}",
                customer=request.user,
                farmer=farmer,
                product=product,
                quantity=quantity,
                order=order,
                order_status=OrderStatus.PENDING
            )
            
            # Send notification message using ChatMessage model
            try:
                ChatMessage.objects.create(
                    room=chat_room,
                    sender=request.user,
                    message=f"{product.productName}\n\nHello! I've just purchased {quantity} unit{'s' if quantity != 1 else ''} of {product.productName}. I'd like to discuss delivery options and any other details about my order."
                )
                logger.info(f"Created notification message for order #{order.id}")
            except Exception as msg_error:
                # Log the error but continue with the order creation
                logger.error(f"Error creating notification message: {str(msg_error)}")
                # We don't want to fail the entire order just because the message creation failed
                
            # Return client secret for frontend to complete payment
            return Response({
                'client_secret': payment_intent.client_secret,
                'order_id': order.id
            }, status=status.HTTP_201_CREATED)
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='ship')
    def ship_order(self, request, pk=None):
        """
        Mark an order as shipped (farmer action).
        
        Updates the order status to SHIPPED and notifies the customer.
        """
        try:
            order = self.get_object()
            
            # Verify the order belongs to the farmer's products
            order_item = order.items.first()
            if not order_item or order_item.product.farmer != request.user:
                return Response(
                    {'error': 'You can only ship orders for your own products'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verify order is in PENDING status
            if order.status != OrderStatus.PENDING:
                return Response(
                    {'error': f'Order is not in {OrderStatus.PENDING} status'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update order status
            order.status = OrderStatus.SHIPPED
            order.save()
            
            # Update chat room status if it exists
            try:
                chat_room = order.chat_room
                chat_room.order_status = OrderStatus.SHIPPED
                chat_room.save()
                
                # Send notification
                ChatMessage.objects.create(
                    room=chat_room,
                    sender=request.user,
                    message=f"Order #{order.id} has been shipped."
                )
            except Exception as e:
                logger.error(f"Error updating chat room: {str(e)}")
            
            return Response({
                'message': 'Order marked as shipped',
                'order': OrderSerializer(order).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error shipping order: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='confirm-receipt')
    def confirm_receipt(self, request, pk=None):
        """
        Confirm receipt of an order (customer action).
        
        Updates the order status to DELIVERED and notifies the farmer.
        """
        try:
            order = self.get_object()
            
            # Verify order ownership
            if order.user != request.user:
                return Response(
                    {'error': 'You can only confirm receipt for your own orders'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verify order is in SHIPPED status
            if order.status != OrderStatus.SHIPPED:
                return Response(
                    {'error': f'Order is not in {OrderStatus.SHIPPED} status'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update order status
            order.status = OrderStatus.DELIVERED
            order.save()
            
            # Update chat room status if it exists
            try:
                chat_room = order.chat_room
                chat_room.order_status = OrderStatus.DELIVERED
                chat_room.save()
                
                # Send notification
                ChatMessage.objects.create(
                    room=chat_room,
                    sender=request.user,
                    message=f"Customer confirmed receipt for Order #{order.id}."
                )
            except Exception as e:
                logger.error(f"Error updating chat room: {str(e)}")
            
            return Response({
                'message': 'Receipt confirmed',
                'order': OrderSerializer(order).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error confirming receipt: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='confirm-payment')
    def confirm_payment(self, request, pk=None):
        """
        Confirm payment for a delivered order (customer action).
        
        Captures the authorized payment via Stripe and updates the order status to COMPLETED.
        """
        try:
            order = self.get_object()
            logger.info(f"confirm_payment called for order #{pk}, status={order.status}, user={request.user}")
            
            # Verify order ownership
            if order.user != request.user:
                return Response(
                    {'error': 'You can only confirm payment for your own orders'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verify order is in DELIVERED status
            if order.status != OrderStatus.DELIVERED:
                return Response(
                    {'error': f'Order is not in {OrderStatus.DELIVERED} status'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Ensure a payment intent exists
            if not order.payment_intent_id:
                logger.error(f"No payment_intent_id for order #{order.id}")
                return Response({'error': 'No payment intent found for this order'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Capture the payment via Stripe
            logger.info(f"Capturing payment for order #{order.id} with intent {order.payment_intent_id}")
            try:
                payment_intent = stripe.PaymentIntent.capture(
                    order.payment_intent_id,
                    expand=['charges']
                )
                # Log the entire payment intent structure for debugging
                logger.info(f"Captured PaymentIntent type: {type(payment_intent)}")
                logger.info(f"PaymentIntent keys: {dir(payment_intent) if hasattr(payment_intent, '__dict__') else 'No dir available'}")            
                # Try to get the charge ID using different approaches
                charge_id = None
                
                # Approach 1: Try to access as attribute
                if hasattr(payment_intent, 'charges'):
                    logger.info("Found charges attribute")
                    charges_data = getattr(payment_intent.charges, 'data', None)
                    if charges_data and len(charges_data) > 0:
                        charge_id = charges_data[0].id
                        logger.info(f"Found charge ID from attribute: {charge_id}")
                
                # Approach 2: Try to access as dictionary
                if not charge_id and hasattr(payment_intent, 'get'):
                    logger.info("Trying dictionary access")
                    charges = payment_intent.get('charges', {})
                    if charges and 'data' in charges and charges['data']:
                        charge_id = charges['data'][0].get('id')
                        logger.info(f"Found charge ID from dict: {charge_id}")
                
                # Approach 3: Directly fetch charges
                if not charge_id:
                    logger.info("Fetching charges directly from Stripe")
                    charges = stripe.Charge.list(payment_intent=order.payment_intent_id, limit=1)
                    if charges and charges.data:
                        charge_id = charges.data[0].id
                        logger.info(f"Found charge ID from direct fetch: {charge_id}")
                
                # Set the charge ID if found
                if charge_id:
                    order.stripe_charge_id = charge_id
                    logger.info(f"Set stripe_charge_id for order #{order.id}: {charge_id}")
                else:
                    logger.warning(f"Could not find charge ID for payment intent {order.payment_intent_id}")
            except stripe.error.StripeError as e:
                logger.error(f"Stripe capture error for order #{order.id}: {str(e)}")
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update order status
            order.status = OrderStatus.COMPLETED
            order.save()
            
            # Update chat room status if it exists
            try:
                chat_room = order.chat_room
                chat_room.order_status = OrderStatus.COMPLETED
                chat_room.save()
                
                # Send notification
                ChatMessage.objects.create(
                    room=chat_room,
                    sender=request.user,
                    message=f"Payment confirmed for Order #{order.id}. Funds have been released."
                )
            except Exception as e:
                logger.error(f"Error updating chat room: {str(e)}")
            
            return Response({
                'message': 'Payment confirmed and captured successfully',
                'order': OrderSerializer(order).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error confirming payment: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FarmerDashboardDataView(APIView):
    """
    API view to provide dashboard data for farmers.
    
    This endpoint aggregates order statistics and recent orders for the farmer's
    dashboard. It requires authentication and the user must have a farmer role.
    
    The response includes:
    - Total number of orders
    - Number of completed orders
    - Number of active orders
    - List of 5 most recent orders
    """
    # Use JWT token authentication
    authentication_classes = [JWTAuthentication]
    
    # Require authenticated users with farmer role
    permission_classes = [permissions.IsAuthenticated, IsFarmer]
    def get(self, request):
        """
        Handle GET requests to retrieve farmer dashboard data.
        
        Args:
            request: The HTTP request object containing user authentication.
            
        Returns:
            Response: JSON response with dashboard statistics and recent orders.
        """
        # Detailed logging for debugging authentication issues
        logger.info("Entering FarmerDashboardDataView.get method...")
        
        # Enhanced debug logging to track request details
        logger.info("==== DASHBOARD REQUEST DEBUG ====")
        logger.info(f"Request user: {request.user}")
        logger.info(f"Is authenticated: {request.user.is_authenticated}")
        logger.info(f"User ID: {getattr(request.user, 'id', 'Not available')}")
        logger.info(f"User type: {getattr(request.user, 'user_type', 'Not available')}")
        
        # Log request headers for debugging potential auth issues
        logger.info("Request headers:")
        for header, value in request.META.items():
            if header.startswith('HTTP_'):  # Only log HTTP headers
                logger.info(f"  {header}: {value}")
        
        # Double-check authentication status (redundant with permission classes but kept for logging)
        if not request.user.is_authenticated:
            logger.warning(f"User not authenticated: {request.user}")
            return Response({"error": "Authentication required"}, 
                          status=status.HTTP_401_UNAUTHORIZED)
                          
        # Permission check is now handled by IsFarmer permission class
        # The code below is kept for logging purposes only and doesn't affect the response
        if hasattr(request.user, 'user_type') and request.user.user_type != 'FARMER':
            logger.warning(f"Non-farmer user tried to access dashboard: {request.user.id}, type: {request.user.user_type}")
            # No need to return 403 here as the permission class will handle it automatically
            
        # Retrieve all chat rooms (orders) for the authenticated farmer
        queryset = ChatRoom.objects.filter(farmer=request.user)
        
        # Calculate dashboard statistics from the queryset
        dashboard_data = {
            # Total number of orders for this farmer
            'total_orders': queryset.count(),
            
            # Count of completed orders
            'completed_orders': queryset.filter(order_status=OrderStatus.COMPLETED).count(),
            
            # Count of active orders (both new and active status)
            'active_orders': queryset.filter(order_status__in=[OrderStatus.NEW, OrderStatus.ACTIVE]).count(),
            
            # Get 5 most recent orders, sorted by creation date (newest first)
            'recent_orders': queryset.order_by('-created_at')[:5]
        }
        
        # Serialize the recent orders data using the RecentOrderSerializer
        # This converts the model instances to JSON-compatible data
        recent_orders_serializer = RecentOrderSerializer(dashboard_data['recent_orders'], many=True)
        dashboard_data['recent_orders'] = recent_orders_serializer.data
        
        # Return the dashboard data as a JSON response
        return Response(dashboard_data)
