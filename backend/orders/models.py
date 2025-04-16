from django.db import models
from django.utils import timezone

# Order status choices - defines the possible states of an order in the system
class OrderStatus(models.TextChoices):
    """
    Defines the possible states of an order using Django's TextChoices.
    
    Each choice consists of:
    - A database value (e.g., 'new') - stored in the database
    - A human-readable label (e.g., 'New Order') - displayed in the UI
    """
    NEW = 'new', 'New Order'               # Initial state when an order is first created
    ACTIVE = 'active', 'Active Order'       # Order is being processed/fulfilled
    COMPLETED = 'completed', 'Completed Order'  # Order has been fulfilled and completed

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
