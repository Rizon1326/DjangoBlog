# blog/serializers.py
from rest_framework import serializers # type: ignore

from .models import Blog,Comment
from django.contrib.auth import get_user_model

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email']
class VerifyAccountSerializer(serializers.Serializer):
    email=serializers.EmailField()
    otp=serializers.CharField()

# class VerifyAccountSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = get_user_model()
#         fields = ['email', 'otp']

    
class LoginSerializer(serializers.Serializer):
    email=serializers.EmailField()
    password=serializers.CharField()

# class LoginSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = get_user_model()
#         fields = ['email', 'password']

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = ['id', 'title', 'content', 'author', 'status', 'created_at','updated_at']  # Ensure 'status' is included here

    def create(self, validated_data):
        return Blog.objects.create(**validated_data)
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'content', 'blog', 'author']

    def create(self, validated_data):
        return Comment.objects.create(**validated_data)
