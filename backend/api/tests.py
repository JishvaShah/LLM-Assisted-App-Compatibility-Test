from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from .models import Screenshot
from .gemini_api import GeminiAPI
from rest_framework import status
from .models import Screenshot
from django.utils import timezone
from unittest.mock import patch, Mock
from django.test import TestCase
import datetime
import logging

logger = logging.getLogger(__name__)


class ImageProcessingAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("process_image")
        self.image_file1 = open(
            "/Users/chenyian261/Documents/GitHub/CS6510Project/backend/test.png", "rb"
        )
        self.image_file2 = open(
            "/Users/chenyian261/Documents/GitHub/CS6510Project/backend/test3.png", "rb"
        )

    def tearDown(self):
        self.image_file1.close()
        self.image_file2.close()

    def test_image_processing_success(self):
        data = {"images": [self.image_file1, self.image_file2]}
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        for result in response.data:
            self.assertIn("output_text", result)
            self.assertIn("flag", result)

    def test_image_processing_no_image(self):
        data = {}
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_images_saved_to_database(self):
        data = {"images": [self.image_file1, self.image_file2]}
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, 200)
        screenshots = Screenshot.objects.order_by("-created_at")[:2]
        self.assertEqual(screenshots.count(), 2)
        for screenshot in screenshots:
            self.assertIsNotNone(screenshot.image_url)
            self.assertIsNotNone(screenshot.analysis_result)
            self.assertIsNotNone(screenshot.prompt)

    def test_gemini_api_returns_none(self):
        original_process_image = GeminiAPI.process_image
        GeminiAPI.process_image = lambda self, image_file, prompt: None

        data = {"images": [self.image_file1]}
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "Gemini API returned None")

        GeminiAPI.process_image = original_process_image


class ScreenshotListAPIViewTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("screenshots")
        Screenshot.objects.create(
            image_url="http://example.com/image1.png",
            flag=True,
            analysis_result={"flag": "true", "output_text": "There was an error."},
            image_hash="4567",
        )
        Screenshot.objects.create(
            image_url="http://example.com/image2.png",
            flag=False,
            analysis_result={"flag": "false", "output_text": "No issues detected."},
            image_hash="6789",
        )

    def test_get_all_screenshots(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_screenshots_by_flag_true(self):
        response = self.client.get(self.url, {"flag": "true"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for screenshot in response.data:
            self.assertTrue(screenshot["flag"])

    def test_filter_screenshots_by_date(self):
        today = timezone.now().date()
        response = self.client.get(
            self.url, {"start_date": str(today), "end_date": str(today)}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for screenshot in response.data:
            created_at = timezone.datetime.strptime(
                screenshot["created_at"], "%Y-%m-%dT%H:%M:%S.%fZ"
            ).date()
            self.assertEqual(created_at, today)

    def test_no_screenshots_on_invalid_date(self):
        response = self.client.get(
            self.url, {"start_date": "2100-01-01", "end_date": "2100-01-01"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class ScreenshotTestCase(TestCase):

    def setUp(self):
        Screenshot.objects.create(
            image_url="http://example/test.png",
            flag=True,
            analysis_result={"output_text": "Issue detected.", "flag": "True"},
            prompt="Test prompt",
        )

    @patch("api.models.storage.Client")
    def test_generate_signed_url(self, mock_storage_client):
        mock_blob = Mock()
        # mock_blob = (
        #     mock_storage_client.return_value.bucket.return_value.blob.return_value
        # )
        expected_signed_url = "http://mockedsignedurl.com/signed-image.png"
        mock_blob.generate_signed_url.return_value = expected_signed_url

        screenshot = Screenshot.objects.first()
        signed_url = screenshot.generate_signed_url()

        self.assertEqual(signed_url, expected_signed_url)
        mock_blob.generate_signed_url.assert_called_once_with(
            expiration=datetime.timedelta(minutes=15)
        )

    # @patch("api.models.storage.Client")
    # def test_generate_signed_url(self, mock_storage_client):
    #     mock_blob = (
    #         mock_storage_client.return_value.bucket.return_value.blob.return_value
    #     )
    #     expected_signed_url = "http://mockedsignedurl.com/signed-image.png"
    #     mock_blob.generate_signed_url.return_value = expected_signed_url

    #     screenshot = Screenshot.objects.first()
    #     signed_url = screenshot.generate_signed_url()

    #     self.assertEqual(signed_url, expected_signed_url)
    #     mock_blob.generate_signed_url.assert_called_once_with(
    #         expiration=datetime.timedelta(minutes=15)
    #     )

    # @patch("api.models.storage.Client")
    # def test_generate_signed_url(self, mock_storage_client):
    #     mock_blob = (
    #         mock_storage_client.return_value.bucket.return_value.blob.return_value
    #     )
    #     mock_blob.generate_signed_url.return_value = (
    #         "http://mockedsignedurl.com/signed-image.png"
    #     )

    #     screenshot = Screenshot.objects.first()
    #     signed_url = screenshot.generate_signed_url()

    #     self.assertEqual(signed_url, "http://mockedsignedurl.com/signed-image.png")
    #     mock_blob.generate_signed_url.assert_called_once_with(
    #         expiration=datetime.timedelta(minutes=15)
    #     )
