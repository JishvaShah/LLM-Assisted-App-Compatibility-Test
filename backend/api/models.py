from django.db import models

class Screenshot(models.Model):
    image_url = models.URLField()
    analysis_result = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


