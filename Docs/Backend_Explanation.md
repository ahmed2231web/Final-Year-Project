# AgroConnect Backend System Documentation

## Detailed Module Explanations

### 1. Users App
**Purpose**: Handles all user-related functionality
**Key Features**:
- JWT-based authentication (Djoser + SimpleJWT)
- User registration with email verification
- Password reset functionality
- Profile management (bio, profile picture)
- Social authentication (Google, Facebook via social-auth-app-django)

**Key Files**:
- `models.py`: Defines User and Profile models
- `serializers.py`: Handles data serialization for API
- `views.py`: Contains API endpoints for user operations
- `urls.py`: Routes for user-related endpoints

### 2. Products App
**Purpose**: Manages agricultural product listings
**Key Features**:
- Product CRUD operations
- Category management
- Image uploads via Cloudinary
- Search and filtering capabilities

**Key Models**:
- Product: name, description, price, category, images
- Category: name, description
- ProductImage: image_url (Cloudinary), product relation

### 3. Orders App
**Purpose**: Handles order processing
**Key Features**:
- Shopping cart functionality
- Order creation and tracking
- Order history for users
- Payment integration (potential future expansion)

**Key Models**:
- Order: user, total, status, created_at
- OrderItem: product, quantity, price_at_order_time

### 4. Chat App
**Purpose**: Real-time communication
**Key Features**:
- WebSocket-based chat (Django Channels)
- Message history storage
- Online status tracking
- Image sharing capability

**Key Components**:
- `consumers.py`: WebSocket handlers
- `routing.py`: WebSocket URL routing
- `models.py`: Message storage
- `middleware.py`: Authentication for WebSockets

### 5. AI Chatbot App
**Purpose**: Provides AI-powered assistance
**Key Features**:
- Integration with Google Gemini API
- Natural language processing
- Context-aware responses
- Agricultural knowledge base

**Key Files**:
- `chatbot.py`: Main interaction logic
- `model_loader.py`: Handles Gemini model initialization
- `views.py`: API endpoints for chatbot interaction

## API Endpoint Reference
| Module     | Endpoint          | Method | Description               |
|------------|-------------------|--------|---------------------------|
| Users      | /api/auth/users/  | POST   | User registration         |
| Users      | /api/auth/jwt/create/ | POST | Login (get tokens)    |
| Products   | /api/products/    | GET    | List/search products      |
| Products   | /api/products/    | POST   | Create new product (admin)|
| Orders     | /api/orders/      | GET    | Get user's order history  |
| Chat       | /ws/chat/         | WS     | WebSocket chat endpoint   |
| Chatbot    | /api/chatbot/     | POST   | Send message to chatbot   |