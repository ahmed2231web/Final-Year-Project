from django.contrib import admin
from .models import ChatRoom, ChatMessage

# Register your models here.

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('room_id', 'customer', 'farmer', 'product', 'quantity', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('room_id', 'customer__name', 'farmer__name', 'product__productName')
    date_hierarchy = 'created_at'

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'room', 'short_message', 'is_read', 'timestamp')
    list_filter = ('is_read', 'timestamp')
    search_fields = ('message', 'sender__name', 'room__room_id')
    date_hierarchy = 'timestamp'

    def short_message(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    short_message.short_description = 'Message'

# ChatNotification admin has been removed
