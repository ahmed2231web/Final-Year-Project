from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from chat.models import ChatRoom, OrderStatus
from .serializers import FarmerDashboardSerializer, RecentOrderSerializer
from users.permissions import IsFarmer
import logging

# Configure module logger
logger = logging.getLogger(__name__)

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
