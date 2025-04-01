# blog/admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Blog

# Register the CustomUser model
User = get_user_model()
admin.site.register(User)

# Register the Blog model
admin.site.register(Blog)
