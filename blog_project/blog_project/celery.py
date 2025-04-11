# blog_project/celery.py
import os
from celery import Celery

# Set default Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog_project.settings')

# Create Celery app
app = Celery('blog_project')

# Use Django settings for Celery
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto discover tasks in all registered Django apps
app.autodiscover_tasks()