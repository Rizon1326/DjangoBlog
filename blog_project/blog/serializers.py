# blog/serializers.py
from rest_framework import serializers # type: ignore

from .models import Blog,Comment,Notification
from django.contrib.auth import get_user_model

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email']
class VerifyAccountSerializer(serializers.Serializer):
    email=serializers.EmailField()
    otp=serializers.CharField()
    
class LoginSerializer(serializers.Serializer):
    email=serializers.EmailField()
    password=serializers.CharField()

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = ['id', 'title', 'content', 'author', 'status', 'created_at','updated_at']  # Ensure 'status' is included here

    def create(self, validated_data):
        return Blog.objects.create(**validated_data)
class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)
    replies = serializers.SerializerMethodField()  

    class Meta:
        model = Comment
        fields = ['id', 'content', 'blog', 'author', 'created_at', 'replies']

    def get_replies(self, obj):
        replies = Comment.objects.filter(parent_comment=obj)
        return CommentSerializer(replies, many=True).data

    def create(self, validated_data):
        return Comment.objects.create(**validated_data)

    
class CommentReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'blog', 'parent_comment']
        read_only_fields = ['author', 'created_at']

    def create(self, validated_data):
        return Comment.objects.create(**validated_data)
    

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'blog', 'comment', 'created_at', 'is_read']

