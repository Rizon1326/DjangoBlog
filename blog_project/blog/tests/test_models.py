# blog/tests/test_models.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from blog.models import Blog, Comment

class CustomUserModelTest(TestCase):
    def test_create_user(self):
        user = get_user_model().objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpassword'))
        self.assertFalse(user.is_verified)

    def test_create_superuser(self):
        user = get_user_model().objects.create_superuser(
            email='admin@example.com',
            username='adminuser',
            password='adminpassword'
        )
        self.assertEqual(user.email, 'admin@example.com')
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)


class BlogModelTest(TestCase):
    def test_blog_creation(self):
        user = get_user_model().objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword'
        )
        blog = Blog.objects.create(
            title='Test Blog',
            content='This is a test blog content.',
            author=user
        )
        self.assertEqual(blog.title, 'Test Blog')
        self.assertEqual(blog.author.username, 'testuser')

    def test_comment_creation(self):
        user = get_user_model().objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpassword'
        )
        blog = Blog.objects.create(
            title='Test Blog',
            content='This is a test blog content.',
            author=user
        )
        comment = Comment.objects.create(
            blog=blog,
            author=user,
            content='This is a test comment.'
        )
        self.assertEqual(comment.blog.title, 'Test Blog')
        self.assertEqual(comment.author.username, 'testuser')
