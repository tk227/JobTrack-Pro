
from django.urls import path

from .views import (
    JobListCreateView,
    JobDetailView,
    InterviewListCreateView,
    InterviewDetailView,
)

urlpatterns = [
    path('', JobListCreateView.as_view(), name='job-list-create'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),

    path(
        'interviews/',
        InterviewListCreateView.as_view(),
        name='interview-list-create'
    ),

    path(
        'interviews/<int:pk>/',
        InterviewDetailView.as_view(),
        name='interview-detail'
    ),
]
