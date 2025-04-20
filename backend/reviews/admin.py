from django.contrib import admin
from .models import Feedback, FeedbackResponse

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'customer', 'farmer', 'rating', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'rating', 'created_at']
    search_fields = ['comment', 'customer__email', 'farmer__email', 'product__productName']
    actions = ['approve_feedback']
    
    def approve_feedback(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f"{queryset.count()} feedback entries approved.")
    approve_feedback.short_description = "Approve selected feedback"

@admin.register(FeedbackResponse)
class FeedbackResponseAdmin(admin.ModelAdmin):
    list_display = ['feedback', 'farmer', 'created_at']
    search_fields = ['response', 'farmer__email']
