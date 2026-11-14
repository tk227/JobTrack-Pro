from rest_framework import serializers
from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobApplication

        fields = [
            'id',
            'company_name',
            'job_title',
            'location',
            'job_type',
            'salary',
            'status',
            'applied_date',
            'job_url',
            'description',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]