import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { goalService } from '../../services/goal.service';
import { todoService } from '../../services/todo.service';

const ClientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [upcomingTodos, setUpcomingTodos] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch client profile
        const profileData = await authService.getClientProfile();
        setProfile(profileData);
        
        // Fetch active goals
        const goalsData = await goalService.getGoals();
        setGoals(goalsData);
        
        // Fetch upcoming todos (pending only)
        const todosData = await todoService.getTodos({ status: 'pending' });
        // Sort by due date ascending and take the first 5
        const sortedTodos = todosData
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .slice(0, 5);
        setUpcomingTodos(sortedTodos);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCompleteTodo = async (todoId) => {
    try {
      await todoService.completeTodo(todoId);
      // Update the todo list by removing the completed one
      setUpcomingTodos(upcomingTodos.filter(todo => todo.id !== todoId));
    } catch (err) {
      console.error('Error completing todo:', err);
      setError('Failed to complete task. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading dashboard...</div>;
  }

  return (
    <Container>
      <h1 className="mb-4">Client Dashboard</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Welcome to Your Therapy Dashboard</Card.Title>
              <Card.Text>
                Here you can track your progress, view goals set by your therapist,
                and complete assigned tasks.
              </Card.Text>
              <Link to="/client/join">
                <Button variant="primary">Join a Therapist</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5">Upcoming Tasks</Card.Header>
            <Card.Body>
              {upcomingTodos.length === 0 ? (
                <p className="text-muted">No upcoming tasks</p>
              ) : (
                upcomingTodos.map((todo) => (
                  <Card key={todo.id} className="mb-2">
                    <Card.Body className="p-3">
                      <Card.Title className="h6">{todo.title}</Card.Title>
                      <Card.Text className="small text-muted">
                        Due: {new Date(todo.due_date).toLocaleDateString()}
                      </Card.Text>
                      <Button 
                        size="sm" 
                        variant="success" 
                        onClick={() => handleCompleteTodo(todo.id)}
                      >
                        Mark Complete
                      </Button>
                    </Card.Body>
                  </Card>
                ))
              )}
              <div className="mt-3">
                <Link to="/client/todos">
                  <Button variant="outline-primary" size="sm">View All Tasks</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5">My Goals</Card.Header>
            <Card.Body>
              {goals.length === 0 ? (
                <p className="text-muted">No goals set yet</p>
              ) : (
                goals.map((goal) => (
                  <Card key={goal.id} className="mb-2">
                    <Card.Body className="p-3">
                      <Card.Title className="h6">{goal.title}</Card.Title>
                      <Card.Text className="small">
                        {goal.description}
                      </Card.Text>
                      <Card.Text className="small text-muted">
                        Frequency: {goal.frequency.charAt(0).toUpperCase() + goal.frequency.slice(1)}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ClientDashboard;