from django.db import models
from django.contrib.auth.models import User
import uuid
import random
import string

def generate_invite_code():
    # Generate a random 8-character alphanumeric code
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    is_therapist = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} ({'Therapist' if self.is_therapist else 'Client'})"

class TherapistProfile(models.Model):
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='therapist_profile')
    invite_code = models.CharField(max_length=8, default=generate_invite_code, unique=True)
    specialty = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return f"Therapist: {self.user_profile.user.username}"

class ClientProfile(models.Model):
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='client_profile')
    therapists = models.ManyToManyField(TherapistProfile, through='TherapistClientRelationship')
    
    def __str__(self):
        return f"Client: {self.user_profile.user.username}"

class TherapistClientRelationship(models.Model):
    therapist = models.ForeignKey(TherapistProfile, on_delete=models.CASCADE, related_name='client_relationships')
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='therapist_relationships')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('therapist', 'client')
    
    def __str__(self):
        return f"{self.therapist.user_profile.user.username} - {self.client.user_profile.user.username}"

class Goal(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    therapist = models.ForeignKey(TherapistProfile, on_delete=models.CASCADE, related_name='goals')
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='goals')
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.frequency}) for {self.client.user_profile.user.username}"

class TodoItem(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('missed', 'Missed'),
    ]
    
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='todos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.due_date} ({self.status})"