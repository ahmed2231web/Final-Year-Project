from djoser.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import NewsArticle
import os
import base64

User = get_user_model() 

class UserCreateSerializer(UserCreateSerializer):
    """
    Custom serializer extending Djoser's UserCreateSerializer
    Adds additional fields specific to our CustomUser model
    """
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'phone_number', 'email', 'full_name', 'user_type', 'province', 'city', 'password')
        extra_kwargs = {
            'phone_number': {'required': True},
            'email': {'required': True},
            'password': {'write_only': True},
            'full_name': {'required': True},
            'user_type': {'required': True},
            'province': {'required': True},
            'city': {'required': True}
        }

    def validate_user_type(self, value):
        """
        Check that users cannot register as ADMIN
        """
        if value == User.UserType.ADMIN:
            raise serializers.ValidationError("Cannot register as admin user.")
        return value

    def validate(self, attrs):
        """
        Validate that province and city are provided
        """
        if not attrs.get('province'):
            raise serializers.ValidationError({'province': 'Province field is required'})
        if not attrs.get('city'):
            raise serializers.ValidationError({'city': 'City field is required'})
        return super().validate(attrs)

    def create(self, validated_data):
        """
        Override create method to properly handle user creation
        using our custom user manager
        """
        validated_data['is_active'] = False  # Ensure is_active is False
        user = User.objects.create_user(**validated_data)

        return user

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving user details
    """
    class Meta:
        model = User
        fields = ('id', 'phone_number', 'email', 'full_name', 'user_type', 'province', 'city', 'date_joined')
        read_only_fields = ('id', 'date_joined')

class NewsArticleSerializer(serializers.ModelSerializer):
    """Serializer for NewsArticle model"""
    image_data = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = NewsArticle
        fields = ('id', 'title', 'description', 'image', 'image_url', 'image_data', 'article_url', 'category', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at')
    
    def get_image_url(self, obj):
        """Return the full image URL including domain"""
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_image_data(self, obj):
        """Return base64 encoded image data if the image exists"""
        if not obj.image:
            return None
            
        try:
            if os.path.exists(obj.image.path):
                with open(obj.image.path, 'rb') as image_file:
                    encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
                    return f"data:image/{obj.image.name.split('.')[-1]};base64,{encoded_image}"
        except Exception as e:
            print(f"Error encoding image: {e}")
            return None
        
        return None