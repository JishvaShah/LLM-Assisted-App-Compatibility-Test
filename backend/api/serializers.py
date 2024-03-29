from rest_framework import serializers
from .models import Screenshot

class ScreenshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Screenshot
        fields = ('id', 'image_url', 'analysis_result', 'prompt', 'flag', 'created_at')