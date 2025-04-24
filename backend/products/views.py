from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from rest_framework.exceptions import PermissionDenied
from django.conf import settings
from products.models import Product
from products.serializers import ProductSerializer
import cloudinary
import cloudinary.uploader
import logging

# Configure module logger
logger = logging.getLogger(__name__)

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing products.
    
    This ViewSet provides CRUD operations for products. It handles:
    - Listing products (with different behavior for farmers vs customers)
    - Creating new products (associating them with the current user)
    - Retrieving specific product details
    - Updating existing products
    - Deleting products (with permission checks)
    
    It also provides custom endpoints for:
    - Listing all products for customer browsing
    - Finding related products in the same category
    
    Supports Cloudinary image URLs from the frontend for product images.
    """
    serializer_class = ProductSerializer  # The serializer class to use for this viewset
    permission_classes = [IsAuthenticated]  # Require authentication for all endpoints
    
    def get_queryset(self):
        """
        Get the list of products based on the request context.
        
        This method implements context-aware filtering:
        - When a farmer accesses the main products list, they only see their own products
        - For other endpoints (like product detail), all products are accessible to allow
          customers to view any product's details
        
        Returns:
            QuerySet: Filtered queryset of Product objects based on the request context
        """
        user = self.request.user
        logger.info(f"User {user.email} requesting products")
        
        # Check if this is a request to the main products list endpoint
        # If so, filter products to show only those created by the current user (for farmers)
        if self.request.path.endswith('/products/') or self.request.path.endswith('/products'):
            logger.info(f"Filtering products for user {user.email}")
            return Product.objects.filter(farmer=user)
            
        # For other endpoints (like /products/<id>/ for specific product details)
        # return all products to allow customers to view any product's details
        return Product.objects.all()
    
    def perform_create(self, serializer):
        """
        Set the farmer to the current user when creating a product.
        
        This method is called by the framework when a new product is being created.
        It ensures that the product is associated with the user who created it.
        
        Args:
            serializer: The serializer instance containing validated data
            
        Raises:
            Exception: Re-raises any exceptions that occur during product creation
        """
        try:
            # Associate the product with the current authenticated user
            serializer.save(farmer=self.request.user)
            
            # Log the successful product creation
            # Note: Using email instead of username since CustomUser model doesn't have username field
            logger.info(f"Product created successfully by user {self.request.user.email}")
        except Exception as e:
            # Log any errors that occur during product creation
            logger.error(f"Error creating product: {str(e)}")
            # Re-raise the exception to be handled by the framework
            raise
    
    def perform_destroy(self, instance):
        """
        Custom perform_destroy method to handle product deletion with permission checks.
        
        This method verifies that only the farmer who created the product can delete it,
        preventing unauthorized deletion of products by other users.

        Handles the actual deletion logic of a product instance.
        
        Args:
            instance: The Product instance to be deleted
            
        Raises:
            PermissionDenied: If the current user is not the farmer who created the product
        """
        # Security check: Verify the current user is the owner of this product
        if instance.farmer != self.request.user:
            # Log the unauthorized deletion attempt
            logger.warning(f"User {self.request.user.email} attempted to delete product {instance.id} without permission")
            
            # We can't return a Response from perform_destroy, so we raise an exception
            # This will be caught by the framework and converted to a 403 Forbidden response
            raise PermissionDenied("You do not have permission to delete this product.")
        
        # Log the successful deletion
        logger.info(f"Product {instance.id} deleted by user {self.request.user.email}")
        
        # Call the parent's perform_destroy to actually delete the instance
        super().perform_destroy(instance)
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy method to add custom error handling.
        
        This method extends the standard destroy method to provide better error handling
        and user-friendly error messages when product deletion fails.

        Manages the HTTP request/response cycle for deletion.
        
        Args:
            request: The HTTP request
            *args, **kwargs: Additional arguments passed to the method
            
        Returns:
            Response: HTTP response indicating success or failure
            
        Raises:
            PermissionDenied: If the user doesn't have permission (passed through)
        """
        try:
            # Attempt to delete the product using the parent class's destroy method
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            # Special handling for permission errors
            if isinstance(e, permissions.exceptions.PermissionDenied):
                # Re-raise permission errors to be handled by DRF's exception handler
                # This ensures proper 403 responses with the correct error format
                raise
            
            # Log and handle other types of errors
            logger.error(f"Error deleting product: {str(e)}")
            
            # Return a user-friendly error response
            return Response(
                {"detail": f"Error deleting product: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def all(self, request):
        """
        Get all products for customer display, regardless of farmer.
        
        This custom endpoint allows customers to browse all available products from all
        farmers, sorted by creation date (newest first). It's used on the marketplace/shop
        page of the application.
        
        Args:
            request: The HTTP request
            
        Returns:
            Response: JSON response containing all products
        """
        # Get all products, sorted by creation date (newest first)
        products = Product.objects.all().order_by('-created_at')
        
        # Serialize the products, including farmer information
        # The many=True parameter indicates we're serializing multiple objects
        serializer = self.get_serializer(products, many=True)
        
        # Log the request for monitoring
        logger.info(f"All products requested by user {request.user.email}")
        
        # Return the serialized product data
        return Response(serializer.data)
    
    # @action(detail=True, methods=['get'])
    # def related_products(self, request, pk=None):
    #     """
    #     Get related products with the same category as the current product.
        
    #     This endpoint finds up to 5 other products in the same category as the
    #     specified product, which can be used for "You might also like" or
    #     "Similar products" sections in the product detail page.
        
    #     Args:
    #         request: The HTTP request
    #         pk: The primary key (ID) of the product to find related items for
            
    #     Returns:
    #         Response: JSON response containing related products
    #     """
    #     # Get the current product using the provided pk
    #     product = self.get_object()
        
    #     # Find related products with the same category, excluding the current product
    #     # Limit to 5 products to avoid overwhelming the UI
    #     related = Product.objects.filter(category=product.category).exclude(id=product.id)[:5]
        
    #     # Serialize the related products
    #     serializer = self.get_serializer(related, many=True)
        
    #     # Return the serialized related products
    #     return Response(serializer.data)

class CloudinaryDeleteView(APIView):
    """
    API view for deleting images from Cloudinary.
    
    This endpoint allows authenticated users to delete images they've previously
    uploaded to Cloudinary. It requires the public_id of the image to be deleted,
    which is provided by Cloudinary when the image is first uploaded.
    
    Security Note: This endpoint should be used carefully as it permanently deletes
    images from Cloudinary storage.
    """
    permission_classes = [IsAuthenticated]  # Only authenticated users can delete images
    parser_classes = [JSONParser]          # Expect JSON data in the request body
    
    def post(self, request, format=None):
        """
        Delete an image from Cloudinary using its public_id.
        
        This method handles the POST request to delete an image from Cloudinary.
        It requires a public_id parameter in the request body, which identifies
        the specific image to delete.
        
        Args:
            request: The HTTP request containing the public_id
            format: The format of the request (automatically determined)
            
        Returns:
            Response: JSON response indicating success or failure
            
        Raises:
            400 Bad Request: If public_id is missing
            500 Internal Server Error: If deletion fails
        """
        try:
            # Extract the public_id from the request body
            public_id = request.data.get('public_id')
            
            # Validate that public_id is provided
            if not public_id:
                logger.warning("Cloudinary delete attempt without public_id")
                return Response(
                    {"detail": "Public ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Call Cloudinary API to delete the image
            result = cloudinary.uploader.destroy(
                public_id,                                  # ID of the image to delete
                api_key=settings.CLOUDINARY_API_KEY,        # Cloudinary API credentials
                api_secret=settings.CLOUDINARY_API_SECRET,
                cloud_name=settings.CLOUDINARY_CLOUD_NAME
            )
            
            # Log the successful deletion
            logger.info(f"Image {public_id} deleted by user {request.user.email}")
            
            # Return the result from Cloudinary
            return Response(result)
            
        except Exception as e:
            # Log the error and return a user-friendly error message
            logger.error(f"Error deleting image from Cloudinary: {str(e)}")
            return Response(
                {"detail": f"Error deleting image: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
