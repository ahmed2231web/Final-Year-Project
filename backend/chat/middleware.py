import logging
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from urllib.parse import parse_qs

logger = logging.getLogger(__name__)
User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware for JWT authentication in WebSocket connections.
    
    This middleware extracts the JWT token from the query string and authenticates the user based on the token.
    """
    
    async def __call__(self, scope, receive, send):
        # Extract token from query string
        query_params = parse_qs(scope["query_string"].decode())
        token = query_params.get("token", [None])[0]
        
        if token:
            try:
                # Decode the JWT token
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get("user_id")
                
                if user_id:
                    # Get the user from the database
                    user = await self.get_user(user_id)
                    if user:
                        # Add the user to the scope
                        scope["user"] = user
                        logger.info(f"Authenticated WebSocket connection for user {user_id}")
                    else:
                        logger.warning(f"User {user_id} not found for WebSocket connection")
                        scope["user"] = None
                else:
                    logger.warning("No user_id in token payload for WebSocket connection")
                    scope["user"] = None
            except jwt.ExpiredSignatureError:
                logger.warning("Expired JWT token for WebSocket connection")
                scope["user"] = None
            except jwt.InvalidTokenError:
                logger.warning("Invalid JWT token for WebSocket connection")
                scope["user"] = None
        else:
            logger.warning("No token provided for WebSocket connection")
            scope["user"] = None
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
