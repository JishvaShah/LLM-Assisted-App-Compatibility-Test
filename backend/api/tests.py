from rest_framework.test import APITestCase
from django.urls import reverse
from .models import Screenshot
from .gemini_api import GeminiAPI

class ImageProcessingAPITests(APITestCase):
    def setUp(self):
        self.url = reverse('process_image')
        self.image_file = open('/Users/chenyian261/Documents/GitHub/CS6510Project/backend/test.png', 'rb')
    
    def tearDown(self):
        self.image_file.close()

    def test_image_processing_success(self):
        data = {'image': self.image_file}
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertIn('output_text', response.data)
        self.assertIn('flag', response.data)

    def test_image_processing_no_image(self):
        data = {}
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    def test_image_saved_to_database(self):
        data = {'image': self.image_file}
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, 200)
        screenshot = Screenshot.objects.latest('created_at')
        self.assertIsNotNone(screenshot.image_url)
        self.assertIsNotNone(screenshot.analysis_result)
        self.assertIsNotNone(screenshot.prompt)

    def test_gemini_api_returns_none(self):
        # Mock the GeminiAPI.process_image method to return None
        original_process_image = GeminiAPI.process_image
        GeminiAPI.process_image = lambda self, image_file, prompt: None

        data = {'image': self.image_file}
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, 500)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Gemini API returned None')

        GeminiAPI.process_image = original_process_image
