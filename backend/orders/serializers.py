from rest_framework import serializers
from chat.models import ChatRoom

class RecentOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for recent orders in the farmer dashboard
    """
    customer_name = serializers.CharField(source='customer.full_name')
    product_name = serializers.CharField(source='product.productName')
    
    class Meta:
        model = ChatRoom
        fields = [
            'room_id', 
            'customer_name', 
            'product_name', 
            'quantity', 
            'order_status', 
            'created_at'
        ]

class FarmerDashboardSerializer(serializers.Serializer):
    """
    Main serializer for the farmer dashboard data
    """
    total_orders = serializers.IntegerField()
    completed_orders = serializers.IntegerField()
    active_orders = serializers.IntegerField()
    recent_orders = RecentOrderSerializer(many=True)
