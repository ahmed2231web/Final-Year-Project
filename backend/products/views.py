from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from products.models import Product
from products.serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticated
import logging
import cloudinary
import cloudinary.uploader
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from django.conf import settings
from rest_framework.exceptions import PermissionDenied

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
    
    def perform_destroy(self, instance):
        """
        Custom perform_destroy method to handle product deletion
        """
        # Check if the user has permission to delete this product
        if instance.farmer != self.request.user:
            logger.warning(f"User {self.request.user.email} attempted to delete product {instance.id} without permission")
            # We can't return a Response from perform_destroy, so we raise an exception

            raise PermissionDenied("You do not have permission to delete this product.")
        
        # Log the deletion
        logger.info(f"Product {instance.id} deleted by user {self.request.user.email}")
        
        # Call the parent's perform_destroy to actually delete the instance
        super().perform_destroy(instance)
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy to add custom error handling
        """
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            if isinstance(e, permissions.exceptions.PermissionDenied):
                # Re-raise permission errors to be handled by DRF
                raise
            
            # Log and handle other errors
            logger.error(f"Error deleting product: {str(e)}")
            return Response(
                {"detail": f"Error deleting product: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def all(self, request):
        """
        Get all products for customer display, regardless of farmer
        This endpoint is used by customers to browse all available products
        """
        # Get all products
        products = Product.objects.all().order_by('-created_at')
        
        # Include farmer information in the serialized data
        serializer = self.get_serializer(products, many=True)
        
        # Log the request
        logger.info(f"All products requested by user {request.user.email}")
        
        # Return the serialized data
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related_products(self, request, pk=None):
        """
        Get related products with the same category
        """
        product = self.get_object()
        
        # Find related products with the same category
        related = Product.objects.filter(category=product.category).exclude(id=product.id)[:5]
        
        # Serialize the related products
        serializer = self.get_serializer(related, many=True)
        
        # Return the serialized data
        return Response(serializer.data)

class CloudinaryDeleteView(APIView):
    """
    API view for deleting images from Cloudinary.
    Requires authentication and expects a public_id in the request body.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]
    
    def post(self, request, format=None):
        """
        Delete an image from Cloudinary using its public_id
        """
        try:
            # Get the public_id from the request body
            public_id = request.data.get('public_id')
            
            if not public_id:
                return Response(
                    {"detail": "Public ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Delete the image from Cloudinary
            result = cloudinary.uploader.destroy(
                public_id,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                cloud_name=settings.CLOUDINARY_CLOUD_NAME
            )
            
            # Log the deletion
            logger.info(f"Image {public_id} deleted by user {request.user.email}")
            
            # Return the result
            return Response(result)
            
        except Exception as e:
            logger.error(f"Error deleting image from Cloudinary: {str(e)}")
            return Response(
                {"detail": f"Error deleting image: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
