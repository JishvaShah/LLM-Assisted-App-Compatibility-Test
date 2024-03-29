from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .gemini_api import GeminiAPI,GeminiAPIError
import datetime
from google.cloud import storage
from django.conf import settings
from .models import Screenshot
import api.prompt_factory as prompt_factory
import logging

class ImageProcessingAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        #TODO: move the credentials file in production
        CREDENTIALS_FILE = "/Users/chenyian261/Documents/GitHub/CS6510Project/app-compat-test-1e6010646463.json"

        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        logging.info("Starting the script...")
        logging.info("Getting image from request...")
        if 'image' not in request.data:
            return Response({'error': 'No image found in the request.'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.data['image']
        
        logging.info("Processing image with Gemini...")

        try:
            gemini_api = GeminiAPI()
            prompt = prompt_factory.get_prompt()
            output = gemini_api.process_image(image_file,prompt)
        except GeminiAPIError as e:
            return Response({'error': str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    
        image_file.seek(0)

        if output:
            #use timestamp as filename
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{image_file.name}"

            logging.info("Uploading image to Google Cloud Storage...")
            # Upload the image to GCS
            client = storage.Client.from_service_account_json(CREDENTIALS_FILE)
            bucket = client.get_bucket(settings.GCP_STORAGE_BUCKET)
            blob = bucket.blob(filename)
            blob.upload_from_file(image_file)
            image_url = blob.public_url

            logging.info("Saving image to database...")
            #save screenshot information to database
            screenshot = Screenshot(image_url=image_url, analysis_result=output,prompt=prompt)
            screenshot.save()

        elif not output:
            return Response({'error': 'Gemini API returned None'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        logging.info("Script completed")

        response_data = {
            "output_text": output.get("output_text"),
            "flag": output.get("flag")
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
