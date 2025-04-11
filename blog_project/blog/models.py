# blog_project/blog/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from .manager import UserManager
# Create your models here.


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

class Blog(models.Model):
    DRAFT = 'draft'
    POST = 'post'
    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (POST, 'Post'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=5, 
        choices=STATUS_CHOICES, 
        default=DRAFT  # Default to 'draft' if no status is provided
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

   

# class Comment(models.Model):
#     blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='comments')
#     author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     content = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent_comment = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')



class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    
   
    