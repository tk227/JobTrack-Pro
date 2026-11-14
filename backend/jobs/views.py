
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import JobApplication, Interview
from .serializers import JobApplicationSerializer
from .interview_serializers import InterviewSerializer


# List all jobs and create a new job
class JobListCreateView(generics.ListCreateAPIView):

    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Retrieve, update and delete a job
class JobDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(
            user=self.request.user
        )


# List interviews and create new interviews
class InterviewListCreateView(generics.ListCreateAPIView):

    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Interview.objects.filter(
            job_application__user=self.request.user
        ).select_related(
            'job_application'
        ).order_by('scheduled_at')

    def perform_create(self, serializer):
        serializer.save()


# Retrieve, update and delete interviews
class InterviewDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Interview.objects.filter(
            job_application__user=self.request.user
        ).select_related('job_application')
