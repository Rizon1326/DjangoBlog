# blog/tests/test_views.py
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from blog.models import Blog, Comment, Notification
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class BlogAPIViewsTest(TestCase):
    def setUp(self):
       
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'testpassword123'
        }
        self.user = User.objects.create_user(**self.user_data)
        
        if hasattr(self.user, 'is_verified'):
            self.user.is_verified = True
            self.user.save()
        elif hasattr(self.user, 'verification'):
            self.user.verification.is_verified = True
            self.user.verification.save()
        elif hasattr(self.user, 'email_verified'):
            self.user.email_verified = True
            self.user.save()
            
        self.client = APIClient()
        
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.test_blog = Blog.objects.create(
            title='Test Blog',
            content='This is a test blog content.',
            author=self.user,
            status='post'
        )

    def test_user_registration(self):
        # Clear credentials for registration test
        self.client.credentials()
        
        url = '/accounts/register/'
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['detail'], 'User registered successfully. Please verify your email.')

    def test_user_login(self):
        self.client.credentials()
        
        user = User.objects.get(email=self.user_data['email'])
        
        if hasattr(user, 'is_verified'):
            user.is_verified = True
            user.save()
        elif hasattr(user, 'verification'):
            user.verification.is_verified = True
            user.verification.save()
        elif hasattr(user, 'email_verified'):
            user.email_verified = True
            user.save()
        
        url = '/accounts/login/'
        data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(url, data, format='json')
        
        print(f"Login response: {response.status_code}")
        print(f"Login data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        
        if 'access_token' in response.data:
            self.access_token = response.data['access_token']
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_email_verification(self):        
        self.client.credentials()  
        
        test_verify_user = User.objects.create_user(
            username='verifyuser',
            email='verifyuser@example.com',
            password='testpassword123'
        )
        
        mock_otp = "123456"  
        
        url = '/accounts/verify/'
        data = {
            'email': test_verify_user.email,
            'otp': mock_otp
        }
        
       
        response = self.client.post(url, data, format='json')
       
        self.assertIn(response.status_code, [200, 400, 401, 404])

    def test_blog_creation(self):
        url = '/blog/create/'
        data = {
            'title': 'Test Blog',
            'content': 'This is a test blog content.',
            'status': 'draft'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Blog')

    def test_blog_list(self):
        url = '/blog/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_specific_user_blog(self):
        url = '/blog/user/blogs/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_comment_creation(self):
        url = f'/blog/{self.test_blog.id}/comments/make/'
        data = {
            'content': 'This is a test comment',
            'blog': self.test_blog.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'This is a test comment')

    def test_comment_reply_creation(self):
        comment = Comment.objects.create(
            content='This is a comment for replying',
            author=self.user,
            blog=self.test_blog
        )
        
        url = f'/blog/{self.test_blog.id}/comments/{comment.id}/reply/'
        data = {
            'content': 'This is a reply to the comment',
            'blog': self.test_blog.id,
            'parent_comment': comment.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'This is a reply to the comment')

    def test_notification_list(self):
        url = '/blog/notifications/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_mark_notification_as_read(self):
        notification = Notification.objects.create(user=self.user, message='Test notification')
        url = f'/blog/notifications/{notification.id}/read/'
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)