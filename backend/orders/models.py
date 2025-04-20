from django.db import models
from django.utils import timezone
from users.models import CustomUser
from products.models import Product

# Order status choices - defines the possible states of an order in the system
class OrderStatus(models.TextChoices):
    """
    Defines the possible states of an order using Django's TextChoices.
    
    Each choice consists of:
    - A database value (e.g., 'new') - stored in the database
    - A human-readable label (e.g., 'New Order') - displayed in the UI
    """
    NEW = 'new', 'New Order'                 # Initial state when an order is first created
    PENDING = 'pending', 'Pending Order'     # Order created with payment authorized but not captured
    SHIPPED = 'shipped', 'Shipped Order'     # Order has been shipped by the farmer
    DELIVERED = 'delivered', 'Delivered Order' # Order has been received by the customer
    ACTIVE = 'active', 'Active Order'        # Order is being processed/fulfilled
    COMPLETED = 'completed', 'Completed Order' # Order has been fulfilled, payment captured

# Order-related utility functions for formatting and display
def get_order_status_display(status):
    """Get the human-readable display value for an order status.
    
    This utility function converts the database value of an order status
    to its corresponding human-readable display label.
    
    Args:
        status (str): The database value of the order status (e.g., 'new', 'active').
        
    Returns:
        str: The human-readable display label (e.g., 'New Order', 'Active Order').
             Returns 'Unknown Status' if the status doesn't match any defined choice.
    """
    for choice in OrderStatus.choices:
        if choice[0] == status:  # If the database value matches
            return choice[1]     # Return the human-readable label
    return 'Unknown Status'      # Fallback for undefined status values

def format_order_timestamp(timestamp):
    """Format an order timestamp into a human-readable relative time string.
    
    Converts a datetime timestamp into a user-friendly relative time format
    like "5 minutes ago", "2 hours ago", or "3 days ago".
    
    Args:
        timestamp (datetime): The timestamp to format. Usually created_at or updated_at.
        
    Returns:
        str: A human-readable string representing the relative time (e.g., "5 minutes ago").
             Returns an empty string if timestamp is None.
    """
    # Handle case where timestamp is None
    if not timestamp:
        return ""
        
    # Get current time in the same timezone as the timestamp
    now = timezone.now()
    time_diff = now - timestamp
    
    # Calculate the time difference in minutes
    minutes = int(time_diff.total_seconds() / 60)
    
    # Format as minutes if less than an hour
    if minutes < 60:
        # Handle singular/plural form correctly
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    
    # Format as hours if less than a day
    hours = int(minutes / 60)
    if hours < 24:
        # Handle singular/plural form correctly
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    
    # Format as days for anything longer
    days = int(hours / 24)
    # Handle singular/plural form correctly
    return f"{days} day{'s' if days != 1 else ''} ago"


class Order(models.Model):
    """
    Represents an order in the system with Stripe payment integration.
    
    This model stores order information including the customer, total amount,
    status, and Stripe payment details. It supports the full order lifecycle
    from creation through payment authorization, shipping, delivery, and completion.
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='orders')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Stripe integration fields
    payment_intent_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    stripe_charge_id = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return f"Order {self.id} by {self.user.email} - {self.status}"


class OrderItem(models.Model):
    """
    Represents an individual item within an order.
    
    Each OrderItem links to a specific product and records the quantity
    and price at the time of order, ensuring historical accuracy even if
    product prices change later.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_order_time = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity} of {self.product.productName} in Order {self.order.id}"
