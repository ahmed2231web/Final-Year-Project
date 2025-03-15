from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()

class IsFarmer(permissions.BasePermission):
    """
    Custom permission to only allow farmers to access the view.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == User.UserType.FARMER
        )

class IsCustomer(permissions.BasePermission):
    """
    Custom permission to only allow customers to access the view.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == User.UserType.CUSTOMER
        )

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == User.UserType.ADMIN
        )
