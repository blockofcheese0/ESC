from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from django.contrib.auth.models import User
from .models import UserProfile, TherapistProfile, ClientProfile, TherapistClientRelationship, Goal, TodoItem
from .serializers import (
    UserSerializer, UserProfileSerializer, TherapistProfileSerializer,
    ClientProfileSerializer, TherapistClientRelationshipSerializer,
    GoalSerializer, TodoItemSerializer, RegistrationSerializer, ClientJoinSerializer
)

from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            user = authenticate(username=username, password=password)

            if user is not None:
                token, _ = Token.objects.get_or_create(user=user)

                # Ensure `user_type` is fetched correctly
                user_type = "client"
                if hasattr(user, "profile") and user.profile.is_therapist:
                    user_type = "therapist"

                return JsonResponse({
                    "token": token.key,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "user_type": user_type
                    }
                })
            else:
                return JsonResponse({"error": "Invalid credentials"}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=400)

class IsTherapist(permissions.BasePermission):
    def has_permission(self, request, view):
        return true
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.is_therapist

class IsClient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile') and not request.user.profile.is_therapist

class RegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

class TherapistProfileViewSet(viewsets.ModelViewSet):
    serializer_class = TherapistProfileSerializer
    permission_classes = [IsTherapist]
    
    def get_queryset(self):
        return TherapistProfile.objects.filter(user_profile__user=self.request.user)

class ClientProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.is_therapist:
            # Therapists can see their clients
            therapist_profile = TherapistProfile.objects.get(user_profile__user=user)
            return ClientProfile.objects.filter(therapists=therapist_profile)
        else:
            # Clients can only see themselves
            return ClientProfile.objects.filter(user_profile__user=user)

class ClientJoinView(generics.CreateAPIView):
    serializer_class = ClientJoinSerializer
    permission_classes = [IsClient]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        invite_code = serializer.validated_data['invite_code']
        therapist = get_object_or_404(TherapistProfile, invite_code=invite_code)
        client = get_object_or_404(ClientProfile, user_profile__user=request.user)
        
        # Check if relationship already exists
        if TherapistClientRelationship.objects.filter(therapist=therapist, client=client).exists():
            return Response({"detail": "You are already connected with this therapist"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the relationship
        TherapistClientRelationship.objects.create(therapist=therapist, client=client)
        
        return Response({"detail": "Successfully joined therapist"}, status=status.HTTP_201_CREATED)

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.is_therapist:
            # Therapists can see goals they created
            therapist_profile = TherapistProfile.objects.get(user_profile__user=user)
            return Goal.objects.filter(therapist=therapist_profile)
        else:
            # Clients can see goals assigned to them
            client_profile = ClientProfile.objects.get(user_profile__user=user)
            return Goal.objects.filter(client=client_profile)
    
    def perform_create(self, serializer):
        therapist_profile = TherapistProfile.objects.get(user_profile__user=self.request.user)
        serializer.save(therapist=therapist_profile)
        
        # Generate todo items based on the goal frequency
        goal = serializer.instance
        self.generate_todo_items(goal)
    
    def generate_todo_items(self, goal):
        start_date = goal.start_date
        end_date = goal.end_date
        current_date = start_date
        
        todos = []
        
        if goal.frequency == 'daily':
            while current_date <= end_date:
                todos.append(TodoItem(
                    goal=goal,
                    title=f"{goal.title} - {current_date.strftime('%Y-%m-%d')}",
                    description=goal.description,
                    due_date=current_date
                ))
                current_date += timedelta(days=1)
        
        elif goal.frequency == 'weekly':
            while current_date <= end_date:
                # Create a weekly todo for each week
                todos.append(TodoItem(
                    goal=goal,
                    title=f"{goal.title} - Week of {current_date.strftime('%Y-%m-%d')}",
                    description=goal.description,
                    due_date=current_date + timedelta(days=6)  # Due at end of week
                ))
                current_date += timedelta(days=7)
        
        elif goal.frequency == 'monthly':
            import calendar
            while current_date <= end_date:
                # Get last day of month
                last_day = calendar.monthrange(current_date.year, current_date.month)[1]
                month_end = current_date.replace(day=last_day)
                
                todos.append(TodoItem(
                    goal=goal,
                    title=f"{goal.title} - {current_date.strftime('%B %Y')}",
                    description=goal.description,
                    due_date=month_end
                ))
                
                # Move to first day of next month
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year+1, month=1, day=1)
                else:
                    current_date = current_date.replace(month=current_date.month+1, day=1)
        
        # Bulk create all todos
        if todos:
            TodoItem.objects.bulk_create(todos)

class TodoItemViewSet(viewsets.ModelViewSet):
    serializer_class = TodoItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        
        if hasattr(user, 'profile') and user.profile.is_therapist:
            # Therapists can see todos for goals they created
            therapist_profile = TherapistProfile.objects.get(user_profile__user=user)
            queryset = TodoItem.objects.filter(goal__therapist=therapist_profile)
        else:
            # Clients can see todos for goals assigned to them
            client_profile = ClientProfile.objects.get(user_profile__user=user)
            queryset = TodoItem.objects.filter(goal__client=client_profile)
        
        # Apply status filter if provided
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        todo = self.get_object()
        todo.status = 'completed'
        todo.completed_at = timezone.now()
        todo.save()
        return Response({"status": "todo marked as completed"})