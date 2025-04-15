from django.urls import path
from .views import FarmerDashboardDataView

urlpatterns = [
    path('farmer/dashboard-data/', FarmerDashboardDataView.as_view(), name='farmer-dashboard-data'),
]
