from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .gemini_api import GeminiAPI
import datetime
from google.cloud import storage
from django.conf import settings
from .models import Screenshot

class ImageProcessingAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        CREDENTIALS_FILE = "/Users/chenyian261/Documents/GitHub/CS6510Project/app-compat-test-1e6010646463.json"

        if 'image' not in request.data:
            return Response({'error': 'No image found in the request.'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.data['image']

        gemini_api = GeminiAPI()
        output = gemini_api.process_image(image_file)

        image_file.seek(0)
        
        #use timestamp as filename
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{image_file.name}"

        # Upload the image to GCS
        client = storage.Client.from_service_account_json(CREDENTIALS_FILE)
        bucket = client.get_bucket(settings.GCP_STORAGE_BUCKET)
        blob = bucket.blob(filename)
        blob.upload_from_file(image_file)
        image_url = blob.public_url

        #save screenshot information to database
        screenshot = Screenshot(image_url=image_url, analysis_result=output)
        screenshot.save()

        response_data = {
            "output_text": output["output_text"],
            "flag": output["flag"]
        }

        return Response(response_data, status=status.HTTP_200_OK)
