from rest_framework import serializers
from .models import Screenshot
from django.conf import settings
from google.cloud import storage
import datetime

class ScreenshotSerializer(serializers.ModelSerializer):
    signed_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Screenshot
        fields = ('id', 'image_name','image_url', 'signed_image_url', 'analysis_result', 'prompt', 'flag', 'created_at')
    
    def get_signed_image_url(self, obj):
        client = storage.Client.from_service_account_json(settings.GCP_CREDENTIALS_FILE)
        bucket_name = settings.GCP_STORAGE_BUCKET
        blob_name = obj.image_url.split('/')[-1]  #blob name from the image_url
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        
        #expiration time for the signed URL
        expiration = datetime.timedelta(minutes=15)  #the URL expires in 15 minutes
        signed_url = blob.generate_signed_url(expiration=expiration)

        return signed_url