from rest_framework import serializers
from .models import Product
import re  # For regular expression validation of image URLs
import logging

# Configure module logger
logger = logging.getLogger(__name__)

class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for the Product model.
    
    This serializer handles the conversion between Product model instances and their
    JSON representation for the API. It includes custom fields to provide additional
    information about the farmer who created the product.
    """
    # Custom fields that are not directly on the Product model
    # These are computed using the get_* methods defined below
    farmer_name = serializers.SerializerMethodField()  # Farmer's full name
    farmer_city = serializers.SerializerMethodField()   # Farmer's city location
    
    class Meta:
        """
        Meta class defines the model to serialize and configuration options.
        """
        model = Product  # The model this serializer is based on
        fields = [
            # Basic identification fields
            'id',           # Primary key
            'farmer',       # Foreign key to the farmer user
            'farmer_name',  # Custom field - farmer's name
            'farmer_city',  # Custom field - farmer's city
            
            # Product details
            'productName',   # Name of the product
            'category',      # Product category (e.g., 'Grains', 'Vegetables')
            'description',   # Detailed product description
            'price',         # Product price
            'discount',      # Optional discount percentage
            'stockQuantity', # Available quantity in stock
            
            # Product images
            'imageUrl',      # Primary product image
            'imageUrl2',     # Secondary product image (optional)
            'imageUrl3',     # Tertiary product image (optional)
            
            # Timestamps
            'created_at',    # When the product was created
            'updated_at'     # When the product was last updated
        ]
        # Fields that cannot be modified directly through the API
        read_only_fields = ['id', 'farmer', 'farmer_name', 'farmer_city', 'created_at', 'updated_at']
    
    def get_farmer_name(self, obj):
        """
        Get the farmer's full name or email as a fallback.
        
        Args:
            obj: The Product instance being serialized.
            
        Returns:
            str: The farmer's full name if available, email as fallback, or empty string if no farmer.
        """
        if obj.farmer:
            # Use full_name if available, otherwise fall back to email
            return obj.farmer.full_name or obj.farmer.email
        return ""  # Return empty string if no farmer is associated
    
    def get_farmer_city(self, obj):
        """
        Get the farmer's city location.
        
        Args:
            obj: The Product instance being serialized.
            
        Returns:
            str: The farmer's city if available, or empty string if not available or no farmer.
        """
        if obj.farmer:
            return obj.farmer.city
        return ""  # Return empty string if no farmer or no city
    
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
        """
        Override the create method to automatically set the farmer field.
        
        This method automatically assigns the current authenticated user as the farmer
        when creating a new product, ensuring products are always associated with
        the user who created them.
        
        Args:
            validated_data: The validated data dictionary from the request.
            
        Returns:
            Product: The newly created Product instance.
        """
        # Set the farmer field to the current authenticated user
        validated_data['farmer'] = self.context['request'].user
        
        # Call the parent class's create method with the updated validated_data
        return super().create(validated_data)
