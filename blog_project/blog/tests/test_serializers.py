# blog/tests/test_serializers.py
from django.test import TestCase
from blog.models import Blog
from blog.serializers import BlogSerializer
from django.contrib.auth import get_user_model

class BlogSerializerTest(TestCase):
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

    def test_blog_serializer(self):
        serializer = BlogSerializer(instance=self.blog)
        data = serializer.data
        self.assertEqual(data['title'], 'Test Blog')
        self.assertEqual(data['author'], self.user.username)
