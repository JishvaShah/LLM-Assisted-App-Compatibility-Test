from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User

class AccountsAPITests(APITestCase):
    def setUp(self):
        self.signup_url = reverse('signup')
        self.login_url = reverse('login')
    
    def test_signup_success(self):
        data = {
            'employee_id': 'test_user',
            'password': 'test_password'
        }
        response = self.client.post(self.signup_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().employee_id, 'test_user')

    def test_signup_invalid(self):
        data = {
            'employee_id': '',
            'password': 'test_password'
        }
        response = self.client.post(self.signup_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)

    def test_login_success(self):
        user = User.objects.create_user(employee_id='test_user', password='test_password')
        data = {
            'employee_id': 'test_user',
            'password': 'test_password'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid(self):
        data = {
            'employee_id': 'test_user',
            'password': 'wrong_password'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data) 
