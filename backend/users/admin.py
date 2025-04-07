from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import CustomUser, NewsArticle  # Import the CustomUser and NewsArticle models

class UserModelAdmin(BaseUserAdmin):
    """
    Custom admin configuration for the CustomUser model.
    Extends Django's BaseUserAdmin to customize the admin interface.
    """

    # Display fields in the list view
    list_display = (
        'id', 'email', 'full_name', 'phone_number', 'province', 'city',
        'user_type', 'is_active', 'date_joined'
    )
    # Specifies the fields to display in the list view of the admin interface.
    # Includes user ID, email, full name, phone number, province, city, user type,
    # active status, and the date the user joined.

    list_filter = ('user_type', 'is_active', 'province', 'city')
    # Adds filters to the admin list view to allow filtering by user type,
    # active status, province, and city.

    # Fields arrangement in detail view
    fieldsets = (
        ('User Credentials', {'fields': ('email', 'password')}),
        # Group fields related to user credentials (email and password) in the detail view.

        ('Personal info', {'fields': ('full_name', 'phone_number', 'province', 'city')}),
        # Group personal information fields (full name, phone number, province, and city) in the detail view.

        ('Type and Status', {'fields': ('user_type',)}),
        # Group the user type field in the detail view.

        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        # Group permission-related fields (active status, staff status, and superuser status) in the detail view.

        ('Important dates', {'fields': ('last_login',)}),
        # Group important date fields (last login) in the detail view.
        # The 'date_joined' field is excluded as it is non-editable.
    )

    # Fields shown when creating a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'full_name', 'phone_number', 'province', 'city',
                'user_type', 'password1', 'password2'
            ),
        }),
    )
    # Specifies the fields to display when creating a new user in the admin interface.
    # Includes email, full name, phone number, province, city, user type, and password fields.

    readonly_fields = ('date_joined', 'last_login')
    # Makes the 'date_joined' and 'last_login' fields read-only in the admin interface.

    search_fields = ('email', 'full_name', 'phone_number', 'province', 'city')
    # Adds search functionality to the admin list view, allowing searches by email,
    # full name, phone number, province, and city.

    ordering = ('email', 'id')
    # Specifies the default ordering of records in the admin list view by email and ID.

    filter_horizontal = ()
    # Specifies that no fields should use the horizontal filter widget in the admin interface.

class NewsArticleAdmin(admin.ModelAdmin):
    """
    Custom admin configuration for the NewsArticle model.
    Provides a user-friendly interface for managing news articles.
    """
    list_display = ('title', 'category', 'is_active', 'display_image', 'article_link')
    list_filter = ('category', 'is_active')
    search_fields = ('title', 'description')
    
    fieldsets = (
        ('Article Content', {
            'fields': ('title', 'description', 'image', 'article_url', 'category')
        }),
        ('Settings', {
            'fields': ('is_active',)
        }),
    )
    
    def display_image(self, obj):
        """Display a thumbnail of the image in the admin list view"""
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.image.url)
        return "No Image"
    display_image.short_description = 'Image'
    
    def article_link(self, obj):
        """Display a clickable link to the original article"""
        return format_html('<a href="{}" target="_blank">View Source</a>', obj.article_url)
    article_link.short_description = 'Article Link'

# Register the CustomUser and NewsArticle models with the admin interface
admin.site.register(CustomUser, UserModelAdmin)
admin.site.register(NewsArticle, NewsArticleAdmin)