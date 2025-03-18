from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, TherapistProfile, ClientProfile, TherapistClientRelationship, Goal, TodoItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'is_therapist', 'created_at']

class TherapistProfileSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = TherapistProfile
        fields = ['id', 'user_profile', 'invite_code', 'specialty', 'bio']

class ClientProfileSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = ClientProfile
        fields = ['id', 'user_profile']

class TherapistClientRelationshipSerializer(serializers.ModelSerializer):
    therapist = TherapistProfileSerializer(read_only=True)
    client = ClientProfileSerializer(read_only=True)
    
    class Meta:
        model = TherapistClientRelationship
        fields = ['id', 'therapist', 'client', 'created_at']

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['id', 'title', 'description', 'therapist', 'client', 'frequency', 'start_date', 'end_date', 'created_at']
        read_only_fields = ['therapist']

class TodoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoItem
        fields = ['id', 'goal', 'title', 'description', 'due_date', 'status', 'completed_at']

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    is_therapist = serializers.BooleanField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'is_therapist']
    
    def create(self, validated_data):
        is_therapist = validated_data.pop('is_therapist')
        user = User.objects.create_user(**validated_data)
        
        user_profile = UserProfile.objects.create(user=user, is_therapist=is_therapist)
        
        if is_therapist:
            TherapistProfile.objects.create(user_profile=user_profile)
        else:
            ClientProfile.objects.create(user_profile=user_profile)
        
        return user

class ClientJoinSerializer(serializers.Serializer):
    invite_code = serializers.CharField(max_length=8)