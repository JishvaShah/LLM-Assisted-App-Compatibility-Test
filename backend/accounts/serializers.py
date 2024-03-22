from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('employee_id', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    # def create(self, validated_data):
    #     user = User.objects.create_user(**validated_data)
    #     return user
    def create(self, validated_data):
        employee_id = validated_data.pop('employee_id')
        password = validated_data.pop('password')
        user = User.objects.create_user(employee_id, password, **validated_data)
        return user