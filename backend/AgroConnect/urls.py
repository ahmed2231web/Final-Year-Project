from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

# Debug prints to confirm settings
print("DEBUG:", settings.DEBUG)
print("MEDIA_URL:", settings.MEDIA_URL)
print("MEDIA_ROOT:", settings.MEDIA_ROOT)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('djoser.urls')),
    path('auth/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/chatbot/', include('ai_chatbot.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/orders/', include('orders.urls')),
]

# Serve media files during development
if settings.DEBUG:
    print("Serving media files at", settings.MEDIA_URL)
    # Explicitly map /media/ to serve view
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
    # Alternatively, use static() (you can keep both for redundancy during debugging)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Add static files serving
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    print(f"Serving static files at {settings.STATIC_URL} from {settings.STATIC_ROOT}")
else:
    print("DEBUG is False, media files will not be served by Django.")