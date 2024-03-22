from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .gemini_api import GeminiAPI
from pathlib import Path
import os
from datetime import datetime
import csv
from google.cloud import storage
from django.conf import settings

class ImageProcessingAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        if 'image' not in request.data:
            return Response({'error': 'No image found in the request.'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.data['image']
        
        gemini_api = GeminiAPI()
        output = gemini_api.process_image(image_file)

        if not output["flag"]:
            # Save the image to Cloud Storage
            client = storage.Client.from_service_account_json(settings.GCP_CREDENTIALS_FILE)
            bucket = client.get_bucket(settings.GCP_STORAGE_BUCKET)

            current_date = datetime.now().strftime('%Y-%m-%d')

            folder_name = f"{current_date}/images"
            blob_name = f"{folder_name}/{image_file.name}"
            blob = bucket.blob(blob_name)
            blob.upload_from_file(image_file)

            #csv output
            csv_file_name = f"{current_date}/output.csv"
            csv_blob = bucket.blob(csv_file_name)

            if not csv_blob.exists():
                csv_data = [['Image URL', 'Output Text']]
            else:
                # download the existing CSV file
                csv_blob.download_to_filename('temp_output.csv')
                with open('temp_output.csv', 'r') as f:
                    csv_data = list(csv.reader(f))

            image_url = f"https://storage.googleapis.com/{settings.GCP_STORAGE_BUCKET}/{blob_name}"
            csv_data.append([image_url, output["output_text"]])

            with open('temp_output.csv', 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerows(csv_data)

            csv_blob.upload_from_filename('temp_output.csv')

            # remove the temporary CSV file
            os.remove('temp_output.csv')

        response_data = {
            "output_text": output["output_text"],
            "flag": output["flag"]
        }

        return Response(response_data, status=status.HTTP_200_OK)
