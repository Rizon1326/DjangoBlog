# UsersReg/accounts/serializer.py
from rest_framework import serializers
from .models import User, Blog
from rest_framework_simplejwt.tokens import RefreshToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password','is_verified']

class VerifyAccountSerializer(serializers.Serializer):
    email=serializers.EmailField()
    otp=serializers.CharField()

class LoginSerializer(serializers.Serializer):
    email=serializers.EmailField()
    password=serializers.CharField()
class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = ['id', 'title', 'content', 'author', 'created_at']
        read_only_fields = ['author', 'created_at']  # Make author and created_at read-only