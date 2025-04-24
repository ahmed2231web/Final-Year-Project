from rest_framework import serializers
from .models import ChatRoom, ChatMessage, ChatMessageImage
# from users.models import CustomUser
# from products.models import Product
from users.serializers import UserCreateSerializer
from products.serializers import ProductSerializer
from django.utils import timezone
# import datetime

class ChatMessageImageSerializer(serializers.ModelSerializer):
    """
    Serializer for the ChatMessageImage model.
    Used for handling multiple images per message.
    """
    class Meta:
        model = ChatMessageImage
        fields = ['id', 'message', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    """
    Serializer for the ChatRoom model.
    Includes basic information about the chat room.
    """
    customer_detail = UserCreateSerializer(source='customer', read_only=True)
    farmer_detail = UserCreateSerializer(source='farmer', read_only=True)
    product_detail = ProductSerializer(source='product', read_only=True)
    last_message_text = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    time_since_order = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'room_id', 'customer', 'farmer', 'product', 'quantity', 
                  'created_at', 'updated_at', 'customer_detail', 'farmer_detail', 
                  'product_detail', 'last_message_text', 'unread_count',
                  'has_unread_customer', 'has_unread_farmer', 'order_status',
                  'is_new_order', 'order_timestamp', 'time_since_order']
        read_only_fields = ['id', 'room_id', 'created_at', 'updated_at', 'time_since_order']
    
    def get_last_message_text(self, obj):
        """
        Returns the text of the last message in the room
        """
        # Get the latest message for this room
        latest_message = ChatMessage.objects.filter(room=obj).order_by('-timestamp').first()
        
        if latest_message:
            return latest_message.message[:50] + '...' if len(latest_message.message) > 50 else latest_message.message
        return ""
    
    def get_unread_count(self, obj):
        """
        Returns the count of unread messages for the current user
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
            
        user_id = request.user.id
        
        if user_id == obj.customer.id:
            return obj.messages.filter(is_read=False, sender=obj.farmer).count()
        elif user_id == obj.farmer.id:
            return obj.messages.filter(is_read=False, sender=obj.customer).count()
        return 0
    
    def get_time_since_order(self, obj):
        """
        Returns a human-readable string representing the time since the order was created
        """
        
        now = timezone.now()
        time_diff = now - obj.order_timestamp
        
        # Convert to minutes
        minutes = int(time_diff.total_seconds() / 60)
        
        if minutes < 60:
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        
        # Convert to hours
        hours = int(minutes / 60)
        if hours < 24:
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        
        # Convert to days
        days = int(hours / 24)
        return f"{days} day{'s' if days != 1 else ''} ago"

class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for the ChatMessage model.
    Used for sending and receiving message data.
    """
    sender_detail = UserCreateSerializer(source='sender', read_only=True)
    images = ChatMessageImageSerializer(many=True, read_only=True)
    all_image_urls = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'room', 'sender', 'message', 'image', 'images', 'is_read', 
                  'timestamp', 'sender_detail', 'all_image_urls']
        read_only_fields = ['id', 'timestamp', 'is_read', 'all_image_urls']
    
    def get_all_image_urls(self, instance):
        """
        Get a list of all image URLs for this message, including the main image and additional images
        """
        request = self.context.get('request')
        all_images = []
        
        # Add main image if it exists
        if instance.image:
            if request:
                all_images.append(request.build_absolute_uri(instance.image.url))
            else:
                all_images.append(instance.image.url)
        
        # Add additional images
        for img in instance.images.all():
            if request:
                all_images.append(request.build_absolute_uri(img.image.url))
            else:
                all_images.append(img.image.url)
        
        return all_images
    
    def to_representation(self, instance):
        """
        Custom representation to include image URLs
        """
        representation = super().to_representation(instance)
        
        # Make sure image URL is absolute
        if representation['image']:
            request = self.context.get('request')
            if request:
                representation['image'] = request.build_absolute_uri(instance.image.url)
        
        # Make sure all image URLs in the images list are absolute
        for image_data in representation['images']:
            if image_data['image']:
                request = self.context.get('request')
                if request:
                    image_data['image'] = request.build_absolute_uri(image_data['image'])
        
        return representation

