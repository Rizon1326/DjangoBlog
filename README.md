
# BlogSphere ✎ᝰ.

```markdown


**BlogSphere✎ᝰ.** is a full-stack blogging web application built using Django (backend) and React (frontend). It features user authentication, blog creation, editing, commenting, and more — all wrapped in a clean, modern UI.
```

## 🚀 Features

- User Registration, Login, and OTP-based Email Verification
- JWT Authentication System
- Blog Creation, Editing, and Deletion
- Commenting System with Nested Replies
- Responsive Frontend built with React & Tailwind CSS
- RESTful APIs using Django Rest Framework (DRF)
- Secure token-based protected routes
- Fully Dockerized for easy deployment

---

## 🛠️ Tech Stack

| Layer       | Tech Used                     |
|------------|-------------------------------|
| Frontend    | React, Tailwind CSS    |
| Backend     | Django, Django Rest Framework |
| Auth        | JWT, Email OTP Verification   |
| DevOps      | Docker, Docker Compose         |

---

## 📂 Project Structure

```
blog_project/
├── blog/                  # Django app
├── blog_project/          # Django settings & URLs
├── frontend/              # React app
│   ├── components/        # Auth & Blog Components
│   ├── public/
│   └── src/
├── Dockerfile             # For Django
├── frontend/Dockerfile    # For React
├── docker-compose.yml
├── requirements.txt       # Python dependencies
└── manage.py
```

---

## 🐳 Getting Started with Docker

### 1️⃣ Prerequisites

- Docker & Docker Compose installed on your machine

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/blogsphere.git
cd blogsphere
```

### 3️⃣ Build and Run Containers

```bash
docker-compose up --build
```

- Django: [http://localhost:8000](http://localhost:8000)
- React: [http://localhost:3000](http://localhost:5173)

### 4️⃣ Create Superuser (Optional)

```bash
docker exec -it blogsphere-backend-1 python manage.py createsuperuser
```

---

## 🧪 Local Development (Without Docker)

### Backend (Django)

```bash
cd blog_project
python -m venv venv
source venv/bin/activate
python manage.py runserver
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

---

## ✅ Environment Variables (Optional)

If you want to use `.env`:

```
SECRET_KEY=your-secret
DEBUG=True
EMAIL_HOST_USER=you@example.com
EMAIL_HOST_PASSWORD=yourpassword
```

---

