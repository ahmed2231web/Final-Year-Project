from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser  # Import from current directory, not from User

class UserModelAdmin(BaseUserAdmin):
    # Display fields in the list view
    list_display = ('id', 'email', 'fullName', 'phoneNumber', 'province', 'city', 'user_type', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_active', 'province', 'city')
    
    # Fields arrangement in detail view
    fieldsets = (
        ('User Credentials', {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('fullName', 'phoneNumber', 'province', 'city')}),
        ('Type and Status', {'fields': ('user_type',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login',)}),  # Removed date_joined as it's non-editable
    )
    
    # Fields shown when creating a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'fullName', 'phoneNumber', 
                      'province', 'city', 'user_type', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login')  # Make these fields read-only
    search_fields = ('email', 'fullName', 'phoneNumber', 'province', 'city')
    ordering = ('email', 'id')
    filter_horizontal = ()

# Register the CustomUser model with the admin interface
admin.site.register(CustomUser, UserModelAdmin)
