from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Product
from .serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticated
import logging

# Set up logging
logger = logging.getLogger(__name__)

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing products.
    Supports Cloudinary image URLs from the frontend.
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        This view returns a list of all products for the currently authenticated user.
        """
        user = self.request.user
        logger.info(f"User {user.email} requesting products")
        
        # Always filter products by the current user if they're accessing /products/
        # This ensures farmers only see their own products
        if self.request.path.endswith('/products/') or self.request.path.endswith('/products'):
            logger.info(f"Filtering products for user {user.email}")
            return Product.objects.filter(farmer=user)
            
        # For other endpoints (like /products/<id>/ for specific product details)
        # we'll still return all products to allow customers to view any product
        return Product.objects.all()
    
    def perform_create(self, serializer):
        """
        Set the farmer to the current user when creating a product
        """
        try:
            serializer.save(farmer=self.request.user)
            # Use email instead of username since CustomUser doesn't have username field
            logger.info(f"Product created successfully by user {self.request.user.email}")
        except Exception as e:
            logger.error(f"Error creating product: {str(e)}")
            raise
    
    def destroy(self, request, *args, **kwargs):
        """
        Only allow farmers to delete their own products
        """
        instance = self.get_object()
        if instance.farmer != request.user:
            return Response(
                {"detail": "You do not have permission to delete this product."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            response = super().destroy(request, *args, **kwargs)
            logger.info(f"Product {instance.id} deleted by user {request.user.email}")
            return response
        except Exception as e:
            logger.error(f"Error deleting product {instance.id}: {str(e)}")
            return Response(
                {"detail": f"Error deleting product: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def related_products(self, request, pk=None):
        """
        Get related products with the same category
        """
        product = self.get_object()
        related = Product.objects.filter(category=product.category).exclude(id=product.id)[:5]
        serializer = self.get_serializer(related, many=True)
        return Response(serializer.data)
