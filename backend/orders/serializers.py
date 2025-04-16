from rest_framework import serializers
from chat.models import ChatRoom

class RecentOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for recent orders in the farmer dashboard.
    
    This serializer converts ChatRoom model instances (which represent orders in the system)
    into JSON representations for the API, specifically for displaying recent orders
    in the farmer dashboard UI.
    """
    # Custom fields that pull data from related models using source parameter
    customer_name = serializers.CharField(source='customer.full_name')  # Get customer name from related Customer model
    product_name = serializers.CharField(source='product.productName')  # Get product name from related Product model
    
    class Meta:
        model = ChatRoom  # The model to serialize
        fields = [
            'room_id',       # Unique identifier for the chat room/order
            'customer_name', # Name of the customer who placed the order
            'product_name',  # Name of the product being ordered
            'quantity',      # Quantity of the product ordered
            'order_status',  # Current status of the order (new, active, completed)
            'created_at'     # Timestamp when the order was created
        ]

class FarmerDashboardSerializer(serializers.Serializer):
    """
    Main serializer for the farmer dashboard data.
    
    This serializer doesn't correspond to a specific model but instead represents
    a custom data structure for the farmer dashboard, including order statistics
    and a list of recent orders.
    
    Note: This uses Serializer instead of ModelSerializer since it doesn't map directly
    to a single model but combines data from multiple sources.
    """
    # Order statistics fields
    total_orders = serializers.IntegerField()      # Total number of orders for this farmer
    completed_orders = serializers.IntegerField()  # Number of completed orders
    active_orders = serializers.IntegerField()     # Number of active and new orders
    
    # Nested serializer for recent orders - the 'many=True' indicates this is a list
    recent_orders = RecentOrderSerializer(many=True)  # List of recent orders using the RecentOrderSerializer
