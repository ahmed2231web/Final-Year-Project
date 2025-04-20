from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import CustomUser
from orders.models import Order
from products.models import Product

class Feedback(models.Model):
    """
    Represents customer feedback for a completed order.
    
    This model stores feedback information including rating, comments, and approval status.
    Feedback can only be submitted for completed orders and requires admin approval
    before being displayed publicly.
    """
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='feedback')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='feedback')
    farmer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='farmer_feedback')
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='customer_feedback')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Feedback for Order {self.order.id} - Rating: {self.rating}"

class FeedbackResponse(models.Model):
    """
    Represents a farmer's response to customer feedback.
    
    This model allows farmers to respond to feedback left by customers,
    providing context or addressing concerns raised in the feedback.
    """
    feedback = models.OneToOneField(Feedback, on_delete=models.CASCADE, related_name='response')
    farmer = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Response to Feedback for Order {self.feedback.order.id}"
