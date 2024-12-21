# AgroConnect - Agricultural E-Commerce Platform

## Project Overview
AgroConnect is a comprehensive agricultural e-commerce platform designed to connect farmers, buyers, and agricultural service providers. The platform facilitates direct trade of agricultural products, equipment, and services while providing valuable insights and resources to the farming community.

## Tech Stack
### Backend
- Django REST Framework
- PostgreSQL
- Python 3.x
- JWT Authentication

### Frontend
- React.js
- Tailwind CSS
- Vite
- Node.js

## Project Structure
```
├── backend/
│   ├── AgroConnect/       # Django main app
│   ├── users/             # User management app
│   ├── manage.py
│   └── requirements.txt   # Python dependencies
│
└── fronted/
    ├── src/              # React source files
    ├── public/           # Static assets
    └── package.json      # Node.js dependencies
```

## Features
- User Authentication and Authorization
- Product Listing and Management
- Order Processing
- Real-time Chat
- Agricultural Resources and Information
- Responsive Design for Multiple Devices

## Getting Started

### Prerequisites
- Python 3.x
- Node.js and npm
- PostgreSQL

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables in `.env` file

5. Run migrations:
```bash
python manage.py migrate
```

6. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd fronted
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 👥 Team Members
- **Ahmed Atta Ur Rehman** - Lead Developer
- **Sami Ullah** - UI/UX Designer
- **Ahmad Mubashir / Ahsan Ullah** - Frontend Developer
- **Ahmed Atta Ur Rehman** - Backend Developer

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact
Project Link: [https://github.com/yourusername/AgroConnect](https://github.com/yourusername/AgroConnect)
