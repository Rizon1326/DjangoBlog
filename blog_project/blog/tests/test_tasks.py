# blog/tests/test_tasks.py
from django.test import TestCase
from blog.tasks import create_blog_notification
from unittest.mock import patch
from blog.models import Blog
from django.contrib.auth import get_user_model

class BlogNotificationTaskTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword'
        )
        self.blog = Blog.objects.create(
            title='Test Blog',
            content='This is a test blog content.',
            author=self.user
        )

    @patch('blog.tasks.Notification.objects.create')
    def test_create_blog_notification(self, mock_create):
        create_blog_notification(self.blog.id)
        self.assertTrue(mock_create.called)
        mock_create.assert_called_with(
            user=self.user,
            message=f"New blog posted: {self.blog.title}",
            blog=self.blog
        )
