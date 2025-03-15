from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # djoser urls (excluding JWT endpoints that we've customized)
    path('auth/', include('djoser.urls')),
    
    # Our custom JWT endpoints and user-specific endpoints
    path('auth/', include('users.urls')),
    
    # Products API endpoints
    path('api/products/', include('products.urls')),
]
