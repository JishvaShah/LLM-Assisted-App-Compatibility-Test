from PIL import Image
import imagehash
from .models import Screenshot
from .serializers import ScreenshotSerializer
import logging
logger = logging.getLogger("basic")

def deduplicate_image(images):
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
            logger.error(
                f"Error processing image: {image_file.name}. Error: {str(e)}"
            )
    return unique_images, db_images
