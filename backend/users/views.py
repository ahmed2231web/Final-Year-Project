from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from djoser.utils import encode_uid, decode_uid
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings
from django.core.mail import send_mail
import logging
from .permissions import IsFarmer
from .signals import is_temp_email_domain
from .models import NewsArticle
from .serializers import NewsArticleSerializer
from rest_framework.generics import ListAPIView

# Create your views here.
logger = logging.getLogger(__name__)

User = get_user_model()

class ActivateUserView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, uid, token):
        logger.info(f"Account activation attempt with UID: {uid}")
        try:
            user_id = decode_uid(uid)
            user = User.objects.get(pk=user_id)
            logger.info(f"Found user with ID: {user_id}, email: {user.email}")
            
            # Validate token
            if default_token_generator.check_token(user, token):
                # Check if user is already active
                if user.is_active:
                    logger.info(f"User {user.email} is already active, skipping activation")
                    return Response({"message": "Account already activated!"}, status=status.HTTP_200_OK)
                
                # Activate the user
                user.is_active = True
                user.save()
                logger.info(f"Successfully activated user: {user.email}")
                return Response({"message": "Account activated!"}, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Invalid token for user: {user.email}")
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        except (User.DoesNotExist, ValueError, TypeError) as e:
            logger.error(f"Activation error: {str(e)}")
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Generate reset token and URL
        uid = encode_uid(user.pk)
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_DOMAIN}/password-reset/{uid}/{token}/"
        
        # Send email
        subject = "Password Reset Request"
        message = f"Click the link to reset your password: {reset_url}"
        
        # Check if it's a temporary email domain
        is_temp = is_temp_email_domain(email)
        if is_temp:
            logger.info(f"Sending password reset email to temporary domain: {email}")
            
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=is_temp)
            logger.info(f"Password reset email sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send password reset email to {email}: {str(e)}")
            if not is_temp:
                return Response({"error": "Failed to send email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, uid, token):
        try:
            user_id = decode_uid(uid)
            user = User.objects.get(pk=user_id)
            
            # Validate token
            if default_token_generator.check_token(user, token):
                return Response({"message": "Valid token. You can now reset your password."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, uid, token):
            try:
                user_id = decode_uid(uid)
                user = User.objects.get(pk=user_id)
                
                # Validate token
                if default_token_generator.check_token(user, token):
                    new_password = request.data.get('new_password')
                    if not new_password:
                        return Response({"error": "New password is required"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    user.set_password(new_password)
                    user.save()
                    return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

            except (User.DoesNotExist, ValueError, TypeError):
                return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

# Auth check endpoints
class FarmerAuthCheckView(APIView):
    """
    View to check if the user is authenticated and is a farmer.
    Used to protect farmer routes in the frontend.
    """
    permission_classes = [IsFarmer]
    
    def get(self, request):
        return Response({
            "is_authenticated": True,
            "user_type": request.user.user_type,
            "user_id": request.user.id,
            "full_name": request.user.full_name
        }, status=status.HTTP_200_OK)

class UserTypeView(APIView):
    """
    View to get the user type of the authenticated user.
    Used to determine which routes to show in the frontend.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            "user_type": request.user.user_type,
            "user_id": request.user.id,
            "full_name": request.user.full_name
        }, status=status.HTTP_200_OK)

class NewsArticleListView(ListAPIView):
    """
    API view to retrieve news articles.
    
    GET: Returns a list of all active news articles.
    Can be filtered by category using query parameter 'category'.
    """
    serializer_class = NewsArticleSerializer
    permission_classes = [AllowAny]  # Allow anyone to view news articles
    
    def get_queryset(self):
        """
        Optionally filters the queryset by category if provided in query params.
        Only returns active articles, ordered by creation date (newest first).
        """
        queryset = NewsArticle.objects.filter(is_active=True).order_by('-created_at')
        
        # Filter by category if provided in query params
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
            
        return queryset
    
    def get_serializer_context(self):
        """
        Add request to serializer context to enable building absolute URLs
        """
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context