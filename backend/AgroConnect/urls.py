from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # djsoer urls
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),

    # apps urls
    # path('', include('users.urls')),
]
