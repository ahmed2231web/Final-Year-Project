# 🌾 AgroConnect - Revolutionizing Agricultural E-Commerce

[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)

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

## 🛠️ Tech Stack

### 🔙 Backend Architecture
- **Framework:** Django REST Framework - Robust and scalable API development
- **Database:** PostgreSQL - Reliable data persistence
- **Authentication:** JWT - Secure user authentication
- **Language:** Python 3.x - Clean and maintainable codebase
- **AI Models:** TensorFlow - Deep learning for image classification
- **LLM Integration:** Google Gemini API - Advanced conversational AI

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
│   ├── ai_chatbot/        # AI chatbot with image disease detection
│   ├── manage.py         # Django CLI
│   └── requirements.txt  # Python dependencies
│
└── 🎨 fronted/
    ├── src/             # React components & logic
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

### 💬 Communication
- Real-time messaging
- Notifications system
- Rating and review system

### 🤖 AI Chatbot & Disease Detection
- Image-based crop disease detection
- Intelligent agricultural advisory
- Persistent chat history across sessions
- Comprehensive disease information and treatment recommendations
- User-friendly image preview and selection

### 📱 Responsive Design
- Mobile-first approach
- Cross-browser compatibility
- Optimized performance

## 🚀 Getting Started

### 📋 Prerequisites
- Python 3.x
- Node.js (LTS version)
- PostgreSQL database
- Git

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

4. Initialize database:
```bash
python manage.py migrate
python manage.py createsuperuser
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
