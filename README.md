# BlogSphere✎ᝰ. Application

## Overview

BlogSphere✎ᝰ. is a blogging platform built with Django for the backend and React for the frontend. The application supports basic blogging features, including blog creation, viewing, and management. It integrates email OTP verification using Mailtrap and real-time notifications using Celery and Redis.

---

## File Structure

The project is divided into two main directories:

```
DjangoBlog/
│
├── blog_project/          # Backend (Django)
│   ├── blog/              # Main app for blog-related functionalities
│   ├── migrations/        # Database migrations
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── emails.py
│   ├── forms.py
│   ├── manager.py
│   ├── models.py          # Database models
│   ├── serializers.py     # Serializers for data conversion
│   ├── tasks.py           # Celery tasks
│   ├── urls.py            # URL routing
│   ├── views.py           # Views to handle requests
│   ├── settings.py        # Django settings
│   ├── celery.py          # Celery configuration
│   ├── asgi.py
│   ├── wsgi.py
│   ├── .env               # Environment variables (use .env.sample as a template)
│   ├── .env.sample        # Sample environment configuration
│   ├── db.sqlite3         # SQLite database
│   └── manage.py          # Django management commands
│
├── frontend/              # Frontend (React)
│   ├── node_modules/      # Node.js modules
│   ├── public/            # Public files for the React app (index.html, etc.)
│   ├── src/               # Source code for React
│   │   ├── assets/        # Static assets like images
│   │   ├── components/    # React components
│   │   │   ├── Auth/      # Components for authentication
│   │   │   ├── Blog/      # Components related to the blog (e.g., BlogForm, Dashboard)
│   │   │   ├── Header/    # Navbar and header components
│   │   ├── pages/         # Pages in the app (Login, Register, Dashboard, etc.)
│   │   ├── services/      # Service files for API calls
│   │   ├── App.js         # Main App component
│   │   ├── index.js       # Entry point for React
│   ├── .gitignore         # Git ignore file for frontend
│   └── package.json       # Frontend dependencies and scripts
│
├── .gitignore             # Git ignore file for the whole project
├── docker-compose.yml     # Docker configuration for the entire app (frontend, backend, Redis)
├── Dockerfile             # Dockerfile for the Django backend
├── .dockerignore          # Ignore unnecessary files during Docker build
└── README.md              # This file (project documentation)
```

---

## Project Setup Instructions

### 1. Clone the Repository

Start by cloning the GitHub repository to your local machine:

```bash
git clone https://github.com/Rizon1326/DjangoBlog
cd DjangoBlog
```

---

### 2. Backend Setup (Django)

#### Step 1: Create a Virtual Environment

To keep your dependencies isolated, create and activate a virtual environment:

```bash
python3 -m venv venv  # Create virtual environment
source venv/bin/activate  # For Mac/Linux
# or
.\venv\Scripts\activate  # For Windows
```

#### Step 2: Install Backend Dependencies

Install the necessary Python packages for the backend:

```bash
cd blog_project/
pip install -r requirements.txt
```

#### Step 3: Configure Environment Variables

Create a `.env` file in the `blog_project/` directory using the `.env.sample` as a template. Add your sensitive data like Mailtrap credentials and Redis settings:

```bash
cp blog_project/.env.sample blog_project/.env
```

Update the `.env` file with your Mailtrap credentials and Redis configuration:

```env
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.mailtrap.io'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your_mailtrap_user'
EMAIL_HOST_PASSWORD = 'your_mailtrap_password'

CELERY_BROKER_URL = 'redis://localhost:6379/0'
```

#### Step 4: Run Database Migrations

Apply the migrations to set up the database:

```bash
python manage.py migrate
```

#### Step 5: Create a Superuser (Optional)

To access the Django admin, create a superuser:

```bash
python manage.py createsuperuser
```

#### Step 6: Run the Backend Server

Now, you can start the Django development server:

```bash
python manage.py runserver 8000
```

---

### 3. Frontend Setup (React)

#### Step 1: Install Frontend Dependencies

Navigate to the `frontend` directory and install the necessary JavaScript dependencies:

```bash
cd ..
cd frontend
npm install
```

#### Step 2: Run the Frontend Server

To run the React frontend, execute the following command:

```bash
npm run dev
```

This will start the frontend development server on port 5173. Open your browser and go to `http://localhost:5173`.

---

### 4. Notification Setup (Celery & Redis)

#### Step 1: Start Redis

Make sure Redis is running. If you have Docker installed, you can run Redis via:

```bash
docker run -p 6379:6379 redis
```

If you don't have Docker installed, you can install Redis directly on your system. Here’s how you can do it for different operating systems:

---

### **1. Installing Redis on Linux (Ubuntu)**

1. Update the package index:

   ```bash
   sudo apt update
   ```

2. Install Redis:

   ```bash
   sudo apt install redis-server
   ```

3. Start the Redis service:

   ```bash
   sudo systemctl start redis
   ```

4. Enable Redis to start on boot:

   ```bash
   sudo systemctl enable redis
   ```

5. Check if Redis is running by running:

   ```bash
   redis-cli ping
   ```

   It should respond with:

   ```bash
   PONG
   ```

---


Alternatively, you can install Redis directly on your system. Refer to the [Redis Installation Guide](https://redis.io/download) for more details.

#### Step 2: Install Celery & Redis

Install Celery and Redis for asynchronous task processing:

```bash
pip install celery redis
```

#### Step 3: Start the Celery Worker

Run the Celery worker in the background:

```bash
celery -A blog_project.celery worker --loglevel=info
```

---

## Docker Setup (Optional)

You can also use Docker to run both the backend and frontend along with Redis. Follow these steps:

#### Step 1: Build and Start Docker Containers

Use Docker Compose to build and run the containers:

```bash
docker-compose up --build
```

#### Step 2: Access the Application

Once the containers are up, you can access the following:

- Backend (Django): `http://localhost:8000`
- Frontend (React): `http://localhost:5173`

---

## Final Notes

- Make sure that Mailtrap credentials are configured properly in the `.env` file for email verification.
- Redis must be running locally for Celery tasks.
- If you're deploying to production, ensure proper environment variable configurations, especially for email backend and Redis.

---
