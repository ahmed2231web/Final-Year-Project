from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Feedback, FeedbackResponse
from .serializers import FeedbackSerializer, FeedbackResponseSerializer
from orders.models import Order
from chat.models import ChatRoom, ChatMessage
import logging

logger = logging.getLogger(__name__)

class FeedbackViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing customer feedback.
    
    Provides CRUD operations for feedback with additional endpoints for
    farmer responses and filtering by product or farmer.
    """
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter queryset based on query parameters.
        
        Allows filtering by product, farmer, or only approved feedback.
        """
        queryset = self.queryset
        
        # Filter by product if specified
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        # Filter by farmer if specified
        farmer_id = self.request.query_params.get('farmer')
        if farmer_id:
            queryset = queryset.filter(farmer_id=farmer_id)
        
        # Filter by approval status for non-admin users
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_approved=True)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Create a new feedback entry for a completed order.
        
        Validates that:
        1. The order belongs to the requesting user
        2. The order is in COMPLETED status
        3. No feedback has been submitted for this order yet
        """
        try:
            order_id = request.data.get('order_id')
            rating = request.data.get('rating')
            comment = request.data.get('comment', '')
            
            if not order_id or not rating:
                return Response(
                    {'error': 'Order ID and rating are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                order = Order.objects.get(id=order_id)
            except Order.DoesNotExist:
                return Response(
                    {'error': 'Order not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Verify order ownership
            if order.user != request.user:
                return Response(
                    {'error': 'You can only submit feedback for your own orders'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verify order status
            if order.status != 'completed':
                return Response(
                    {'error': 'Feedback can only be submitted for completed orders'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if feedback already exists
            if hasattr(order, 'feedback'):
                return Response(
                    {'error': 'Feedback already submitted for this order'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the order item to reference product and farmer
            order_item = order.items.first()
            if not order_item:
                return Response(
                    {'error': 'No items found in order'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the feedback with explicit fetch of all required objects
            try:
                # Get product details safely
                product = order_item.product
                if not product:
                    return Response({'error': 'Product not found'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Log product details for debugging
                logger.debug(f"Order Item: {order_item.id}, Product ID: {product.id}, Product Name: {product.productName}")
                logger.debug(f"Product attributes: {dir(product)}")
                logger.debug(f"Has farmer attribute: {hasattr(product, 'farmer')}")
                
                # Get farmer directly from the product's farmer field
                if not hasattr(product, 'farmer'):
                    logger.error(f"Product {product.id} has no farmer attribute")
                    return Response({'error': 'Product has no associated farmer'}, status=status.HTTP_400_BAD_REQUEST)
                farmer = product.farmer
                
                logger.info(f"Creating feedback for order #{order.id}, product: {product.productName}, farmer: {farmer.id}")
                
                # Create feedback with explicit objects
                feedback = Feedback.objects.create(
                    order=order,
                    product=product,
                    farmer=farmer,
                    customer=request.user,
                    rating=rating,
                    comment=comment,
                    is_approved=False
                )
                logger.info(f"Successfully created feedback {feedback.id}")
            except Exception as e:
                logger.error(f"Error creating feedback object: {str(e)}")
                return Response({'error': f'Error creating feedback: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Send notification via chat
            try:
                chat_room = ChatRoom.objects.get(order=order)
                ChatMessage.objects.create(
                    room=chat_room,
                    sender=request.user,
                    message=f"New feedback submitted for Order #{order.id}: {rating} stars"
                )
            except Exception as e:
                logger.error(f"Error sending chat notification: {str(e)}")
            
            return Response(
                FeedbackSerializer(feedback).data, 
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error submitting feedback: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='respond')
    def respond_to_feedback(self, request, pk=None):
        """
        Allow farmers to respond to feedback on their products.
        
        Validates that:
        1. The feedback is for the farmer's product
        2. No response has been submitted yet
        """
        try:
            feedback = self.get_object()
            
            # Verify farmer ownership
            if feedback.farmer != request.user:
                return Response(
                    {'error': 'You can only respond to feedback for your own products'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if response already exists
            if hasattr(feedback, 'response'):
                return Response(
                    {'error': 'Response already submitted'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate response text
            response_text = request.data.get('response')
            if not response_text:
                return Response(
                    {'error': 'Response text is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the response
            feedback_response = FeedbackResponse.objects.create(
                feedback=feedback,
                farmer=request.user,
                response=response_text
            )
            
            # Send notification via chat
            try:
                chat_room = ChatRoom.objects.get(order=feedback.order)
                ChatMessage.objects.create(
                    room=chat_room,
                    sender=request.user,
                    message=f"Farmer responded to your feedback for Order #{feedback.order.id}"
                )
            except Exception as e:
                logger.error(f"Error sending chat notification: {str(e)}")
            
            return Response(
                FeedbackResponseSerializer(feedback_response).data, 
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error responding to feedback: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
