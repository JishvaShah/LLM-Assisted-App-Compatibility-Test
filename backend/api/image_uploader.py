from .models import Screenshot
import datetime
import logging
from google.cloud import storage
from django.conf import settings
logger = logging.getLogger("basic")

def upload_image(image_file,image_hash,output,prompt):
    # use timestamp as filename
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{image_file.name}"

    logger.info(f"Uploading image to Google Cloud Storage: {filename}")
    # Upload the image to GCS
    client = storage.Client.from_service_account_json(settings.GCP_CREDENTIALS_FILE)
    bucket = client.get_bucket(settings.GCP_STORAGE_BUCKET)
    blob = bucket.blob(filename)
    blob.upload_from_file(image_file)
    image_url = blob.public_url

    logger.info(f"Saving image to database: {filename}")
    # save screenshot information to database
    screenshot = Screenshot(
        image_url=image_url,
        analysis_result=output,
        prompt=prompt,
        flag=output.get("flag"),
        image_hash=image_hash,
        image_name=image_file.name,
    )
    screenshot.save()
    logger.info(f"Image saved")
