from rest_framework import serializers
from .models import Feedback, FeedbackResponse
from users.serializers import UserDetailSerializer

class FeedbackResponseSerializer(serializers.ModelSerializer):
    """
    Serializer for farmer responses to feedback.
    """
    class Meta:
        model = FeedbackResponse
        fields = ['id', 'feedback', 'farmer', 'response', 'created_at', 'updated_at']
        read_only_fields = ['farmer', 'created_at', 'updated_at']

class FeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for customer feedback.
    
    Includes nested serialization of any farmer response if one exists.
    """
    response = FeedbackResponseSerializer(read_only=True)
    customer_name = serializers.SerializerMethodField()
    farmer_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'order', 'product', 'farmer', 'customer', 
            'rating', 'comment', 'created_at', 'updated_at', 
            'is_approved', 'response', 'customer_name',
            'farmer_name', 'product_name'
        ]
        read_only_fields = [
            'order', 'product', 'farmer', 'customer', 
            'created_at', 'updated_at', 'is_approved'
        ]
    
    def get_customer_name(self, obj):
        return obj.customer.full_name if hasattr(obj.customer, 'full_name') else obj.customer.email
    
    def get_farmer_name(self, obj):
        return obj.farmer.full_name if hasattr(obj.farmer, 'full_name') else obj.farmer.email
    
    def get_product_name(self, obj):
        return obj.product.productName
