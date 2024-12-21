from djoser.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserCreateSerializer(UserCreateSerializer):
    """
    Custom serializer extending Djoser's UserCreateSerializer
    Adds additional fields specific to our CustomUser model
    """
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'phoneNumber', 'email', 'fullName', 'user_type', 'province', 'city', 'password')
        extra_kwargs = {
            'phoneNumber': {'required': True},
            'email': {'required': True},
            'password': {'write_only': True},
            'fullName': {'required': True},
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
        user = User.objects.create_user(**validated_data)
        return user

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving user details
    """
    class Meta:
        model = User
        fields = ('id', 'phoneNumber', 'email', 'fullName', 'user_type', 'province', 'city', 'date_joined')
        read_only_fields = ('id', 'date_joined')