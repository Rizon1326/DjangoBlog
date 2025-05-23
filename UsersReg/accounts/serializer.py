# UsersReg/accounts/serializer.py
from rest_framework import serializers
from .models import User
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