# 🌾 AgroConnect - Revolutionizing Agricultural E-Commerce

[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

## 🎯 Project Overview
AgroConnect is a cutting-edge agricultural e-commerce platform bridging the gap between farmers, buyers, and agricultural service providers. Our mission is to revolutionize the agricultural marketplace by providing a seamless, digital platform for trading agricultural products, equipment, and services.

### 🌟 Key Highlights
- 🤝 Direct farmer-to-buyer connections
- 💰 Transparent pricing system
- 📱 Mobile-responsive design
- 💬 Real-time chat functionality
- 📊 Market insights and analytics
- 🔒 Secure payment integration
- 🤖 AI-powered crop disease detection and advisory
- 🌿 Intelligent agricultural chatbot assistant
- 🌤️ Real-time weather updates for farmers

## 🛠️ Tech Stack

### 🔙 Backend Architecture
- **Framework:** Django REST Framework - Robust and scalable API development
- **Database:** PostgreSQL - Reliable data persistence
- **Authentication:** JWT - Secure user authentication
- **Language:** Python 3.x - Clean and maintainable codebase
- **AI Models:** TensorFlow - Deep learning for image classification
- **LLM Integration:** Google Gemini API - Advanced conversational AI
- **Payment Processing:** Stripe API - Secure payment integration

### 🎨 Frontend Development
- **Framework:** React.js - Dynamic and responsive UI
- **Styling:** Tailwind CSS - Modern and customizable design
- **Build Tool:** Vite - Lightning-fast development experience
- **Runtime:** Node.js - Efficient package management
- **State Persistence:** localStorage - Client-side data persistence

## 📁 Project Structure
```
📦 AgroConnect
├── 🔧 backend/
│   ├── AgroConnect/       # Core Django application
│   ├── users/             # User management system
│   ├── products/          # Product management system
│   ├── orders/            # Order management system with Stripe payment integration
│   ├── reviews/           # Review management system
│   ├── chat/              # Real-time communication system
│   ├── ai_chatbot/        # AI chatbot with image disease detection
│   ├── admin-interface/   # Customized admin interface
│   ├── manage.py         # Django CLI
│   └── requirements.txt  # Python dependencies
│
└── 🎨 fronted/
    ├── src/             # React components & logic
    │   ├── Components/  # Reusable UI components
    │   │   ├── Checkout/ # Stripe checkout components
    │   ├── Features/    # Feature-specific components
    │   └── Pages/       # Application pages
    ├── public/          # Static assets
    └── package.json     # Node.js configuration
```

## ✨ Features

### 🔐 User Management
- Secure authentication system
- Role-based access control
- Profile management
- Activity tracking

### 🛍️ Marketplace
- Advanced product search
- Category filtering
- Price comparison
- Order management
- Secure checkout process

### 🔄 Order Flow & Lifecycle
- **Complete Order Lifecycle Management**: 
  - Pending → Shipped → Delivered → Completed status progression
- **Customer Journey**:
  - Orders begin in 'Pending' status after payment authorization
  - Farmers mark orders as 'Shipped' when products are dispatched
  - Customers confirm receipt to update status to 'Delivered'
  - Payment is captured and order is marked 'Completed'
- **Visual Progress Tracking**: Interactive order status visualization
- **Status-specific Actions**: Different action buttons based on order status
- **Notification System**: Status change alerts for all parties

### 💬 Communication
- Real-time messaging
- Notifications system
- Rating and review system

### 💯 Product Feedback & Rating System
- **Post-Purchase Feedback**: Customers can rate and review products after order completion
- **Star Rating System**: Intuitive 1-5 star rating interface
- **Detailed Reviews**: Optional text feedback for comprehensive product experiences
- **Review Aggregation**: Product pages display average ratings and review counts
- **Feedback Analytics**: Farmers receive insights based on customer feedback
- **Verified Purchases**: Reviews are linked to confirmed orders for authenticity

### 🤖 AI Chatbot & Disease Detection
- Image-based crop disease detection
- Intelligent agricultural advisory
- Persistent chat history across sessions
- Comprehensive disease information and treatment recommendations
- User-friendly image preview and selection

### 🌤️ Weather Updates
- Real-time weather data for farming locations
- Agricultural-specific weather insights
- Customized farming advice based on weather conditions
- 3-day weather forecasts for planning
- Weather alerts and notifications for extreme conditions

### 📱 Responsive Design
- Mobile-first approach
- Cross-browser compatibility
- Optimized performance

### 🛒 Payment System
- Secure payment processing with Stripe
- Real-time payment status updates
- Order tracking and management
- Webhook integration for payment events
- Support for payment intents and refunds
- PCI-compliant checkout experience

### 🎛️ Admin Interface
- Customized Django admin interface
- Enhanced UI/UX for administrators
- Streamlined content management
- Branded admin experience
- Intuitive dashboard and analytics

## 🚀 Getting Started

### 📋 Prerequisites
- Python 3.x
- Node.js (LTS version)
- PostgreSQL database
- Git
- Stripe account (for payment processing)

### ⚙️ Backend Setup
1. Clone and enter the repository:
```bash
git clone https://github.com/yourusername/AgroConnect.git
cd backend
```

2. Set up Python environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment:
- Copy `.env.example` to `.env`
- Update database and API credentials
- Add your Google Gemini API key to enable the chatbot
- Configure your Stripe API keys (public and secret)

4. Initialize database:
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic  # Gather static files for admin interface
```

5. Launch server:
```bash
python manage.py runserver
```

### 🎨 Frontend Setup
1. Navigate to frontend:
```bash
cd fronted
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Access the application at `http://localhost:5173`

## 👥 Meet the Team

### Core Team
- **Ahmed Atta Ur Rehman** - Project Lead & Full-Stack Developer
  - 🔧 Backend Architecture
  - 📊 Database Design
  - 🔐 API Security
  - 🤖 AI Integration

- **Sami Ullah** - UI/UX Design Lead
  - 🎨 Interface Design
  - 📱 User Experience

- **Ahmad Mubashir / Ahsan Ullah** - Frontend Development
  - 💻 React Components
  - 🎨 UI Implementation
  - 📱 Responsive Design
  - 🌤️ Weather Integration

## 🤝 Contributing
We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit changes (`git commit -m 'Add: AmazingFeature'`)
4. 📤 Push to branch (`git push origin feature/AmazingFeature`)
5. 🔄 Open a Pull Request

## 🌟 Show Your Support
Give a ⭐️ if this project helped you!

---
<div align="center">
Made with ❤️ by the AgroConnect Team
</div>
