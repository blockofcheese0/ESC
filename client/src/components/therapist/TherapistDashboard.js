import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { goalService } from '../../services/goal.service';
import { todoService } from '../../services/todo.service';

const TherapistDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [recentGoals, setRecentGoals] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeGoals: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch clients
        const clientsData = await authService.getTherapistClients();
        setClients(clientsData);
        
        // Fetch goals
        const goalsData = await goalService.getTherapistGoals();
        setRecentGoals(goalsData.slice(0, 5)); // Get 5 most recent goals
        
        // Fetch pending tasks
        const tasksData = await todoService.getTherapistTodos({ status: 'pending' });
        setPendingTasks(tasksData.slice(0, 5)); // Get 5 most recent pending tasks
        
        // Calculate stats
        const activeGoals = goalsData.filter(goal => new Date(goal.end_date) >= new Date()).length;
        const allTasks = await todoService.getTherapistTodos();
        const completedTasks = allTasks.filter(task => task.status === 'completed').length;
        
        setStats({
          totalClients: clientsData.length,
          activeGoals: activeGoals,
          completedTasks: completedTasks,
          pendingTasks: allTasks.length - completedTasks
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getClientName = (clientId) => {
    const client = clients.find(client => client.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Unknown Client';
  };

  if (loading) {
    return <div className="text-center mt-5">Loading dashboard...</div>;
  }

  return (
    <Container>
      <h1 className="mb-4">Therapist Dashboard</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <h2 className="display-4">{stats.totalClients}</h2>
              <Card.Text>Clients</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <h2 className="display-4">{stats.activeGoals}</h2>
              <Card.Text>Active Goals</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <h2 className="display-4">{stats.completedTasks}</h2>
              <Card.Text>Completed Tasks</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <h2 className="display-4">{stats.pendingTasks}</h2>
              <Card.Text>Pending Tasks</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Goals</h5>
              <Link to="/therapist/goal/new">
                <Button variant="primary" size="sm">Create New Goal</Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {recentGoals.length === 0 ? (
                <p className="text-center text-muted">No goals created yet</p>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Client</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGoals.map((goal) => (
                      <tr key={goal.id}>
                        <td>{goal.title}</td>
                        <td>{getClientName(goal.client_id)}</td>
                        <td>
                          {new Date(goal.end_date) >= new Date() ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg="secondary">Completed</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              {recentGoals.length > 0 && (
                <div className="text-end mt-3">
                  <Link to="/therapist/goals">View All Goals</Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pending Tasks</h5>
              <Link to="/therapist/todo/new">
                <Button variant="primary" size="sm">Create New Task</Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {pendingTasks.length === 0 ? (
                <p className="text-center text-muted">No pending tasks</p>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Client</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>{getClientName(task.client_id)}</td>
                        <td>
                          {new Date(task.due_date) < new Date() ? (
                            <Badge bg="danger">Overdue</Badge>
                          ) : (
                            new Date(task.due_date).toLocaleDateString()
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              {pendingTasks.length > 0 && (
                <div className="text-end mt-3">
                  <Link to="/therapist/todos">View All Tasks</Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Clients</h5>
              <Link to="/therapist/clients">
                <Button variant="primary" size="sm">View All Clients</Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {clients.length === 0 ? (
                <p className="text-center text-muted">No clients assigned yet</p>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Active Goals</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.slice(0, 5).map((client) => (
                      <tr key={client.id}>
                        <td>{`${client.first_name} ${client.last_name}`}</td>
                        <td>{client.email}</td>
                        <td>
                          {recentGoals.filter(goal => 
                            goal.client_id === client.id && new Date(goal.end_date) >= new Date()
                          ).length}
                        </td>
                        <td>
                          <Link to={`/therapist/client/${client.id}`}>
                            <Button variant="outline-primary" size="sm">View Profile</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TherapistDashboard;