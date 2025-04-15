from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from chat.models import ChatRoom, OrderStatus
from .serializers import FarmerDashboardSerializer, RecentOrderSerializer
from users.permissions import IsFarmer
import logging

logger = logging.getLogger(__name__)

class FarmerDashboardDataView(APIView):
    """
    API view to provide dashboard data for farmers
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsFarmer]
    def get(self, request):
        logger.info("Entering FarmerDashboardDataView.get method...") # <-- ADD THIS LINE
        # Enhanced debug logging
        logger.info("==== DASHBOARD REQUEST DEBUG ====")
        logger.info(f"Request user: {request.user}")
        logger.info(f"Is authenticated: {request.user.is_authenticated}")
        logger.info(f"User ID: {getattr(request.user, 'id', 'Not available')}")
        logger.info(f"User type: {getattr(request.user, 'user_type', 'Not available')}")
        
        # Log request headers
        logger.info("Request headers:")
        for header, value in request.META.items():
            if header.startswith('HTTP_'):
                logger.info(f"  {header}: {value}")
        
        # Check authentication and farmer status
        if not request.user.is_authenticated:
            logger.warning(f"User not authenticated: {request.user}")
            return Response({"error": "Authentication required"}, 
                          status=status.HTTP_401_UNAUTHORIZED)
                          
        # Permission check is now handled by IsFarmer permission class
        # The code below is kept for logging purposes only
        if hasattr(request.user, 'user_type') and request.user.user_type != 'FARMER':
            logger.warning(f"Non-farmer user tried to access dashboard: {request.user.id}, type: {request.user.user_type}")
            # No need to return 403 here as the permission class will handle it
            
        # Get all chat rooms for this farmer
        queryset = ChatRoom.objects.filter(farmer=request.user)
        
        # Calculate statistics
        dashboard_data = {
            'total_orders': queryset.count(),
            'completed_orders': queryset.filter(order_status=OrderStatus.COMPLETED).count(),
            'active_orders': queryset.filter(order_status__in=[OrderStatus.NEW, OrderStatus.ACTIVE]).count(),
            'recent_orders': queryset.order_by('-created_at')[:5]  # Get 5 most recent orders
        }
        
        # Serialize recent orders
        recent_orders_serializer = RecentOrderSerializer(dashboard_data['recent_orders'], many=True)
        dashboard_data['recent_orders'] = recent_orders_serializer.data
        
        return Response(dashboard_data)
