from rest_framework import serializers
from .models import Product
import re
import logging

logger = logging.getLogger(__name__)

class ProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.SerializerMethodField()
    farmer_city = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 
            'farmer', 
            'farmer_name',
            'farmer_city',
            'productName', 
            'category', 
            'description', 
            'price', 
            'discount', 
            'stockQuantity', 
            'imageUrl',
            'imageUrl2',
            'imageUrl3',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'farmer', 'farmer_name', 'farmer_city', 'created_at', 'updated_at']
    
    def get_farmer_name(self, obj):
        if obj.farmer:
            return obj.farmer.full_name or obj.farmer.email
        return ""
    
    def get_farmer_city(self, obj):
        if obj.farmer:
            return obj.farmer.city
        return ""
    
    def validate_imageUrl(self, value):
        if not value:
            return value
        
        url_pattern = re.compile(
            r'^(https?://)'  
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  
            r'localhost|'  
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  
            r'(?::\d+)?'  
            r'(?:/?|[/?]\S+)$', re.IGNORECASE
        )
        
        if not url_pattern.match(value):
            raise serializers.ValidationError("Please provide a valid URL for the product image.")
        
        if 'cloudinary.com' not in value:
            logger.warning(f"Non-Cloudinary image URL provided: {value}")
        
        return value
    
    def validate_imageUrl2(self, value):
        if not value:
            return value
        
        url_pattern = re.compile(
            r'^(https?://)'  
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  
            r'localhost|'  
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  
            r'(?::\d+)?'  
            r'(?:/?|[/?]\S+)$', re.IGNORECASE
        )
        
        if not url_pattern.match(value):
            raise serializers.ValidationError("Please provide a valid URL for the second product image.")
        
        if 'cloudinary.com' not in value:
            logger.warning(f"Non-Cloudinary image URL provided for second image: {value}")
        
        return value
    
    def validate_imageUrl3(self, value):
        if not value:
            return value
        
        url_pattern = re.compile(
            r'^(https?://)'  
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  
            r'localhost|'  
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  
            r'(?::\d+)?'  
            r'(?:/?|[/?]\S+)$', re.IGNORECASE
        )
        
        if not url_pattern.match(value):
            raise serializers.ValidationError("Please provide a valid URL for the third product image.")
        
        if 'cloudinary.com' not in value:
            logger.warning(f"Non-Cloudinary image URL provided for third image: {value}")
        
        return value
    
    def create(self, validated_data):
        validated_data['farmer'] = self.context['request'].user
        return super().create(validated_data)
