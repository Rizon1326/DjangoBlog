# tests/test_blog.py
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from blog.models import Blog
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

User = get_user_model()

class BlogTests(TestCase):
    def setUp(self):
        self.user_data = {
            'username': 'rizon',
            'email': 'rizon@gmail.com',
            'password': '1234'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.user.is_verified = True
        self.user.save()
            
        self.client = APIClient()
        
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
     
        self.second_user = User.objects.create_user(
            username='habib',
            email='habib@gmail.com',
            password='1234'
        )
        self.second_user.is_verified = True
        self.second_user.save()
        
        self.test_blog = Blog.objects.create(
            title='Test Blog',
            content='This is a test blog content.',
            author=self.user,
            status='post'
        )
        
        self.second_user_blog = Blog.objects.create(
            title='Habib s Blog',
            content='This is Habib blog content.',
            author=self.second_user,
            status='post'
        )
       
        self.draft_blog = Blog.objects.create(
            title='Draft Blog',
            content='This is a draft blog content.',
            author=self.user,
            status='draft'
        )

    def test_blog_creation_draft(self):
        url = '/blog/create/'
        data = {
            'title': 'New Draft Blog',
            'content': 'This is a new draft blog content.',
            'status': 'draft'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Draft Blog')
        self.assertEqual(response.data['status'], 'draft')
        self.assertEqual(response.data['author'], self.user.id)

    def test_blog_creation_published(self):
        url = '/blog/create/'
        data = {
            'title': 'New Published Blog',
            'content': 'This is a new published blog content.',
            'status': 'post'
        }
        
        with patch('blog.views.create_blog_notification.delay') as mock_task:
            response = self.client.post(url, data, format='json')
            
            self.assertEqual(mock_task.call_count, 1)
            
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Published Blog')
        self.assertEqual(response.data['status'], 'post')

    def test_blog_list(self):
        url = '/blog/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 2)

    def test_blog_detail(self):
        url = f'/blog/{self.test_blog.id}/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.test_blog.id)
        self.assertEqual(response.data['title'], self.test_blog.title)
        self.assertEqual(response.data['content'], self.test_blog.content)

    def test_specific_user_blog(self):
        url = '/blog/user/blogs/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        
        self.assertEqual(len(response.data), 2)
        
        for blog in response.data:
            self.assertEqual(blog['author'], self.user.id)

    def test_specific_user_draft_blog(self):
    
     url = '/blog/user/blogs/draft/'  
     response = self.client.get(url, format='json')
     self.assertEqual(response.status_code, status.HTTP_200_OK)
     self.assertIsInstance(response.data, list)
    
     self.assertEqual(len(response.data), 1)
     self.assertEqual(response.data[0]['status'], 'draft')
     self.assertEqual(response.data[0]['id'], self.draft_blog.id)

    def test_specific_user_published_blog(self):
        url = '/blog/user/blogs/post/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        
        published_blog_count = Blog.objects.filter(status='post').count()
        self.assertEqual(len(response.data), published_blog_count)
        
        for blog in response.data:
            self.assertEqual(blog['status'], 'post')

    def test_blog_edit_success(self):
        url = f'/blog/{self.test_blog.id}/edit/'  
        updated_data = {
            'title': 'Updated Blog Title',
            'content': 'This is updated content.'
        }
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Blog Title')
        self.assertEqual(response.data['content'], 'This is updated content.')
        
        self.test_blog.refresh_from_db()
        self.assertEqual(self.test_blog.title, 'Updated Blog Title')

    def test_blog_edit_unauthorized(self):
        url = f'/blog/{self.second_user_blog.id}/edit/'  
        updated_data = {
            'title': 'Unauthorized Update',
            'content': 'This should not update.'
        }
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'Permission Denied')
        
        self.second_user_blog.refresh_from_db()
        self.assertNotEqual(self.second_user_blog.title, 'Unauthorized Update')

    def test_blog_delete_success(self):
        url = f'/blog/{self.test_blog.id}/delete/'
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        with self.assertRaises(Blog.DoesNotExist):
            Blog.objects.get(id=self.test_blog.id)

    def test_blog_delete_unauthorized(self):
        url = f'/blog/{self.second_user_blog.id}/delete/'
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'Permission Denied')
        
        self.assertTrue(Blog.objects.filter(id=self.second_user_blog.id).exists())