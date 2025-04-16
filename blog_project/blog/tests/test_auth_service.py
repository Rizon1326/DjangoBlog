# tests/test_auth_service.py
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

User = get_user_model()

class AuthServiceTests(TestCase):
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