from django.db import models
from django.conf import settings


class JobApplication(models.Model):

    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('assessment', 'Assessment'),
        ('interview', 'Interview'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_applications'
    )

    company_name = models.CharField(max_length=200)

    job_title = models.CharField(max_length=200)

    location = models.CharField(max_length=200)

    job_type = models.CharField(max_length=100)

    salary = models.CharField(
        max_length=100,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='applied'
    )

    applied_date = models.DateField()

    job_url = models.URLField(blank=True)

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} - {self.job_title}"
    

class Interview(models.Model):

    INTERVIEW_TYPE_CHOICES = [
        ('online', 'Online'),
        ('in_person', 'In Person'),
        ('phone', 'Phone'),
    ]

    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    job_application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name='interviews'
    )

    round_name = models.CharField(max_length=150)

    scheduled_at = models.DateTimeField()

    interview_type = models.CharField(
        max_length=20,
        choices=INTERVIEW_TYPE_CHOICES,
        default='online'
    )

    meeting_link = models.URLField(blank=True)

    location = models.CharField(
        max_length=250,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job_application.company_name} - {self.round_name}"
    