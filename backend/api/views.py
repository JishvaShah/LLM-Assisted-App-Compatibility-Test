from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics, filters
from .gemini_api import GeminiAPI, GeminiAPIError
from .models import Screenshot
import api.prompt_factory as prompt_factory
import logging
from .serializers import ScreenshotSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.utils.dateparse import parse_date
from collections import defaultdict
from .image_deduplicator import deduplicate_image
from .image_uploader import upload_image
import functools


@functools.cache
def _init_logging():
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
    )
    return logging.getLogger("basic")


logger = _init_logging()


class ImageProcessingAPIView(APIView):
    """
    API class for processing images with Gemini API
    """

    parser_classes = (MultiPartParser, FormParser)

    def _process_unique_image(self, image_file, hash: int, results: defaultdict):
        """
        Processes images
        Raises:
            GeminiAPIError: when gemini request fails
        """
        logger.info(f"Processing image: {image_file.name}")
        gemini_api = GeminiAPI()
        prompt = prompt_factory.get_prompt()
        image_file.seek(0)
        output = gemini_api.process_image(image_file, prompt)

        image_file.seek(0)

        if not output:
            raise GeminiAPIError("Gemini API returned None")

        upload_image(image_file, hash, output, prompt)

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

        logger.info("Starting the script...")
        logger.info("Getting images from request...")
        images = request.FILES.getlist("images")
        results = defaultdict(list)
        results["db_images"] = []
        results["new_images"] = []

        if not images:
            return Response(
                {"error": "No images found in the request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        unique_images, db_images = deduplicate_image(images)

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

        logger.info("Script completed")

        return Response(results, status=status.HTTP_200_OK)


class ScreenshotListAPIView(generics.ListAPIView):
    """
    API class for querying database objects
    """

    queryset = Screenshot.objects.all()
    serializer_class = ScreenshotSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["created_at", "image_url", "flag", "image_name"]
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
