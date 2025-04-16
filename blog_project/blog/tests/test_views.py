# blog/tests/test_views.py
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from blog.models import Blog, Comment, Notification
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

User = get_user_model()

class BlogAPIViewsTest(TestCase):
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
        
        self.second_user_blog = Blog.objects.create(
            title='Second User Blog',
            content='This is another test blog content.',
            author=self.second_user,
            status='post'
        )
       
        self.draft_blog = Blog.objects.create(
            title='Draft Blog',
            content='This is a draft blog content.',
            author=self.user,
            status='draft'
        )

    def test_user_registration(self):
        self.client.credentials()  
        
        url = '/accounts/register/'
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpassword123'
        }
        
        with patch('blog.views.send_otp_via_email') as mock_send_otp:
            response = self.client.post(url, data, format='json')
            
            mock_send_otp.assert_called_once_with(data['email'])
            
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['detail'], 'User registered successfully. Please verify your email.')
        
        new_user = User.objects.get(email=data['email'])
        self.assertFalse(new_user.is_verified)

    def test_register_with_existing_email(self):
        self.client.credentials() 
        
        url = '/accounts/register/'
        data = {
            'username': 'duplicateuser',
            'email': self.user_data['email'], 
            'password': 'newpassword123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], 'Email already exists.')

    def test_verify_otp_success(self):
        self.client.credentials()  
       
        unverified_user = User.objects.create_user(
            username='unverifieduser',
            email='unverified@example.com',
            password='testpassword123'
        )
        unverified_user.is_verified = False
        unverified_user.otp = '123456'  
        unverified_user.save()
        
        url = '/accounts/verify/'
        data = {
            'email': 'unverified@example.com',
            'otp': '123456'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['status'])
        self.assertEqual(response.data['message'], 'Account Verified Successfully')
        
        unverified_user.refresh_from_db()
        self.assertTrue(unverified_user.is_verified)
        self.assertEqual(unverified_user.otp, '')

    def test_verify_otp_invalid(self):
        self.client.credentials()  

        unverified_user = User.objects.create_user(
            username='invalidotpuser',
            email='invalidotp@example.com',
            password='testpassword123'
        )
        unverified_user.is_verified = False
        unverified_user.otp = '123456' 
        unverified_user.save()
        
        url = '/accounts/verify/'
        data = {
            'email': 'invalidotp@example.com',
            'otp': '654321'  
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['status'])
        self.assertEqual(response.data['message'], 'Invalid OTP')

    def test_user_login_success(self):
        self.client.credentials() 
        
        url = '/accounts/login/'
        data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Login successful')

    def test_user_login_unverified_user(self):
        self.client.credentials()  
        
       
        unverified_user = User.objects.create_user(
            username='loginunverified',
            email='loginunverified@example.com',
            password='testpassword123'
        )
        unverified_user.is_verified = False
        unverified_user.save()
        
        url = '/accounts/login/'
        data = {
            'email': 'loginunverified@example.com',
            'password': 'testpassword123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Please verify your email first')

    def test_user_login_invalid_credentials(self):
        self.client.credentials()  
        
        url = '/accounts/login/'
        data = {
            'email': self.user_data['email'],
            'password': 'wrongpassword'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid credentials')

    def test_get_user_details_own_user(self):
        url = '/accounts/user/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user_data['username'])
        self.assertEqual(response.data['email'], self.user_data['email'])

    def test_get_user_details_specific_user(self):
        url = f'/accounts/user/{self.second_user.id}/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.second_user.username)
        self.assertEqual(response.data['email'], self.second_user.email)

    # Blog Tests
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
        url = '/blog/user/draft/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'draft')
        self.assertEqual(response.data[0]['id'], self.draft_blog.id)

    def test_specific_user_published_blog(self):
        url = '/blog/user/post/'
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

    def test_notification_list(self):
        notification1 = Notification.objects.create(
            user=self.user, 
            message='Test notification 1',
            is_read=False
        )
        notification2 = Notification.objects.create(
            user=self.user, 
            message='Test notification 2',
            is_read=True
        )
        
        url = '/blog/notifications/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)

    def test_mark_notification_as_read(self):
        notification = Notification.objects.create(
            user=self.user, 
            message='Test notification',
            is_read=False
        )
        
        url = f'/blog/notifications/{notification.id}/read/'
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'Notification marked as read')
        
        # Check notification was marked as read
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

    def test_mark_all_notifications_as_read(self):
        for i in range(3):
            Notification.objects.create(
                user=self.user, 
                message=f'Test notification {i}',
                is_read=False
            )
        
        url = '/blog/notifications/read-all/'
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'All notifications marked as read')
        
        unread_count = Notification.objects.filter(user=self.user, is_read=False).count()
        self.assertEqual(unread_count, 0)