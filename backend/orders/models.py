from django.db import models
from django.utils import timezone

# Order status choices
class OrderStatus(models.TextChoices):
    NEW = 'new', 'New Order'
    ACTIVE = 'active', 'Active Order'
    COMPLETED = 'completed', 'Completed Order'

# Order-related utility functions
def get_order_status_display(status):
    """Get the human-readable display value for an order status"""
    for choice in OrderStatus.choices:
        if choice[0] == status:
            return choice[1]
    return 'Unknown Status'

def format_order_timestamp(timestamp):
    """Format an order timestamp into a human-readable string"""
    if not timestamp:
        return ""
        
    now = timezone.now()
    time_diff = now - timestamp
    
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
