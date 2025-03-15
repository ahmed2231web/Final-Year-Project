from rest_framework import serializers
from .models import Product
import re
import logging

logger = logging.getLogger(__name__)

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 
            'farmer', 
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
        read_only_fields = ['id', 'farmer', 'created_at', 'updated_at']
    
    def validate_imageUrl(self, value):
        """
        Validate that the image URL is a proper URL
        and preferably a Cloudinary URL.
        """
        if not value:
            return value
        
        # Check if it's a valid URL
        url_pattern = re.compile(
            r'^(https?://)'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE
        )
        
        if not url_pattern.match(value):
            raise serializers.ValidationError("Please provide a valid URL for the product image.")
        
        # Warning if it's not a Cloudinary URL
        if 'cloudinary.com' not in value:
            logger.warning(f"Non-Cloudinary image URL provided: {value}")
        
        return value
    
    def validate_imageUrl2(self, value):
        """
        Validate that the second image URL is a proper URL
        and preferably a Cloudinary URL.
        """
        if not value:
            return value
        
        # Check if it's a valid URL
        url_pattern = re.compile(
            r'^(https?://)'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE
        )
        
        if not url_pattern.match(value):
            raise serializers.ValidationError("Please provide a valid URL for the second product image.")
        
        # Warning if it's not a Cloudinary URL
        if 'cloudinary.com' not in value:
            logger.warning(f"Non-Cloudinary image URL provided for second image: {value}")
        
        return value
    
    def validate_imageUrl3(self, value):
        """
        Validate that the third image URL is a proper URL
        and preferably a Cloudinary URL.
        """
        if not value:
            return value
        
        # Check if it's a valid URL
        url_pattern = re.compile(
            r'^(https?://)'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE
        )
        
        if not url_pattern.match(value):
            raise serializers.ValidationError("Please provide a valid URL for the third product image.")
        
        # Warning if it's not a Cloudinary URL
        if 'cloudinary.com' not in value:
            logger.warning(f"Non-Cloudinary image URL provided for third image: {value}")
        
        return value
    
    def create(self, validated_data):
        # Set the farmer to the current user
        validated_data['farmer'] = self.context['request'].user
        return super().create(validated_data)
