# blog/tests/test_views.py
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from blog.models import Blog

class BlogCreateViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_blog(self):
        url = '/blog/create/'
        data = {'title': 'New Blog', 'content': 'This is a new blog.', 'status': 'post'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Blog.objects.count(), 1)
        self.assertEqual(Blog.objects.get().title, 'New Blog')
