from django.urls import path
from .views import ImageProcessingAPIView,ScreenshotListAPIView

urlpatterns = [
    path('process-image/', ImageProcessingAPIView.as_view(), name='process_image'),
    path('screenshots/', ScreenshotListAPIView.as_view(), name='screenshots'),

]