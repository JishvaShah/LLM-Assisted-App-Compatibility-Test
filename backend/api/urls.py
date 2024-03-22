from django.urls import path
from .views import ImageProcessingAPIView

urlpatterns = [
    path('process-image/', ImageProcessingAPIView.as_view(), name='process_image'),
]