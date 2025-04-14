from django.db.models import Q
from django.http import Http404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
import uuid
import logging
import requests
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from django.conf import settings
import os

from .models import ChatRoom, ChatMessage, ChatMessageImage, OrderStatus
from .serializers import ChatRoomSerializer, ChatMessageSerializer, ChatMessageImageSerializer
from users.models import CustomUser
from products.models import Product

logger = logging.getLogger(__name__)


'''
ChatRoomViewSet: Main controller for chat rooms
create(): Handles room creation (both regular and post-checkout)
messages(): Retrieves conversation history
mark_read(): Updates read status
update_order_status(): Farmer-only status updates
'''



class ChatRoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing chat rooms.
    
    Provides CRUD operations and custom actions for chat rooms.
    """
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return chat rooms where the current user is either the customer or the farmer.
        """
        user = self.request.user
        return ChatRoom.objects.filter(
            Q(customer=user) | Q(farmer=user)
        ).order_by('-updated_at')
    
    def get_object(self):
        """
        Override get_object to handle room_id lookup.
        
        This allows us to use the UUID string as the lookup key instead of the primary key.
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        
        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )
        
        # Try to get the room by room_id (UUID string)
        room_id = self.kwargs[lookup_url_kwarg]
        
        try:
            # First try to get by room_id (UUID string)
            obj = ChatRoom.objects.get(room_id=room_id)
        except ChatRoom.DoesNotExist:
            try:
                # If that fails, try to get by primary key (id)
                obj = ChatRoom.objects.get(pk=room_id)
            except ChatRoom.DoesNotExist:
                raise Http404('No chat room found matching the query')
        
        # Check permissions
        self.check_object_permissions(self.request, obj)
        return obj
    
    @action(detail=False, methods=['post'])
    def create_or_get_room(self, request):
        """
        Create a new chat room or return an existing one between the customer and farmer.
        """
        try:
            customer_id = request.data.get('customer')
            farmer_id = request.data.get('farmer')
            product_id = request.data.get('product')
            quantity = request.data.get('quantity', 1)
            is_post_checkout = request.data.get('is_post_checkout', False)
            product_image_url = request.data.get('product_image_url')  # Get product image URL
            
            # Validate required fields
            if not customer_id or not farmer_id:
                return Response(
                    {'error': 'Customer and farmer IDs are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if the users exist
            try:
                customer = CustomUser.objects.get(id=customer_id)
                farmer = CustomUser.objects.get(id=farmer_id)
            except CustomUser.DoesNotExist:
                return Response(
                    {'error': 'One or both users do not exist'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if the product exists if product_id is provided
            product = None
            if product_id:
                try:
                    product = Product.objects.get(id=product_id)
                except Product.DoesNotExist:
                    return Response(
                        {'error': 'Product does not exist'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Check if a room already exists between these users for this product
            existing_room = None
            
            if product:
                # First try to find a room with the exact product
                existing_room = ChatRoom.objects.filter(
                    customer=customer,
                    farmer=farmer,
                    product=product
                ).first()
            
            if not existing_room:
                # If no room with exact product, find any room between these users
                existing_room = ChatRoom.objects.filter(
                    customer=customer,
                    farmer=farmer
                ).first()
            
            if existing_room:
                # Return the existing room
                serializer = ChatRoomSerializer(
                    existing_room, 
                    context={'request': request}
                )
                return Response(serializer.data)
            
            # Create a new room with a unique ID
            room_id = f"{customer.id}_{farmer.id}_{uuid.uuid4().hex[:8]}"
            
            new_room = ChatRoom.objects.create(
                room_id=room_id,
                customer=customer,
                farmer=farmer,
                product=product,
                quantity=quantity
            )
            
            # If this is a post-checkout room, create an initial message
            if is_post_checkout and product:
                # Check if a message already exists in the room
                existing_message = ChatMessage.objects.filter(
                    room=new_room,
                    sender=customer,
                    message__contains=product.productName
                ).first()
                
                if existing_message:
                    logger.info(f"Initial message already exists in room {room_id}, skipping creation")
                else:
                    # Create welcome message from customer to farmer
                    message_text = f"Hello! I've just purchased {quantity} {quantity > 1 and 'units' or 'unit'} of {product.productName}. I'd like to discuss delivery options and any other details about my order."
                    
                    message = ChatMessage.objects.create(
                        room=new_room,
                        sender=customer,
                        message=message_text
                    )
                    
                    # If product image URL was provided, try to attach it to the message
                    if product_image_url:
                        try:
                            # The URL might be relative or absolute, handle both cases
                            if product_image_url.startswith('http'):
                                # For absolute URLs, we need to download the image
                                response = requests.get(product_image_url)
                                if response.status_code == 200:
                                    # Create a temporary file
                                    img_temp = NamedTemporaryFile(delete=True)
                                    img_temp.write(response.content)
                                    img_temp.flush()
                                    
                                    # Save the image to the message
                                    message.image.save(
                                        f"product_{product.id}.jpg",
                                        File(img_temp)
                                    )
                            else:
                                # For relative URLs, we can use the product's image directly
                                # Strip leading slash if present
                                if product_image_url.startswith('/'):
                                    product_image_url = product_image_url[1:]
                                
                                # Get the path relative to MEDIA_ROOT
                                image_path = os.path.join(settings.MEDIA_ROOT, product_image_url)
                                
                                if os.path.exists(image_path):
                                    with open(image_path, 'rb') as f:
                                        message.image.save(
                                            f"product_{product.id}.jpg",
                                            File(f)
                                        )
                        except Exception as e:
                            print(f"Error attaching product image: {str(e)}")
                
                # Set unread flag for farmer
                new_room.has_unread_farmer = True
                new_room.save()
            
            serializer = ChatRoomSerializer(
                new_room, 
                context={'request': request}
            )
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def create(self, request, *args, **kwargs):
        """
        Create a new chat room between a customer and a farmer about a product.
        
        If a room already exists for the same customer, farmer and product,
        return the existing room instead of creating a new one.
        """
        try:
            data = request.data
            logger.info(f"Chat room creation request data: {data}")
            
            product_id = data.get('product')
            customer_id = data.get('customer')
            farmer_id = data.get('farmer')
            quantity = data.get('quantity', 1)
            is_post_checkout = data.get('is_post_checkout', False)
            
            logger.info(f"Processing chat room creation: product={product_id}, customer={customer_id}, farmer={farmer_id}, quantity={quantity}, is_post_checkout={is_post_checkout}")
            
            # Check if required fields are provided
            if not all([product_id, customer_id, farmer_id]):
                logger.error(f"Missing required fields: product={product_id}, customer={customer_id}, farmer={farmer_id}")
                return Response(
                    {"error": "Product, customer and farmer are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate farmer_id is not 'undefined' or invalid
            if farmer_id == 'undefined' or not farmer_id:
                logger.error(f"Invalid farmer_id: {farmer_id}")
                return Response(
                    {"error": "Invalid farmer ID. Please select a valid farmer."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if the user is either the customer or the farmer
            user = request.user
            logger.info(f"Request user: {user.id}, customer_id: {customer_id}, farmer_id: {farmer_id}")
            
            if str(user.id) != str(customer_id) and str(user.id) != str(farmer_id):
                logger.error(f"User {user.id} is not a participant in this chat")
                return Response(
                    {"error": "You can only create chats where you are a participant"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get the customer, farmer and product
            try:
                customer = CustomUser.objects.get(id=customer_id)
                farmer = CustomUser.objects.get(id=farmer_id)
                product = Product.objects.get(id=product_id)
            except (CustomUser.DoesNotExist, Product.DoesNotExist) as e:
                logger.error(f"Error retrieving customer, farmer or product: {str(e)}")
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if a room already exists
            existing_room = ChatRoom.objects.filter(
                customer=customer,
                farmer=farmer,
                product=product
            ).first()
            
            if existing_room:
                # Update quantity if it has changed
                if existing_room.quantity != quantity:
                    existing_room.quantity = quantity
                    existing_room.save()
                    
                serializer = self.get_serializer(existing_room)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            # Create a new room with a unique ID
            room_id = str(uuid.uuid4())
            room = ChatRoom.objects.create(
                room_id=room_id,
                customer=customer,
                farmer=farmer,
                product=product,
                quantity=quantity
            )
            
            # Check if this is a post-checkout chat creation
            if is_post_checkout:
                try:
                    # Create an initial message from the customer to the farmer with product name in bold
                    initial_message = f"<strong>{product.productName}</strong>\n\nHello! I've just purchased {quantity} {quantity > 1 and 'units' or 'unit'} of {product.productName}. I'd like to discuss delivery options and any other details about my order."
                    
                    # Save the message
                    message = ChatMessage.objects.create(
                        room=room,
                        sender=customer,
                        message=initial_message
                    )
                    
                    # Mark the room as having unread messages for the farmer
                    room.has_unread_farmer = True
                    room.save()
                    
                    logger.info(f"Created post-checkout chat room {room_id} with initial message")
                except Exception as msg_error:
                    logger.error(f"Error creating initial message for post-checkout chat: {str(msg_error)}")
                    # Continue even if message creation fails
            
            # Create initial message about the product
            if product and not is_post_checkout:
                product_name = product.productName
                initial_message = (
                    f"<strong>{product_name}</strong>\n\n"
                    f"Hi, I'm interested in purchasing {quantity} unit(s) "
                    f"of {product_name}. Can you provide more information about it?"
                )
                
                # Customer is the sender of the initial message
                try:
                    initial_msg = ChatMessage.objects.create(
                        room=room,
                        sender=customer,
                        message=initial_message
                    )
                    
                    # Mark the room as having unread messages for the farmer
                    room.has_unread_farmer = True
                    room.save()
                except Exception as msg_error:
                    logger.error(f"Error creating initial message for chat: {str(msg_error)}")
                    # Continue even if message creation fails
            
            serializer = self.get_serializer(room)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating chat room: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """
        Get all messages for a specific chat room
        """
        try:
            room = self.get_object()
            user = request.user
            
            # Check if user is a participant in the chat
            if user != room.customer and user != room.farmer:
                return Response({"error": "You are not a participant in this chat"}, status=status.HTTP_403_FORBIDDEN)
            
            # Get all messages for this room
            messages = ChatMessage.objects.filter(room=room).order_by('timestamp')
            
            # Update unread flags based on who is viewing the messages
            if user == room.customer and room.has_unread_customer:
                room.has_unread_customer = False
                room.save(update_fields=['has_unread_customer'])
            elif user == room.farmer and room.has_unread_farmer:
                room.has_unread_farmer = False
                room.save(update_fields=['has_unread_farmer'])
            
            # Serialize messages with request context for proper URL handling
            serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
            
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark all messages in a chat room as reaLoook when i click on proceed to checkout button two times message goes this must go one timed for the current user.
        """
        try:
            # Get the chat room using our overridden get_object method
            room = self.get_object()
            
            # Check if the user is a participant
            user = request.user
            if user != room.customer and user != room.farmer:
                return Response(
                    {"error": "You are not a participant in this chat"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get the other user in the chat
            other_user = room.farmer if user == room.customer else room.customer
            
            # Mark messages from the other user as read
            updated = ChatMessage.objects.filter(
                room=room,
                sender=other_user,
                is_read=False
            ).update(is_read=True)
            
            # Update the unread flags in the chat room
            if user == room.customer:
                room.has_unread_customer = False
            else:
                room.has_unread_farmer = False
            room.save()
            
            # Notifications functionality has been removed
            
            return Response(
                {
                    "status": "success", 
                    "message": "All messages marked as read",
                    "messages_updated": updated,
                    # "notifications_updated": notif_updated
                },
                status=status.HTTP_200_OK
            )
            
        except Http404:
            logger.error(f"Chat room not found: {pk}")
            return Response(
                {"error": f"Chat room not found: {pk}"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error marking messages as read: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def update_order_status(self, request, pk=None):
        """
        Update the order status of a chat room.
        
        Only the farmer can update the order status.
        """
        try:
            chat_room = self.get_object()
            
            # Check if the user is the farmer for this room
            if request.user.id != chat_room.farmer.id:
                return Response(
                    {'error': 'Only the farmer can update order status'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get the new status from the request
            new_status = request.data.get('status')
            
            # Validate the status
            if new_status not in [choice[0] for choice in OrderStatus.choices]:
                return Response(
                    {'error': f'Invalid status. Must be one of: {", ".join([choice[0] for choice in OrderStatus.choices])}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update the chat room status
            chat_room.order_status = new_status
            
            # If the status is changing from NEW to something else, mark it as not new
            if new_status != OrderStatus.NEW:
                chat_room.is_new_order = False
            
            chat_room.save()
            
            # Return the updated chat room
            serializer = self.get_serializer(chat_room)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating order status: {str(e)}")
            return Response(
                {'error': f'Failed to update order status: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def farmer_orders(self, request):
        """
        Get all orders (chat rooms) for the farmer, sorted by status and recency.
        
        This endpoint is specifically for the farmer dashboard.
        """
        try:
            user = request.user
            
            # Get all chat rooms where the user is the farmer
            chat_rooms = ChatRoom.objects.filter(farmer=user).order_by('-updated_at')
            
            # Sort by status priority: NEW, ACTIVE, COMPLETED
            # This is done in Python rather than the database for more flexibility
            status_priority = {
                OrderStatus.NEW: 0,
                OrderStatus.ACTIVE: 1,
                OrderStatus.COMPLETED: 2
            }
            
            sorted_rooms = sorted(chat_rooms, key=lambda room: (
                status_priority.get(room.order_status, 999),  # Sort by status priority
                not room.is_new_order,  # Then by is_new_order (True first)
                -room.updated_at.timestamp()  # Then by updated_at (newest first)
            ))
            
            serializer = self.get_serializer(sorted_rooms, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching farmer orders: {str(e)}")
            return Response(
                {'error': f'Failed to fetch orders: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


'''
ChatMessageViewSet: Manages message CRUD operations
Handles text messages and image attachments
'''

class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing chat messages.
    
    Provides CRUD operations for chat messages within a chat room.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return messages for chat rooms where the current user is a participant.
        """
        user = self.request.user
        return ChatMessage.objects.filter(
            Q(room__customer=user) | Q(room__farmer=user)
        ).order_by('timestamp')
    
    def create(self, request, *args, **kwargs):
        """
        Create a new message in a chat room.
        
        The user must be a participant in the chat room.
        """
        try:
            # Get room_id from either 'room_id' or 'room' parameter
            room_id = request.data.get('room_id')
            room_pk = request.data.get('room')
            message_text = request.data.get('message', '').strip()
            product_id = request.data.get('product_id')
            product_image = request.data.get('product_image')
            
            # Try to get room by room_id first, then by primary key
            try:
                if room_id:
                    room = ChatRoom.objects.get(room_id=room_id)
                elif room_pk:
                    room = ChatRoom.objects.get(pk=room_pk)
                else:
                    return Response({"error": "Room ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            except ChatRoom.DoesNotExist:
                return Response({"error": "Chat room not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if user is a participant
            user = request.user
            if user != room.customer and user != room.farmer:
                return Response({"error": "You are not a participant in this chat"}, status=status.HTTP_403_FORBIDDEN)
            
            # Create message object
            message = ChatMessage.objects.create(
                room=room,
                sender=user,
                message=message_text
            )
            
            # Handle single image upload
            image = request.FILES.get('image')
            if image:
                message.image = image
                message.save()
            
            # Handle product image if provided
            if product_image:
                # If product_image is a URL, download and save it
                if isinstance(product_image, str) and (product_image.startswith('http://') or product_image.startswith('https://')):
                    try:
                        import requests
                        from django.core.files.base import ContentFile
                        import uuid
                        
                        # Download the image
                        response = requests.get(product_image)
                        if response.status_code == 200:
                            # Generate a unique filename
                            file_extension = product_image.split('.')[-1] if '.' in product_image else 'jpg'
                            filename = f"product_image_{uuid.uuid4()}.{file_extension}"
                            
                            # Save the image to the message
                            message.image.save(filename, ContentFile(response.content), save=True)
                    except Exception as e:
                        print(f"Error downloading product image: {e}")
                
                # If product_image is a file, save it directly
                elif hasattr(product_image, 'read'):
                    message.image = product_image
                    message.save()
            
            # Handle multiple images
            images = request.FILES.getlist('images')
            if images:
                for img in images:
                    ChatMessageImage.objects.create(message=message, image=img)
            
            # Update unread flags based on who sent the message
            if user == room.customer:
                room.has_unread_farmer = True
                room.save(update_fields=['has_unread_farmer'])
            else:
                room.has_unread_customer = True
                room.save(update_fields=['has_unread_customer'])
            
            # Return serialized message with request context for proper URL handling
            serializer = ChatMessageSerializer(message, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        """
        Mark messages as read in a chat room.
        
        This endpoint marks all messages from the other user as read.
        """
        try:
            room_id = request.data.get('room_id')
            logger.info(f"Mark read request received for room_id: {room_id}")
            
            if not room_id:
                logger.warning("Mark read request missing room_id parameter")
                return Response(
                    {"error": "Room ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the chat room
            try:
                # Try to get by room_id (UUID string) first
                logger.info(f"Looking up chat room by room_id: {room_id}")
                room = ChatRoom.objects.get(room_id=room_id)
                logger.info(f"Found chat room with room_id: {room_id}")
            except ChatRoom.DoesNotExist:
                try:
                    # If that fails, try to get by primary key (id)
                    logger.info(f"Looking up chat room by id: {room_id}")
                    room = ChatRoom.objects.get(id=room_id)
                    logger.info(f"Found chat room with id: {room_id}")
                except ChatRoom.DoesNotExist:
                    logger.error(f"Chat room not found with room_id or id: {room_id}")
                    return Response(
                        {"error": "Chat room not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )
                except Exception as e:
                    logger.error(f"Error looking up chat room by id: {str(e)}")
                    return Response(
                        {"error": f"Error looking up chat room: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            except Exception as e:
                logger.error(f"Error looking up chat room by room_id: {str(e)}")
                return Response(
                    {"error": f"Error looking up chat room: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Check if user is a participant
            user = request.user
            if user.id != room.customer.id and user.id != room.farmer.id:
                logger.error(f"User {user.id} is not a participant in this chat room")
                return Response(
                    {"error": "You are not a participant in this chat room"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Mark messages from the other user as read
            other_user = room.farmer if user.id == room.customer.id else room.customer
            unread_count = ChatMessage.objects.filter(
                room=room,
                sender=other_user,
                is_read=False
            ).update(is_read=True)
            
            # Update room's unread status
            if user.id == room.customer.id:
                room.has_unread_customer = False
            else:
                room.has_unread_farmer = False
            room.save()
            
            return Response(
                {"success": True, "messages_read": unread_count},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error marking messages as read: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
