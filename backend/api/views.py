from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .gemini_api import GeminiAPI
from pathlib import Path

class ImageProcessingAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        if 'image' not in request.data:
            return Response({'error': 'No image found in the request.'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.data['image']
        
        #TODO: save images to DB, remove this later
        # Save the uploaded image to a temporary file
        with open('temp_image.png', 'wb') as f:
            f.write(image_file.read())

        # process image 
        gemini_api = GeminiAPI()
        output_text = gemini_api.process_image()

        # delete the temporary image file
        #TODO: remove this later
        Path('temp_image.png').unlink()

        return Response({'output_text': output_text}, status=status.HTTP_200_OK)