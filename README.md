
---

# BlogSphere✎ᝰ. Application

## Overview

BlogSphere✎ᝰ. is a blogging platform built using Django for the backend and React for the frontend. It supports essential blogging features, including blog creation, viewing, and management. The platform integrates email OTP verification using Mailtrap and real-time notifications using Celery and Redis.

---

## Project Setup Instructions

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/Rizon1326/DjangoBlog
cd DjangoBlog
```

---

### 2. Backend Setup (Django) 🚀

#### Step 1: Create a Virtual Environment

Create and activate a virtual environment:

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

CELERY_BROKER_URL = 'redis://localhost:6380/0'
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

### 3. Frontend Setup (React) ⚛️

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

### 4. Notification Setup (Celery & Redis) 📡

#### Step 1: Start Redis

If Redis is running on port `6380`, use the following command to run Redis via Docker:

```bash
docker run -p 6380:6380 redis
```

Or you can install Redis directly on your system. Refer to the [Redis Installation Guide](https://redis.io/download) for more details.

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

### 5. Running Tests 🧪

To test different components of the project, run the following commands:

```bash
python manage.py test blog.test.test_auth_service
python manage.py test blog.test.test_blog
python manage.py test blog.test.test_comments
python manage.py test blog.test.test_notifications
```

---

### 6. Docker Setup (Optional) 🐳

You can use Docker to run both the backend and frontend along with Redis. Follow these steps:

#### Step 1: Build and Start Docker Containers

Use Docker Compose to build and run the containers:

```bash
docker-compose up --build
```

#### Step 2: Access the Application

Once the containers are up, you can access the following:

- **Backend (Django)**: `http://localhost:8000`
- **Frontend (React)**: `http://localhost:5173`

---

### 7. Docker Commands ⚙️

To stop the Docker containers:

```bash
docker-compose down
```

To rebuild the Docker containers:

```bash
docker-compose up --build
```

---

## Final Notes

- Make sure that Mailtrap credentials are configured properly in the `.env` file for email verification.
- Redis must be running locally on port `6380` for Celery tasks to work.
- If you're deploying to production, ensure proper environment variable configurations, especially for email backend and Redis.

---
