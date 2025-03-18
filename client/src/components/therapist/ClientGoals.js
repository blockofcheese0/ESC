import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { goalService } from '../../services/goal.service';

const ClientGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const goalsData = await goalService.getGoals();
        setGoals(goalsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching goals:', err);
        setError('Failed to load goals. Please try again later.');
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const getProgressPercent = (goal) => {
    if (!goal.todos || goal.todos.length === 0) return 0;
    const completedTodos = goal.todos.filter(todo => todo.status === 'completed').length;
    return Math.round((completedTodos / goal.todos.length) * 100);
  };

  const getFrequencyBadgeVariant = (frequency) => {
    switch (frequency) {
      case 'daily':
        return 'danger';
      case 'weekly':
        return 'warning';
      case 'monthly':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading goals...</div>;
  }

  return (
    <Container>
      <h1 className="mb-4">My Goals</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {goals.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center p-5">
            <h3>No Goals Yet</h3>
            <p className="text-muted">
              Your therapist hasn't set any goals for you yet. They'll appear here once assigned.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {goals.map((goal) => (
            <Col md={6} key={goal.id} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{goal.title}</h5>
                  <Badge bg={getFrequencyBadgeVariant(goal.frequency)}>
                    {goal.frequency.charAt(0).toUpperCase() + goal.frequency.slice(1)}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Text>{goal.description}</Card.Text>
                  
                  <div className="mt-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Progress</small>
                      <small>{getProgressPercent(goal)}%</small>
                    </div>
                    <ProgressBar 
                      now={getProgressPercent(goal)} 
                      variant={getProgressPercent(goal) >= 100 ? "success" : "primary"} 
                    />
                  </div>
                </Card.Body>
                <Card.Footer className="text-muted">
                  <small>Started: {new Date(goal.created_at).toLocaleDateString()}</small>
                  {goal.end_date && (
                    <small className="float-end">
                      End Date: {new Date(goal.end_date).toLocaleDateString()}
                    </small>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ClientGoals;