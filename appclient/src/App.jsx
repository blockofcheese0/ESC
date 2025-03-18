import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TherapistDashboard from './components/therapist/TherapistDashboard';
import ClientDashboard from './components/client/ClientDashboard';
import JoinTherapist from './components/client/JoinTherapist';
import GoalForm from './components/therapist/GoalForm';
import ClientGoals from './components/therapist/ClientGoals';
import TodoList from './components/client/TodoList';
import PrivateRoute from './components/common/PrivateRoute';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Navbar />
          <Container className="py-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/therapist" 
                element={
                  <PrivateRoute requiredRole="therapist">
                    <TherapistDashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/therapist/client/:clientId/goals" 
                element={
                  <PrivateRoute requiredRole="therapist">
                    <ClientGoals />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/therapist/goal/new" 
                element={
                  <PrivateRoute requiredRole="therapist">
                    <GoalForm />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/therapist/goal/:goalId/edit" 
                element={
                  <PrivateRoute requiredRole="therapist">
                    <GoalForm />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/client" 
                element={
                  <PrivateRoute requiredRole="client">
                    <ClientDashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/client/join" 
                element={
                  <PrivateRoute requiredRole="client">
                    <JoinTherapist />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/client/todos" 
                element={
                  <PrivateRoute requiredRole="client">
                    <TodoList />
                  </PrivateRoute>
                } 
              />
              
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;