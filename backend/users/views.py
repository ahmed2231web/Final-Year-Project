from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import ListAPIView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.core.mail import send_mail
from djoser.utils import encode_uid, decode_uid
import logging
from .permissions import IsFarmer
from .signals import is_temp_email_domain
from .models import NewsArticle
from .serializers import NewsArticleSerializer

# Configure module logger
logger = logging.getLogger(__name__)

# Get the active User model (could be a custom user model)
User = get_user_model()

class ActivateUserView(APIView):
    """
    API view for activating user accounts via email confirmation links.
    
    This view handles the GET request that occurs when a user clicks on the
    activation link sent to their email. It validates the UID and token,
    and if valid, activates the user's account.
    """
    # Allow anyone to access this endpoint (users aren't authenticated yet)
    permission_classes = [AllowAny]
    
    def get(self, request, uid, token):
        """
        Handle GET requests to activate a user account.
        
        Args:
            request: The HTTP request
            uid: Encoded user ID from the activation link
            token: Security token from the activation link
            
        Returns:
            Response: JSON response indicating success or failure
        """
        # Log the activation attempt for audit purposes
        logger.info(f"Account activation attempt with UID: {uid}")
        
        try:
            # Decode the user ID from the URL parameter
            user_id = decode_uid(uid)
            # Find the user in the database
            user = User.objects.get(pk=user_id)
            logger.info(f"Found user with ID: {user_id}, email: {user.email}")
            
            # Verify the token is valid for this user
            if default_token_generator.check_token(user, token):
                # Check if user is already active to avoid redundant activation
                if user.is_active:
                    logger.info(f"User {user.email} is already active, skipping activation")
                    return Response(
                        {"message": "Account already activated!"}, 
                        status=status.HTTP_200_OK
                    )
                
                # Activate the user account
                user.is_active = True
                user.save()  # This will trigger the confirmation email signal
                
                # Log successful activation
                logger.info(f"Successfully activated user: {user.email}")
                
                # Return success response
                return Response(
                    {"message": "Account activated!"}, 
                    status=status.HTTP_200_OK
                )
            else:
                # Token is invalid or expired
                logger.warning(f"Invalid token for user: {user.email}")
                return Response(
                    {"error": "Invalid token"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        except (User.DoesNotExist, ValueError, TypeError) as e:
            # Handle various error cases:
            # - User.DoesNotExist: User with the given ID doesn't exist
            # - ValueError: UID couldn't be decoded properly
            # - TypeError: Unexpected data type in the UID
            logger.error(f"Activation error: {str(e)}")
            return Response(
                {"error": "Invalid user"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class PasswordResetRequestView(APIView):
    """
    API view for handling password reset requests.
    
    This view processes the initial password reset request when a user
    forgets their password. It generates a secure token and sends a
    password reset link to the user's email address.
    """
    # Allow anyone to access this endpoint (users aren't authenticated)
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Handle POST requests to initiate a password reset.
        
        Args:
            request: The HTTP request containing the user's email
            
        Returns:
            Response: JSON response indicating success or failure
        """
        # Extract email from request data
        email = request.data.get('email')
        
        # Validate email is provided
        if not email:
            return Response(
                {"error": "Email is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find the user with the provided email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Return 404 if user not found
            # Note: For security reasons, some applications return 200 even when
            # the user doesn't exist to prevent user enumeration attacks
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate secure reset token and encoded user ID
        uid = encode_uid(user.pk)  # Encode user ID for security
        token = default_token_generator.make_token(user)  # Generate time-limited token
        
        # Build the complete password reset URL for the frontend
        reset_url = f"{settings.FRONTEND_DOMAIN}/password-reset/{uid}/{token}/"
        
        # Prepare email content
        subject = "Password Reset Request"
        message = f"Click the link to reset your password: {reset_url}"
        
        # Check if the email is from a temporary/disposable domain
        # This helps prevent abuse of the password reset feature
        is_temp = is_temp_email_domain(email)
        if is_temp:
            logger.info(f"Sending password reset email to temporary domain: {email}")
            
        # Send the password reset email
        try:
            # Note: fail_silently is set to True for temporary email domains
            # This prevents exceptions if the email can't be delivered to disposable addresses
            send_mail(
                subject, 
                message, 
                settings.DEFAULT_FROM_EMAIL, 
                [email], 
                fail_silently=is_temp
            )
            logger.info(f"Password reset email sent to {email}")
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Failed to send password reset email to {email}: {str(e)}")
            
            # Only return an error for legitimate email domains
            # For temporary domains, we pretend the email was sent successfully
            if not is_temp:
                return Response(
                    {"error": "Failed to send email"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Return success response
        return Response(
            {"message": "Password reset email sent"}, 
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    """
    API view for validating and processing password reset requests.
    
    This view handles two operations:
    1. GET: Validates the reset token before showing the password reset form
    2. POST: Processes the actual password reset with the new password
    """
    # Allow anyone to access this endpoint (users aren't authenticated yet)
    permission_classes = [AllowAny]
    
    def get(self, request, uid, token):
        """
        Handle GET requests to validate a password reset token.
        
        This endpoint is called when a user clicks the reset link in their email
        before showing them the password reset form, to verify the token is valid.
        
        Args:
            request: The HTTP request
            uid: Encoded user ID from the reset link
            token: Security token from the reset link
            
        Returns:
            Response: JSON response indicating if the token is valid
        """
        try:
            # Decode the user ID from the URL parameter
            user_id = decode_uid(uid)
            # Find the user in the database
            user = User.objects.get(pk=user_id)
            
            # Verify the token is valid for this user
            if default_token_generator.check_token(user, token):
                # Token is valid, user can proceed to reset their password
                return Response(
                    {"message": "Valid token. You can now reset your password."}, 
                    status=status.HTTP_200_OK
                )
            else:
                # Token is invalid or expired
                return Response(
                    {"error": "Invalid token"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        except (User.DoesNotExist, ValueError, TypeError):
            # Handle various error cases:
            # - User.DoesNotExist: User with the given ID doesn't exist
            # - ValueError: UID couldn't be decoded properly
            # - TypeError: Unexpected data type in the UID
            return Response(
                {"error": "Invalid user"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request, uid, token):
        """
        Handle POST requests to reset a user's password.
        
        This endpoint processes the actual password reset when the user submits
        their new password after clicking the reset link in their email.
        
        Args:
            request: The HTTP request containing the new password
            uid: Encoded user ID from the reset link
            token: Security token from the reset link
            
        Returns:
            Response: JSON response indicating success or failure
        """
        try:
            # Decode the user ID from the URL parameter
            user_id = decode_uid(uid)
            # Find the user in the database
            user = User.objects.get(pk=user_id)
            
            # Verify the token is valid for this user
            if default_token_generator.check_token(user, token):
                # Extract the new password from request data
                new_password = request.data.get('new_password')
                
                # Validate new password is provided
                if not new_password:
                    return Response(
                        {"error": "New password is required"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Set the new password (this handles hashing)
                user.set_password(new_password)
                user.save()
                
                # Return success response
                return Response(
                    {"message": "Password reset successfully"}, 
                    status=status.HTTP_200_OK
                )
            else:
                # Token is invalid or expired
                return Response(
                    {"error": "Invalid token"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        except (User.DoesNotExist, ValueError, TypeError):
            # Handle various error cases
            return Response(
                {"error": "Invalid user"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

# Auth check endpoints for frontend route protection
class FarmerAuthCheckView(APIView):
    """
    View to check if the user is authenticated and is a farmer.
    
    This endpoint is used by the frontend to protect farmer-specific routes.
    It returns basic user information if the user is authenticated and has
    the farmer role, otherwise it returns a 403 Forbidden response.
    """
    # Use the custom IsFarmer permission which checks both authentication and farmer role
    permission_classes = [IsFarmer]
    
    def get(self, request):
        """
        Handle GET requests to verify farmer authentication.
        
        Args:
            request: The HTTP request with authenticated user
            
        Returns:
            Response: JSON response with user information if authenticated as farmer
            
        Note:
            If the user is not authenticated or not a farmer, the permission class
            will return a 403 Forbidden response before this method is called.
        """
        # Return basic user information for the frontend
        return Response({
            "is_authenticated": True,           # Always true if this method is called
            "user_type": request.user.user_type,  # Should be 'FARMER'
            "user_id": request.user.id,          # User's database ID
            "full_name": request.user.full_name   # User's full name for display
        }, status=status.HTTP_200_OK)

class UserTypeView(APIView):
    """
    View to get the user type of the authenticated user.
    
    This endpoint is used by the frontend to determine which routes and UI
    elements to show based on the user's type (e.g., FARMER, CUSTOMER).
    It requires authentication but doesn't check for a specific user type.
    """
    # Require authentication but don't check for specific user type
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Handle GET requests to retrieve user type information.
        
        Args:
            request: The HTTP request with authenticated user
            
        Returns:
            Response: JSON response with user type and basic information
            
        Note:
            If the user is not authenticated, the permission class will return
            a 401 Unauthorized response before this method is called.
        """
        # Return user type and basic information for the frontend
        return Response({
            "user_type": request.user.user_type,  # User type (e.g., 'FARMER', 'CUSTOMER')
            "user_id": request.user.id,          # User's database ID
            "full_name": request.user.full_name   # User's full name for display
        }, status=status.HTTP_200_OK)

class NewsArticleListView(ListAPIView):
    """
    API view to retrieve news articles.
    
    This view provides a paginated list of active news articles for the
    application's news feed. Articles can be filtered by category using
    a query parameter.
    
    Endpoints:
        GET /api/news/: Returns a list of all active news articles.
        GET /api/news/?category=wheat: Returns articles in the 'wheat' category.
    """
    serializer_class = NewsArticleSerializer  # Serializer for converting NewsArticle models to JSON
    permission_classes = [AllowAny]  # Allow anyone to view news articles (public content)
    
    def get_queryset(self):
        """
        Get the list of news articles, filtered as needed.
        
        This method builds the queryset of news articles to return, applying filters:
        1. Only include active articles (is_active=True)
        2. Order by creation date (newest first)
        3. Optionally filter by category if specified in query parameters
        
        Returns:
            QuerySet: Filtered queryset of NewsArticle objects
        """
        # Start with all active articles, ordered by creation date (newest first)
        queryset = NewsArticle.objects.filter(is_active=True).order_by('-created_at')
        
        # Check if a category filter was provided in the query parameters
        # Example: /api/news/?category=wheat
        category = self.request.query_params.get('category', None)
        if category:
            # Apply category filter if provided
            queryset = queryset.filter(category=category)
            
        return queryset
    
    def get_serializer_context(self):
        """
        Add request to serializer context to enable building absolute URLs.
        
        This method enhances the serializer context by adding the request object,
        which allows the serializer to build absolute URLs for images and other
        resources using the request's domain.
        
        Returns:
            dict: Enhanced serializer context with request object
        """
        # Get the default context from the parent class
        context = super().get_serializer_context()
        
        # Add the request object to the context
        context.update({"request": self.request})
        
        return context