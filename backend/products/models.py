from django.db import models
# from django.conf import settings
# from cloudinary.models import CloudinaryField
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

User = get_user_model()

# Create your models here.
class Product(models.Model):
    """
    Model representing a product in the AgroConnect platform.
    Each product belongs to a farmer and contains details like name, price, etc.
    """
    CATEGORY_CHOICES = [
        ('Vegetables', 'Vegetables'),
        ('Fruits', 'Fruits'),
        ('Crops', 'Crops'),
    ]
    
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    productName = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    discount = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    stockQuantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    imageUrl = models.URLField(help_text="Primary URL for the product image, preferably from Cloudinary")
    imageUrl2 = models.URLField(blank=True, null=True, help_text="Optional second image URL from Cloudinary")
    imageUrl3 = models.URLField(blank=True, null=True, help_text="Optional third image URL from Cloudinary")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.productName
    
    class Meta:
        ordering = ['-created_at']
