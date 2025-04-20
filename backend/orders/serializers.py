from rest_framework import serializers
from chat.models import ChatRoom
from .models import Order, OrderItem
from products.models import Product

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

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for order items.
    
    Includes product details and quantity information.
    """
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price_at_order_time']
    
    def get_product_name(self, obj):
        return obj.product.productName
    
    def get_product_image(self, obj):
        if hasattr(obj.product, 'image') and obj.product.image:
            return obj.product.image.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for orders with Stripe payment integration.
    
    Includes nested serialization of order items and links to feedback if available.
    """
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    has_feedback = serializers.SerializerMethodField()
    chat_room_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'customer_name', 'total', 'status',
            'created_at', 'updated_at', 'payment_intent_id',
            'stripe_charge_id', 'items', 'has_feedback', 'chat_room_id'
        ]
        read_only_fields = ['payment_intent_id', 'stripe_charge_id']
    
    def get_customer_name(self, obj):
        return obj.user.full_name if hasattr(obj.user, 'full_name') else obj.user.email
    
    def get_has_feedback(self, obj):
        return hasattr(obj, 'feedback')
    
    def get_chat_room_id(self, obj):
        try:
            return obj.chat_room.room_id if hasattr(obj, 'chat_room') and obj.chat_room else None
        except Exception:
            return None

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
