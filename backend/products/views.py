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
        public_id = request.data.get('public_id')
        
        if not public_id:
            return Response(
                {"error": "public_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Log the deletion attempt
            logger.info(f"Attempting to delete Cloudinary image with public_id: {public_id}")
            
            # Initialize Cloudinary with credentials from settings
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
                api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
                api_secret=settings.CLOUDINARY_STORAGE['API_SECRET'],
                secure=True
            )
            
            # Remove file extension if present (should be handled in frontend but double-check)
            if '.' in public_id:
                public_id = public_id.rsplit('.', 1)[0]
                
            # Log the cleaned public_id
            logger.info(f"Using cleaned public_id for deletion: {public_id}")
            
            # Delete the image from Cloudinary
            result = cloudinary.uploader.destroy(public_id)
            
            logger.info(f"Cloudinary deletion result: {result}")
            
            if result.get('result') == 'ok':
                logger.info(f"Successfully deleted Cloudinary image: {public_id}")
                return Response({"success": True}, status=status.HTTP_200_OK)
            elif result.get('result') == 'not found':
                # If the image is not found, consider it already deleted
                logger.warning(f"Cloudinary image not found (already deleted): {public_id}")
                return Response({"success": True, "message": "Image not found or already deleted"}, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Cloudinary deletion returned: {result}")
                return Response(
                    {"error": "Image could not be deleted", "details": result},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"Error deleting Cloudinary image {public_id}: {str(e)}")
            return Response(
                {"error": "Failed to delete image", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
