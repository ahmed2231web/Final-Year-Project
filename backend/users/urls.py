# users/urls.py
from django.urls import path
from .views import (
    ActivateUserView, 
    PasswordResetConfirmView, 
    PasswordResetRequestView,
    FarmerAuthCheckView,
    UserTypeView,
    NewsArticleListView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # URL for user account activation. Requires a UID and token as parameters.
    # The `ActivateUserView` handles the activation logic.
    path('user/activate/<str:uid>/<str:token>/', ActivateUserView.as_view(), name='activate-user'),

    # URL for requesting a password reset. Users can submit their email to receive a reset link.
    # The `PasswordResetRequestView` handles the request logic.
    path('user/password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),

    # URL for confirming a password reset. Requires a UID and token as parameters.
    # The `PasswordResetConfirmView` handles the confirmation logic.
    path('user/password-reset/<str:uid>/<str:token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # Auth check endpoints
    path('user/check-farmer/', FarmerAuthCheckView.as_view(), name='check-farmer-auth'),
    path('user/user-type/', UserTypeView.as_view(), name='get-user-type'),
    
    # News Articles endpoint
    path('news/', NewsArticleListView.as_view(), name='news-articles'),
    
    # JWT endpoints
    path('jwt/create/', TokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('jwt/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]