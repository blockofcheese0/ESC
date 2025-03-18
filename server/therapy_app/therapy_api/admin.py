from django.contrib import admin
from django.contrib.auth.models import User
from .models import UserProfile, TherapistProfile, ClientProfile, TherapistClientRelationship, Goal, TodoItem

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_therapist', 'created_at')

@admin.register(TherapistProfile)
class TherapistProfileAdmin(admin.ModelAdmin):
    list_display = ('user_profile', 'invite_code', 'specialty', 'bio')

@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ('user_profile',)

@admin.register(TherapistClientRelationship)
class TherapistClientRelationshipAdmin(admin.ModelAdmin):
    list_display = ('therapist', 'client', 'created_at')

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'therapist', 'client', 'frequency', 'start_date', 'end_date')

@admin.register(TodoItem)
class TodoItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'goal', 'due_date', 'status', 'completed_at')
