# # blog/tests/test_views.py
# from django.contrib.auth import get_user_model
# from django.urls import reverse
# from rest_framework import status
# from rest_framework.test import APITestCase, APIClient
# from rest_framework_simplejwt.tokens import RefreshToken
# from .models import Blog, Comment, Notification
# import json

# User = get_user_model()

# class UserAuthenticationTests(APITestCase):
#     def setUp(self):
#         self.client = APIClient()
#         self.user_data = {
#             'username': 'testuser',
#             'email': 'test@example.com',
#             'password': 'testpass123'
#         }
#         self.user = User.objects.create_user(**self.user_data)
#         self.user.is_verified = True
#         self.user.save()

#     def test_user_registration(self):
#         url = reverse('register')
#         data = {
#             'username': 'newuser',
#             'email': 'new@example.com',
#             'password': 'newpass123'
#         }
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertTrue(User.objects.filter(email='new@example.com').exists())

#     def test_user_login(self):
#         url = reverse('login')
#         data = {
#             'email': self.user_data['email'],
#             'password': self.user_data['password']
#         }
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertIn('access_token', response.data)

#     def test_unverified_user_login(self):
#         unverified_user = User.objects.create_user(
#             username='unverified',
#             email='unverified@example.com',
#             password='testpass123'
#         )
#         url = reverse('login')
#         data = {
#             'email': 'unverified@example.com',
#             'password': 'testpass123'
#         }
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

# class BlogTests(APITestCase):
#     def setUp(self):
#         self.client = APIClient()
#         self.user = User.objects.create_user(
#             username='bloguser',
#             email='bloguser@example.com',
#             password='testpass123'
#         )
#         self.user.is_verified = True
#         self.user.save()
        
#         # Get JWT token
#         refresh = RefreshToken.for_user(self.user)
#         self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
        
#         self.blog_data = {
#             'title': 'Test Blog',
#             'content': 'This is a test blog content.',
#             'status': 'post'
#         }

#     def test_create_blog(self):
#         url = reverse('blog-create')
#         response = self.client.post(url, self.blog_data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Blog.objects.count(), 1)
#         self.assertEqual(Blog.objects.get().title, 'Test Blog')

#     def test_get_blog_list(self):
#         Blog.objects.create(
#             title='Test Blog 1',
#             content='Content 1',
#             author=self.user,
#             status='post'
#         )
#         Blog.objects.create(
#             title='Test Blog 2',
#             content='Content 2',
#             author=self.user,
#             status='post'
#         )
        
#         url = reverse('blog-list')
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(len(response.data), 2)

#     def test_get_specific_user_blogs(self):
#         # Create another user
#         other_user = User.objects.create_user(
#             username='otheruser',
#             email='other@example.com',
#             password='testpass123'
#         )
        
#         # Create blogs for both users
#         Blog.objects.create(
#             title='My Blog',
#             content='My Content',
#             author=self.user,
#             status='post'
#         )
#         Blog.objects.create(
#             title='Other Blog',
#             content='Other Content',
#             author=other_user,
#             status='post'
#         )
        
#         url = reverse('specific-user-blogs')
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(len(response.data), 1)
#         self.assertEqual(response.data[0]['title'], 'My Blog')

#     def test_update_blog(self):
#         blog = Blog.objects.create(
#             title='Original Title',
#             content='Original Content',
#             author=self.user,
#             status='post'
#         )
        
#         url = reverse('blog-edit', kwargs={'pk': blog.id})
#         data = {
#             'title': 'Updated Title',
#             'content': 'Updated Content'
#         }
#         response = self.client.put(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         blog.refresh_from_db()
#         self.assertEqual(blog.title, 'Updated Title')

#     def test_delete_blog(self):
#         blog = Blog.objects.create(
#             title='To be deleted',
#             content='Delete me',
#             author=self.user,
#             status='post'
#         )
        
#         url = reverse('blog-delete', kwargs={'pk': blog.id})
#         response = self.client.delete(url)
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
#         self.assertEqual(Blog.objects.count(), 0)

# class CommentTests(APITestCase):
#     def setUp(self):
#         self.client = APIClient()
#         self.user = User.objects.create_user(
#             username='commentuser',
#             email='commentuser@example.com',
#             password='testpass123'
#         )
#         self.user.is_verified = True
#         self.user.save()
        
#         # Get JWT token
#         refresh = RefreshToken.for_user(self.user)
#         self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
        
#         self.blog = Blog.objects.create(
#             title='Comment Test Blog',
#             content='Blog for testing comments',
#             author=self.user,
#             status='post'
#         )

#     def test_create_comment(self):
#         url = reverse('comment-create', kwargs={'pk': self.blog.id})
#         data = {
#             'content': 'This is a test comment'
#         }
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Comment.objects.count(), 1)
#         self.assertEqual(Comment.objects.get().content, 'This is a test comment')

#     def test_get_comments_for_blog(self):
#         Comment.objects.create(
#             content='Comment 1',
#             author=self.user,
#             blog=self.blog
#         )
#         Comment.objects.create(
#             content='Comment 2',
#             author=self.user,
#             blog=self.blog
#         )
        
#         url = reverse('comment-view', kwargs={'pk': self.blog.id})
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(len(response.data), 2)

#     def test_create_comment_reply(self):
#         parent_comment = Comment.objects.create(
#             content='Parent Comment',
#             author=self.user,
#             blog=self.blog
#         )
        
#         url = reverse('comment-reply', kwargs={'pk': self.blog.id, 'comment_pk': parent_comment.id})
#         data = {
#             'content': 'This is a reply'
#         }
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Comment.objects.count(), 2)
#         self.assertEqual(Comment.objects.filter(parent_comment=parent_comment).count(), 1)

# class NotificationTests(APITestCase):
#     def setUp(self):
#         self.client = APIClient()
#         self.user = User.objects.create_user(
#             username='notifyuser',
#             email='notify@example.com',
#             password='testpass123'
#         )
#         self.user.is_verified = True
#         self.user.save()
        
#         # Get JWT token
#         refresh = RefreshToken.for_user(self.user)
#         self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
        
#         self.blog = Blog.objects.create(
#             title='Notification Test Blog',
#             content='Blog for testing notifications',
#             author=self.user,
#             status='post'
#         )
        
#         self.notification = Notification.objects.create(
#             user=self.user,
#             message='Test notification',
#             notification_type='blog_post'
#         )

#     def test_get_notifications(self):
#         url = reverse('notification-list')
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(len(response.data), 1)

#     def test_mark_notification_as_read(self):
#         url = reverse('notification-mark-read', kwargs={'pk': self.notification.id})
#         response = self.client.post(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.notification.refresh_from_db()
#         self.assertTrue(self.notification.is_read)

#     def test_mark_all_notifications_as_read(self):
#         Notification.objects.create(
#             user=self.user,
#             message='Another notification',
#             notification_type='blog_post',
#             is_read=False
#         )
        
#         url = reverse('notification-mark-all-read')
#         response = self.client.post(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(Notification.objects.filter(user=self.user, is_read=False).count(), 0)