from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics, filters
from .gemini_api import GeminiAPI, GeminiAPIError
import datetime
from google.cloud import storage
from django.conf import settings
from .models import Screenshot
import api.prompt_factory as prompt_factory
import logging
from .serializers import ScreenshotSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.utils.dateparse import parse_date
from PIL import Image
import imagehash
from django.core.files.uploadedfile import InMemoryUploadedFile
from collections import defaultdict
import functools


class ImageProcessingAPIView(APIView):
    """
    API class for processing images with Gemini API
    """

    parser_classes = (MultiPartParser, FormParser)

    def _images_deduplicator(self, images: list):
        unique_images = []
        db_images = []
        image_hashes = set()

        for image_file in images:
            try:
                image = Image.open(image_file.open())
                crop_percentage = 0.05  # crop 5% of the top off
                crop_height = int(image.height * crop_percentage)
                cropped_image = image.crop(
                    (0, crop_height, image.width, image.height - crop_height)
                )
                image_hash = str(imagehash.average_hash(cropped_image))

                queryset = Screenshot.objects.filter(image_hash=image_hash)
                if not queryset.exists():  # if not in DB
                    if (
                        image_hash not in image_hashes
                    ):  # check if same request has duplicates
                        image_hashes.add(image_hash)
                        unique_images.append((image_file, image_hash))
                else:
                    serialized = ScreenshotSerializer(queryset, many=True).data
                    db_images.extend(serialized)

            except Exception as e:
                logging.error(
                    f"Error processing image: {image_file.name}. Error: {str(e)}"
                )
        return unique_images, db_images

    @functools.cache
    def _init_logging(self):
        logging.basicConfig(
            level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
        )

    def _process_unique_image(self, image_file, hash: int, results: defaultdict):
        """
        Processes images
        Raises:
            GeminiAPIError: when gemini request fails
        """
        logging.info(f"Processing image: {image_file.name}")
        gemini_api = GeminiAPI()
        prompt = prompt_factory.get_prompt()
        image_file.seek(0)
        output = gemini_api.process_image(image_file, prompt)

        image_file.seek(0)

        if not output:
            raise GeminiAPIError("Gemini API returned None")

        # use timestamp as filename
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{image_file.name}"

        logging.info(f"Uploading image to Google Cloud Storage: {filename}")
        # Upload the image to GCS
        client = storage.Client.from_service_account_json(settings.GCP_CREDENTIALS_FILE)
        bucket = client.get_bucket(settings.GCP_STORAGE_BUCKET)
        blob = bucket.blob(filename)
        blob.upload_from_file(image_file)
        image_url = blob.public_url

        logging.info(f"Saving image to database: {filename}")
        # save screenshot information to database
        screenshot = Screenshot(
            image_url=image_url,
            analysis_result=output,
            prompt=prompt,
            flag=output.get("flag"),
            image_hash=hash,
            image_name=image_file.name,
        )
        screenshot.save()

        results["new_images"].append(
            {
                "output_text": output.get("output_text"),
                "flag": output.get("flag"),
                "image_name": image_file.name,
            }
        )

    def post(self, request, format=None):
        """
        Hashes images and deduplicates first before processing image content
        """
        self._init_logging()

        logging.info("Starting the script...")
        logging.info("Getting images from request...")
        images = request.FILES.getlist("images")
        results = defaultdict(list)
        results["db_images"] = []
        results["new_images"] = []

        if not images:
            return Response(
                {"error": "No images found in the request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        unique_images, db_images = self._images_deduplicator(images)

        for image_file, hash in unique_images:
            try:
                self._process_unique_image(image_file, hash, results)
            except GeminiAPIError as e:
                return Response(
                    {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # process images already in the DB
        for image_file in db_images:
            results["db_images"].append(
                {
                    "output_text": image_file.get("analysis_result")["output_text"],
                    "flag": image_file.get("analysis_result")["flag"],
                    "image_name": image_file.get("image_name"),
                }
            )

        logging.info("Script completed")

        return Response(results, status=status.HTTP_200_OK)


class ScreenshotListAPIView(generics.ListAPIView):
    """
    API class for querying database objects
    """

    queryset = Screenshot.objects.all()
    serializer_class = ScreenshotSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["created_at", "image_url", "flag", "image_name", "image"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Screenshot.objects.all()
        start_date = self.request.query_params.get("start_date", None)
        end_date = self.request.query_params.get("end_date", None)

        if start_date:
            start_date = parse_date(start_date)
            if start_date:
                # When only a date is provided, we assume the start of the day
                start_date = timezone.make_aware(
                    timezone.datetime.combine(start_date, timezone.datetime.min.time())
                )

        if end_date:
            end_date = parse_date(end_date)
            if end_date:
                # Include the end of the day for the end date
                end_date = timezone.make_aware(
                    timezone.datetime.combine(end_date, timezone.datetime.max.time())
                )

        if start_date and end_date:
            queryset = queryset.filter(created_at__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        elif end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        return queryset
