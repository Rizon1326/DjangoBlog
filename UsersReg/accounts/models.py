# UsersReg/accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from .manager import UserManager
from django.contrib.auth import get_user_model
# Create your models here.

class User(AbstractUser):
    username=None
    email = models.EmailField(unique=True)
    is_verified= models.BooleanField(default=False)
    otp = models.CharField(max_length=6, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


    objects = UserManager()

 # def name(self):
    #     return self.first_name + " " + self.last_name
    # def __str__(self):
    #     return self.email
    
class Blog(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)  # Author of the blog
    created_at = models.DateTimeField(auto_now_add=True)  # When the blog was created


    # def __str__(self):
    #     return self.title
    

   