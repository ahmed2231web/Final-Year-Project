from djoser.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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