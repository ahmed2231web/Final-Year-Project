import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import ChatRoom, ChatMessage, ChatMessageImage, OrderStatus
import base64
import uuid
from django.core.files.base import ContentFile
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


'''
consumers.py: Real-time messaging handler
connect(): Authenticates and authorizes WebSocket connections
receive(): Processes incoming messages
disconnect(): Cleans up connections
Handles typing indicators and order status updates
'''


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # Get token from query params
        query_string = self.scope.get('query_string', b'').decode('utf-8')
        query_params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
        token = query_params.get('token', None)
        
        if not token:
            logger.error("No token provided in WebSocket connection")
            await self.close(code=4001)
            return
        
        # Validate token and get user
        try:
            # Decode token
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            
            # Get user from database
            self.user = await self.get_user(user_id)
            if not self.user:
                logger.error(f"User with ID {user_id} not found")
                await self.close(code=4002)
                return
            
            # Check if user has access to this room
            has_access = await self.check_room_access(self.room_id, user_id)
            if not has_access:
                logger.error(f"User {user_id} does not have access to room {self.room_id}")
                await self.close(code=4003)
                return
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # User-specific notification group has been removed
            
            await self.accept()
            
            # Mark messages as read when user connects to room
            await self.mark_messages_as_read()
            
            logger.info(f"User {self.user.id} connected to room {self.room_id}")
            
        except TokenError as e:
            logger.error(f"Invalid token: {str(e)}")
            await self.close(code=4001)
        except Exception as e:
            logger.error(f"Error in connect: {str(e)}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        try:
            # Leave room group
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            
            # User-specific notification group code has been removed
            
            # Remove user from active users set
            if hasattr(self, 'user') and hasattr(self, 'room_id'):
                logger.info(f"User {self.user.id} disconnected from room {self.room_id}")
            
        except Exception as e:
            logger.error(f"Error in disconnect: {str(e)}")
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            # Handle typing status
            if 'is_typing' in data:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_status',
                        'user_id': self.user.id,
                        'is_typing': data['is_typing']
                    }
                )
                return
            
            # Handle order status update
            if 'order_status' in data:
                new_status = data.get('order_status')
                room = await self.update_order_status(self.room_id, new_status)
                
                # Send order status update to group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'order_status_update',
                        'room_id': self.room_id,
                        'status': new_status,
                        'updated_by': self.user.id,
                        'updated_by_name': self.user.full_name
                    }
                )
                return
            
            # Handle message
            message_text = data.get('message', '').strip()
            image_data = data.get('image', None)
            images_data = data.get('images', [])  # Get multiple images if present
            
            # Don't save empty messages with no images
            if not message_text and not image_data and not images_data:
                return
            
            # Save message to database
            message = await self.save_message(message_text, image_data, images_data)
            
            # Check if this is a post-checkout message and update order status if needed
            is_post_checkout = message_text and (
                "I've just purchased" in message_text or 
                "I'd like to discuss delivery options" in message_text
            )
            
            if is_post_checkout:
                # Update room to mark it as a new order
                room = await self.update_room_for_new_order(self.room_id)
            

            
            # Get all image URLs for the message
            all_image_urls = await self.get_message_image_urls(message)
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message',
                    'message_id': message.id,
                    'message': message.message,
                    'sender_id': self.user.id,
                    'sender_name': self.user.full_name,
                    'timestamp': message.timestamp.isoformat(),
                    'image': message.image.url if message.image else None,
                    'all_image_urls': all_image_urls
                }
            )
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error in receive: {str(e)}")
    

    
    async def typing_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing_status',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        }))
    
    async def message(self, event):
        """
        Send message to WebSocket
        """
        try:
            # Get the base URL for media files
            from django.conf import settings
            media_url = settings.MEDIA_URL
            base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
            
            # Process image URLs to ensure they are absolute
            image_url = event.get('image')
            if image_url and not image_url.startswith(('http://', 'https://')):
                # If it's a relative URL, make it absolute
                if image_url.startswith('/'):
                    image_url = f"{base_url}{image_url}"
                else:
                    image_url = f"{base_url}/{image_url}"
            
            # Process all image URLs to ensure they are absolute
            all_image_urls = event.get('all_image_urls', [])
            processed_urls = []
            
            for url in all_image_urls:
                if url and not url.startswith(('http://', 'https://')):
                    # If it's a relative URL, make it absolute
                    if url.startswith('/'):
                        processed_urls.append(f"{base_url}{url}")
                    else:
                        processed_urls.append(f"{base_url}/{url}")
                else:
                    processed_urls.append(url)
            
            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'type': 'message',
                'message_id': event['message_id'],
                'message': event['message'],
                'sender_id': event['sender_id'],
                'sender_name': event['sender_name'],
                'timestamp': event['timestamp'],
                'image': image_url,
                'all_image_urls': processed_urls
            }))
        except Exception as e:
            logger.error(f"Error in message handler: {str(e)}")
    
    async def order_status_update(self, event):
        """
        Send order status update to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'order_status_update',
            'room_id': event['room_id'],
            'status': event['status'],
            'updated_by': event['updated_by'],
            'updated_by_name': event['updated_by_name']
        }))
    

    
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
    
    @database_sync_to_async
    def check_room_access(self, room_id, user_id):
        try:
            # Use room_id field instead of id for lookup
            room = ChatRoom.objects.get(room_id=room_id)
            return room.customer_id == user_id or room.farmer_id == user_id
        except ChatRoom.DoesNotExist:
            logger.error(f"Chat room with room_id {room_id} does not exist")
            return False
    
    @database_sync_to_async
    def save_message(self, message_text, image_data=None, images_data=None):
        """
        Save a message with optional image attachments
        """
        room = ChatRoom.objects.get(room_id=self.room_id)
        
        # Create message
        message = ChatMessage(
            room=room,
            sender=self.user,
            message=message_text
        )
        
        # Handle main image if provided
        if image_data:
            try:
                # Extract the base64 data
                format, imgstr = image_data.split(';base64,')
                ext = format.split('/')[-1]
                
                # Generate a unique filename
                filename = f"{uuid.uuid4()}.{ext}"
                
                # Save the image
                data = ContentFile(base64.b64decode(imgstr), name=filename)
                message.image = data
            except Exception as e:
                logger.error(f"Error saving main image: {str(e)}")
        
        # Save the message first to get an ID
        message.save()
        
        # Handle additional images if provided
        if images_data and isinstance(images_data, list):
            for img_data in images_data:
                try:
                    # Extract the base64 data
                    format, imgstr = img_data.split(';base64,')
                    ext = format.split('/')[-1]
                    
                    # Generate a unique filename
                    filename = f"{uuid.uuid4()}.{ext}"
                    
                    # Save the additional image
                    data = ContentFile(base64.b64decode(imgstr), name=filename)
                    
                    # Create the ChatMessageImage instance
                    ChatMessageImage.objects.create(
                        message=message,
                        image=data
                    )
                except Exception as e:
                    logger.error(f"Error saving additional image: {str(e)}")
        
        # Update room's unread status based on sender
        if self.user.id == room.customer_id:
            room.has_unread_farmer = True
            room.has_unread_customer = False
        else:
            room.has_unread_customer = True
            room.has_unread_farmer = False
        room.save()
        
        return message
    
    @database_sync_to_async
    def get_message_image_urls(self, message):
        """
        Get all image URLs for a message including the main image and additional images
        """
        image_urls = []
        
        # Add main image if it exists
        if message.image:
            try:
                # Use request-independent URL
                image_urls.append(message.image.url)
            except Exception as e:
                logger.error(f"Error getting main image URL: {str(e)}")
        
        # Add additional images
        for img in message.images.all():
            try:
                # Use request-independent URL
                image_urls.append(img.image.url)
            except Exception as e:
                logger.error(f"Error getting additional image URL: {str(e)}")
            
        return image_urls
    

    
    @database_sync_to_async
    def update_order_status(self, room_id, new_status):
        """
        Update the order status of a chat room
        """
        from .models import OrderStatus
        
        try:
            room = ChatRoom.objects.get(room_id=room_id)
            
            # Validate the status
            if new_status not in [choice[0] for choice in OrderStatus.choices]:
                logger.error(f"Invalid order status: {new_status}")
                return None
            
            # Update the room status
            room.order_status = new_status
            
            # If the status is changing from NEW to something else, mark it as not new
            if new_status != OrderStatus.NEW:
                room.is_new_order = False
            
            room.save()
            return room
        except ChatRoom.DoesNotExist:
            logger.error(f"Chat room with room_id {room_id} does not exist")
            return None
        except Exception as e:
            logger.error(f"Error updating order status: {str(e)}")
            return None
    
    @database_sync_to_async
    def update_room_for_new_order(self, room_id):
        """
        Update the room to mark it as a new order
        """
        from .models import OrderStatus
        
        try:
            room = ChatRoom.objects.get(room_id=room_id)
            
            # Set as new order with NEW status
            room.is_new_order = True
            room.order_status = OrderStatus.NEW
            
            # Update the order timestamp
            from django.utils import timezone
            room.order_timestamp = timezone.now()
            
            room.save()
            return room
        except ChatRoom.DoesNotExist:
            logger.error(f"Chat room with room_id {room_id} does not exist")
            return None
        except Exception as e:
            logger.error(f"Error updating room for new order: {str(e)}")
            return None

    @database_sync_to_async
    def mark_messages_as_read(self):
        """
        Mark all messages in the room as read for the current user
        """
        try:
            room = ChatRoom.objects.get(room_id=self.room_id)
            
            # Get the other user
            other_user = room.farmer if self.user.id == room.customer.id else room.customer
            
            # Mark messages from the other user as read
            updated = ChatMessage.objects.filter(
                room=room,
                sender=other_user,
                is_read=False
            ).update(is_read=True)
            
            # Update room's unread status
            if self.user.id == room.customer.id:
                room.has_unread_customer = False
            else:
                room.has_unread_farmer = False
            room.save()
            
            return updated
        except Exception as e:
            logger.error(f"Error marking messages as read: {str(e)}")
            return 0