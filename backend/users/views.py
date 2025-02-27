from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from djoser.utils import encode_uid, decode_uid
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.core.mail import send_mail
import logging

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
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
        
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