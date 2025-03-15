from django.contrib import admin
from .models import Product

# Register your models here.

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('productName', 'category', 'price', 'discount', 'stockQuantity', 'farmer')
    list_filter = ('category',)
    search_fields = ('productName', 'description')
    readonly_fields = ('created_at', 'updated_at')
