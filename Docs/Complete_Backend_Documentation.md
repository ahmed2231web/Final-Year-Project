# AgroConnect Backend - Complete Technical Documentation

## System Architecture
The backend is built using Django with these key components:
- **Core Framework**: Django 5.1 with Django REST Framework
- **Database**: PostgreSQL (hosted on Neon)
- **Real-time**: Django Channels with Daphne
- **AI Integration**: Google Gemini API
- **Media Storage**: Cloudinary
- **Authentication**: JWT with Djoser

## Module Breakdown

### 1. User Management (users app)
- **Models**:
  - Custom User model extending AbstractUser
  - Profile model with additional user data
- **Features**:
  - JWT authentication (access + refresh tokens)
  - Email verification
  - Password reset flow
  - Social authentication (Google/Facebook)

### 2. Product System (products app)
- **Models**:
  - Product: name, description, price, category
  - ProductImage: Cloudinary-stored images
  - Category: Product classification
- **API Endpoints**:
  - Product list/search with filters
  - Product detail view
  - Category management

### 3. Order Processing (orders app)
- **Order Flow**:
  1. Cart creation
  2. Checkout initiation
  3. Payment processing
  4. Order confirmation
  5. Status updates
- **Models**:
  - Order: user, total, status, timestamp
  - OrderItem: product, quantity, price snapshot

### 4. Real-time Chat (chat app)
- **Components**:
  - WebSocket consumers
  - Message persistence
  - Read receipts
  - Image attachments
- **Technical Stack**:
  - Django Channels
  - Redis channel layer
  - ASGI (Daphne)

### 5. AI Chatbot (ai_chatbot app)
- **Integration**:
  - Google Gemini API
  - Context-aware responses
  - Agricultural knowledge base
- **Features**:
  - Natural language processing
  - Query understanding
  - Response generation

## Configuration Details

### Database (PostgreSQL)
- Connection via DATABASE_URL in .env
- Optimized for complex queries
- Full-text search capabilities

### Cloudinary Integration
- Media upload handling
- Image transformations
- Secure delivery

### Email Service
- SMTP configuration
- Template system
- Async sending

## API Documentation
[Include your API endpoints documentation here]

## Deployment
- ASGI server (Daphne)
- Production-ready configuration
- Environment variables management