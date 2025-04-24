"""
ASGI config for AgroConnect project.

It exposes the ASGI callable as a module-level variable named ``application``.

Its primary role is to handle asynchronous web protocols, particularly WebSockets, in addition to traditional HTTP requests.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AgroConnect.settings')
django.setup()

# Import chat.routing after Django setup to avoid AppRegistryNotReady exception
from chat import routing
from chat.middleware import JWTAuthMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            AuthMiddlewareStack(
                URLRouter(
                    routing.websocket_urlpatterns
                )
            )
        )
    ),
})
