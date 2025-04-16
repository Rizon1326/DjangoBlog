# tests/test_notifications.py
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from blog.models import Notification
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class NotificationTests(TestCase):
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