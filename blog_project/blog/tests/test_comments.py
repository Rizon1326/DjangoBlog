# tests/test_comments.py
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from blog.models import Blog, Comment
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

User = get_user_model()

class CommentTests(TestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'testpassword123'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.user.is_verified = True
        self.user.save()
            
        self.client = APIClient()
        
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
     
        self.second_user = User.objects.create_user(
            username='seconduser',
            email='seconduser@example.com',
            password='secondpassword123'
        )
        self.second_user.is_verified = True
        self.second_user.save()
        
        self.test_blog = Blog.objects.create(
            title='Test Blog',
            content='This is a test blog content.',
            author=self.user,
            status='post'
        )

    def test_comment_creation(self):
        url = f'/blog/{self.test_blog.id}/comments/make/'
        data = {
            'content': 'This is a test comment',
            'blog': self.test_blog.id
        }
        
        with patch('blog.views.create_comment_notification.delay') as mock_task:
            response = self.client.post(url, data, format='json')
            
            self.assertEqual(mock_task.call_count, 1)
            
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'This is a test comment')
        
        if isinstance(response.data['author'], int):
            self.assertEqual(response.data['author'], self.user.id)
        else:
            self.assertEqual(response.data['author'], self.user.username)
            
        self.assertEqual(response.data['blog'], self.test_blog.id)
        self.assertIsNone(response.data['parent_comment'])

    def test_get_blog_comments(self):
        comment1 = Comment.objects.create(
            content='First comment',
            author=self.user,
            blog=self.test_blog
        )
        comment2 = Comment.objects.create(
            content='Second comment',
            author=self.second_user,
            blog=self.test_blog
        )
        
        url = f'/blog/{self.test_blog.id}/comments/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)

    def test_comment_reply_creation(self):
        parent_comment = Comment.objects.create(
            content='Parent comment',
            author=self.second_user,
            blog=self.test_blog
        )
        
        url = f'/blog/{self.test_blog.id}/comments/{parent_comment.id}/reply/'
        data = {
            'content': 'This is a reply to the comment',
        }
        
        with patch('blog.views.create_comment_notification.delay') as mock_task:
            response = self.client.post(url, data, format='json')
            
            self.assertEqual(mock_task.call_count, 1)
            
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'This is a reply to the comment')
        self.assertEqual(response.data['parent_comment'], parent_comment.id)
        self.assertEqual(response.data['blog'], self.test_blog.id)

    def test_get_comment_replies(self):
        parent_comment = Comment.objects.create(
            content='Parent comment',
            author=self.user,
            blog=self.test_blog
        )
        
        reply1 = Comment.objects.create(
            content='First reply',
            author=self.user,
            blog=self.test_blog,
            parent_comment=parent_comment
        )
        reply2 = Comment.objects.create(
            content='Second reply',
            author=self.second_user,
            blog=self.test_blog,
            parent_comment=parent_comment
        )
        
        url = f'/blog/{self.test_blog.id}/comments/{parent_comment.id}/reply/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)
        
        for reply in response.data:
            self.assertEqual(reply['parent_comment'], parent_comment.id)