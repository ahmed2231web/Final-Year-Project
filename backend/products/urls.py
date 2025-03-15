from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CloudinaryDeleteView

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    path('cloudinary/delete/', CloudinaryDeleteView.as_view(), name='cloudinary-delete'),
]
