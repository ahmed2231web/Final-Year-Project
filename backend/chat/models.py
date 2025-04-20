from django.db import models
from users.models import CustomUser
from products.models import Product
from orders.models import OrderStatus, Order

# Get the first user as a default (will be used only for migration)
def get_default_user():
    return CustomUser.objects.first().id if CustomUser.objects.exists() else None

# Create your models here.


'''
ChatRoom: Tracks conversations between customers and farmers
Contains customer, farmer, product references
Manages order status and unread message flags
'''

class ChatRoom(models.Model):
    # Unique room identifier
    room_id = models.CharField(max_length=255, unique=True)
    # The customer in this chat
    customer = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='customer_rooms'
    )
    # The farmer in this chat
    farmer = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='farmer_rooms'
    )
    # Product being discussed
    product = models.ForeignKey(
        Product, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='chat_rooms'
    )
    # Quantity inquired
    quantity = models.PositiveIntegerField(default=1)
    # Track unread messages
    has_unread_customer = models.BooleanField(default=False)
    has_unread_farmer = models.BooleanField(default=False)
    # Link to order if one exists
    order = models.OneToOneField(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_room'
    )
    # Order status tracking
    order_status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.NEW
    )
    is_new_order = models.BooleanField(default=True)  # For blinking indicator
    order_timestamp = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chat between {self.customer.full_name} and {self.farmer.full_name} about {self.product.productName if self.product else 'deleted product'}"


'''
ChatMessage: Stores all message content
Links to room, sender, and optional images
Tracks read status and timestamps
'''


class ChatMessage(models.Model):
    # The room this message belongs to
    room = models.ForeignKey(
        ChatRoom, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    # User who sent the message
    sender = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    # Message content
    message = models.TextField(blank=True)
    # Optional image attachment
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True)
    # Is this message read by the recipient
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"From {self.sender.full_name} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

class ChatMessageImage(models.Model):
    """
    Model to store multiple images for a single chat message
    """
    # The message this image belongs to
    message = models.ForeignKey(
        ChatMessage,
        on_delete=models.CASCADE,
        related_name='images'
    )
    # Image file
    image = models.ImageField(upload_to='chat_images/multiple/')
    # Upload timestamp
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Image for message {self.message.id} uploaded at {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"
