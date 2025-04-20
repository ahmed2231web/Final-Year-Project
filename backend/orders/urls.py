from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmerDashboardDataView, OrderViewSet
from .stripe_webhook import stripe_webhook

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('farmer/dashboard-data/', FarmerDashboardDataView.as_view(), name='farmer-dashboard-data'),
    path('webhook/stripe/', stripe_webhook, name='stripe-webhook'),
]
