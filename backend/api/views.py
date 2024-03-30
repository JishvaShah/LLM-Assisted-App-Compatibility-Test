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



class ImageProcessingAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        images = request.FILES.getlist('images')
        results = []

        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        logging.info("Starting the script...")
        logging.info("Getting images from request...")

        if not images:
            return Response({'error': 'No images found in the request.'}, status=status.HTTP_400_BAD_REQUEST)

        for image_file in images:
            logging.info(f"Processing image: {image_file.name}")

            try:
                gemini_api = GeminiAPI()
                prompt = prompt_factory.get_prompt()
                output = gemini_api.process_image(image_file, prompt)
            except GeminiAPIError as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            image_file.seek(0)

            if output:
                #use timestamp as filename
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
                #save screenshot information to database
                screenshot = Screenshot(image_url=image_url, analysis_result=output, prompt=prompt, flag=output.get("flag"))
                screenshot.save()

                results.append({
                    "output_text": output.get("output_text"),
                    "flag": output.get("flag")
                })
            else:
                return Response({'error': 'Gemini API returned None'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        logging.info("Script completed")

        return Response(results, status=status.HTTP_200_OK)

class ScreenshotListAPIView(generics.ListAPIView):
    queryset = Screenshot.objects.all()
    serializer_class = ScreenshotSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['created_at', 'image_url', 'flag']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Screenshot.objects.all()
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if start_date:
            start_date = parse_date(start_date)
            if start_date:
                #When only a date is provided, we assume the start of the day
                start_date = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))

        if end_date:
            end_date = parse_date(end_date)
            if end_date:
                # Include the end of the day for the end date
                end_date = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.max.time()))

        if start_date and end_date:
            queryset = queryset.filter(created_at__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        elif end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        return queryset
