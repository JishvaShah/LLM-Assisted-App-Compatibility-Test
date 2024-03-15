from django.db import models

# Create your models here.
class AppTester(models.Model):
    _input = models.TextField()
    _output = models.TextField()

    class Meta:
        db_table = "t_app_tester"