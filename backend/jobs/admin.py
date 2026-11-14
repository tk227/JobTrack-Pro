
from django.contrib import admin
from .models import JobApplication, Interview


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):

    list_display = (
        'company_name',
        'job_title',
        'user',
        'status',
        'applied_date',
    )

    list_filter = ('status', 'job_type')

    search_fields = (
        'company_name',
        'job_title',
    )


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):

    list_display = (
        'round_name',
        'job_application',
        'scheduled_at',
        'interview_type',
        'status',
    )

    list_filter = ('status', 'interview_type')

    search_fields = (
        'round_name',
        'job_application__company_name',
    )
