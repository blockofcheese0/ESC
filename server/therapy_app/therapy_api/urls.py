from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegistrationView, TherapistProfileViewSet, ClientProfileViewSet,
    ClientJoinView, GoalViewSet, TodoItemViewSet
)

router = DefaultRouter()
router.register(r'therapist-profile', TherapistProfileViewSet, basename='therapist-profile')
router.register(r'client-profile', ClientProfileViewSet, basename='client-profile')
router.register(r'goals', GoalViewSet, basename='goals')
router.register(r'todos', TodoItemViewSet, basename='todos')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegistrationView.as_view(), name='register'),
    path('client/join/', ClientJoinView.as_view(), name='client-join'),
]