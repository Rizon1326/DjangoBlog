FROM python:3.10-slim

WORKDIR /app

# Prevent Python from writing bytecode files
ENV PYTHONDONTWRITEBYTECODE=1
# Ensure Python output is sent straight to terminal
ENV PYTHONUNBUFFERED=1

# Install system dependencies including PostgreSQL client and dev libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir psycopg2-binary

# Copy project
COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]