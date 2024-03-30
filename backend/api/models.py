from django.db import models
from google.cloud import storage
from django.conf import settings
import datetime

class Screenshot(models.Model):
    image_url = models.URLField()
    analysis_result = models.JSONField()
    prompt = models.TextField(default='placeholder')
    flag = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def generate_signed_url(self):
        client = storage.Client.from_service_account_json(settings.GCP_CREDENTIALS_FILE)
        bucket_name = settings.GCP_STORAGE_BUCKET
        blob_name = self.image_url.split("/")[-1] 
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        
        # Set 15 minutes expiration time for the signed URL
        expiration = datetime.timedelta(minutes=15)
        signed_url = blob.generate_signed_url(expiration=expiration)

        return signed_url


