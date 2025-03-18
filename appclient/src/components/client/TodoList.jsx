import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { todoService } from '../../services/todo.service';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('upcoming');

  useEffect(() => {
    fetchTodos();
  }, [filter, dateRange]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      
      // Build the filter parameters
      const params = {};
      
      if (filter !== 'all') {
        params.status = filter;
      }
      
      // Adding date range filtering (this would need to be implemented on the backend)
      if (dateRange === 'today') {
        params.due_date = new Date().toISOString().split('T')[0];
      } else if (dateRange === 'week') {
        // For simplicity, this is handled in the frontend filtering below
      }
      
      const data = await todoService.getTodos(params);
      
      // Additional frontend filtering for date ranges
      let filteredData = data;
      
      if (dateRange === 'week') {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        filteredData = data.filter(todo => {
          const dueDate = new Date(todo.due_date);
          return dueDate >= today && dueDate <= nextWeek;
        });
      }
      
      // Sort todos by due date (ascending)
      filteredData.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      
      setTodos(filteredData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load tasks. Please try again later.');
      setLoading(false);
    }
  };

  const handleCompleteTodo = async (todoId) => {
    try {
      await todoService.completeTodo(todoId);
      setSuccessMessage('Task marked as completed!');
      
      // Update the todo in the local state to show as completed
      setTodos(todos.map(todo => 
        todo.id === todoId 
          ? { ...todo, status: 'completed', completed_at: new Date().toISOString() } 
          : todo
      ));
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error completing todo:', err);
      setError('Failed to mark task as completed. Please try again.');
      
      // Clear error message after a delay
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'missed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && todos.length === 0) {
    return <div className="text-center mt-5">Loading tasks...</div>;
  }

  return (
    <Container>
      <h1 className="mb-4">My Tasks</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form>
                <Row>
                  <Col>
                    <Form.Group controlId="statusFilter">
                      <Form.Label>Status</Form.Label>
                      <Form.Select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="missed">Missed</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="dateFilter">
                      <Form.Label>Due Date</Form.Label>
                      <Form.Select 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                      >
                        <option value="upcoming">All Upcoming</option>
                        <option value="today">Today</option>
                        <option value="week">Next 7 Days</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Tabs
        defaultActiveKey="daily"
        id="todo-tabs"
        className="mb-3"
      >
        <Tab eventKey="daily" title="Daily Tasks">
          <Row>
            {todos.filter(todo => !todo.category || todo.category === 'daily').length === 0 ? (
              <Col className="text-center py-5">
                <p className="text-muted">No daily tasks found. Add a new task to get started!</p>
              </Col>
            ) : (
              todos.filter(todo => !todo.category || todo.category === 'daily').map(todo => (
                <Col key={todo.id} md={6} lg={4} className="mb-4">
                  <Card className={`shadow-sm ${todo.status === 'completed' ? 'border-success' : ''}`}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className={todo.status === 'completed' ? 'text-decoration-line-through' : ''}>{todo.title}</h5>
                          <p className="text-muted mb-1">Due: {formatDueDate(todo.due_date)}</p>
                        </div>
                        <Badge bg={getStatusBadgeVariant(todo.status)}>{todo.status}</Badge>
                      </div>
                      <p className={`mt-2 ${todo.status === 'completed' ? 'text-decoration-line-through text-muted' : ''}`}>{todo.description}</p>
                      {todo.status !== 'completed' && (
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          onClick={() => handleCompleteTodo(todo.id)}
                          className="mt-2"
                        >
                          Mark as Complete
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Tab>
        <Tab eventKey="work" title="Work Tasks">
          <Row>
            {todos.filter(todo => todo.category === 'work').length === 0 ? (
              <Col className="text-center py-5">
                <p className="text-muted">No work tasks found. Add a new task to get started!</p>
              </Col>
            ) : (
              todos.filter(todo => todo.category === 'work').map(todo => (
                <Col key={todo.id} md={6} lg={4} className="mb-4">
                  <Card className={`shadow-sm ${todo.status === 'completed' ? 'border-success' : ''}`}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className={todo.status === 'completed' ? 'text-decoration-line-through' : ''}>{todo.title}</h5>
                          <p className="text-muted mb-1">Due: {formatDueDate(todo.due_date)}</p>
                        </div>
                        <Badge bg={getStatusBadgeVariant(todo.status)}>{todo.status}</Badge>
                      </div>
                      <p className={`mt-2 ${todo.status === 'completed' ? 'text-decoration-line-through text-muted' : ''}`}>{todo.description}</p>
                      {todo.status !== 'completed' && (
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          onClick={() => handleCompleteTodo(todo.id)}
                          className="mt-2"
                        >
                          Mark as Complete
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Tab>
        <Tab eventKey="personal" title="Personal Tasks">
          <Row>
            {todos.filter(todo => todo.category === 'personal').length === 0 ? (
              <Col className="text-center py-5">
                <p className="text-muted">No personal tasks found. Add a new task to get started!</p>
              </Col>
            ) : (
              todos.filter(todo => todo.category === 'personal').map(todo => (
                <Col key={todo.id} md={6} lg={4} className="mb-4">
                  <Card className={`shadow-sm ${todo.status === 'completed' ? 'border-success' : ''}`}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className={todo.status === 'completed' ? 'text-decoration-line-through' : ''}>{todo.title}</h5>
                          <p className="text-muted mb-1">Due: {formatDueDate(todo.due_date)}</p>
                        </div>
                        <Badge bg={getStatusBadgeVariant(todo.status)}>{todo.status}</Badge>
                      </div>
                      <p className={`mt-2 ${todo.status === 'completed' ? 'text-decoration-line-through text-muted' : ''}`}>{todo.description}</p>
                      {todo.status !== 'completed' && (
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          onClick={() => handleCompleteTodo(todo.id)}
                          className="mt-2"
                        >
                          Mark as Complete
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Tab>
      </Tabs>
      
      <div className="text-center mt-4 mb-5">
        <Button variant="primary" href="/todo/new">
          Add New Task
        </Button>
      </div>
    </Container>
  );
};

export default TodoList;