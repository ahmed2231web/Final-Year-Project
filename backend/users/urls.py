# users/urls.py
from django.urls import path
from .views import ActivateUserView, PasswordResetConfirmView, PasswordResetRequestView

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
]