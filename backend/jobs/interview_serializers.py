
from rest_framework import serializers
from .models import Interview


class InterviewSerializer(serializers.ModelSerializer):

    company_name = serializers.CharField(
        source='job_application.company_name',
        read_only=True
    )

    job_title = serializers.CharField(
        source='job_application.job_title',
        read_only=True
    )

    class Meta:
        model = Interview

        fields = [
            'id',
            'job_application',
            'company_name',
            'job_title',
            'round_name',
            'scheduled_at',
            'interview_type',
            'meeting_link',
            'location',
            'status',
            'notes',
            'created_at',
        ]

        read_only_fields = ['id', 'created_at']

    def validate_job_application(self, value):
        request = self.context.get('request')

        if request and value.user != request.user:
            raise serializers.ValidationError(
                "You can only schedule interviews for your own applications."
            )

        return value
