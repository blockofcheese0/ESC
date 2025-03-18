import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const clientsData = await authService.getTherapistClients();
        setClients(clientsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients. Please try again later.');
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleGenerateInvite = async () => {
    try {
      setInviteSuccess(false);
      setInviteError(null);
      
      const response = await authService.generateInviteCode();
      setInviteCode(response.code);
      setInviteSuccess(true);
    } catch (err) {
      console.error('Error generating invite code:', err);
      setInviteError('Failed to generate invite code. Please try again.');
    }
  };

  const handleShowDetails = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const getActiveGoalsCount = (client) => {
    return client.goals ? client.goals.filter(goal => new Date(goal.end_date) >= new Date()).length : 0;
  };

  const getCompletedTasksPercent = (client) => {
    if (!client.todos || client.todos.length === 0) return 0;
    const completedTasks = client.todos.filter(todo => todo.status === 'completed').length;
    return Math.round((completedTasks / client.todos.length) * 100);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading clients...</div>;
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Clients</h1>
        <Button variant="primary" onClick={() => setShowInviteModal(true)}>
          Generate Invite Code
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {clients.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center p-5">
            <h3>No Clients Yet</h3>
            <p className="text-muted">
              Generate an invite code to start adding clients.
            </p>
            <Button variant="primary" onClick={() => setShowInviteModal(true)}>
              Generate Invite Code
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Active Goals</th>
                  <th>Task Completion</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.first_name} {client.last_name}</td>
                    <td>{client.email}</td>
                    <td>
                      {getActiveGoalsCount(client)} goal(s)
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: '10px' }}>
                          <div 
                            className="progress-bar" 
                            role="progressbar" 
                            style={{ width: `${getCompletedTasksPercent(client)}%` }}
                            aria-valuenow={getCompletedTasksPercent(client)} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <span className="ms-2 small">{getCompletedTasksPercent(client)}%</span>
                      </div>
                    </td>
                    <td>{new Date(client.joined_date).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleShowDetails(client)}
                      >
                        Details
                      </Button>
                      <Link to={`/therapist/goal/new?client=${client.id}`}>
                        <Button variant="outline-primary" size="sm">
                          Add Goal
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Invite Code Modal */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Client Invitation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {inviteError && <Alert variant="danger">{inviteError}</Alert>}
          {inviteSuccess && (
            <Alert variant="success">
              Invite code successfully generated!
            </Alert>
          )}
          
          <p>
            Generate a unique invitation code to share with your clients.
            They can use this code to connect with you on the platform.
          </p>
          
          {inviteCode && (
            <Form.Group className="mb-3">
              <Form.Label>Your Invite Code</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={inviteCode}
                  readOnly
                  className="bg-light"
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigator.clipboard.writeText(inviteCode)}
                  className="ms-2"
                >
                  Copy
                </Button>
              </div>
              <Form.Text className="text-muted">
                Share this code with your client. For security, this code will expire in 48 hours.
              </Form.Text>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleGenerateInvite}>
            Generate New Code
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Client Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        {selectedClient && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Client Details: {selectedClient.first_name} {selectedClient.last_name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-4">
                <h5>Personal Information</h5>
                <Table bordered>
                  <tbody>
                    <tr>
                      <th style={{ width: '30%' }}>Email</th>
                      <td>{selectedClient.email}</td>
                    </tr>
                    <tr>
                      <th>Username</th>
                      <td>{selectedClient.username}</td>
                    </tr>
                    <tr>
                      <th>Joined Date</th>
                      <td>{new Date(selectedClient.joined_date).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              
              <div className="mb-4">
                <h5>Goals</h5>
                {selectedClient.goals && selectedClient.goals.length > 0 ? (
                  <Table bordered>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Frequency</th>
                        <th>Status</th>
                        <th>Dates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClient.goals.map(goal => (
                        <tr key={goal.id}>
                          <td>{goal.title}</td>
                          <td>{goal.frequency.charAt(0).toUpperCase() + goal.frequency.slice(1)}</td>
                          <td>
                            {new Date(goal.end_date) >= new Date() ? (
                              <Badge bg="success">Active</Badge>
                            ) : (
                              <Badge bg="secondary">Completed</Badge>
                            )}
                          </td>
                          <td>
                            <small>
                              {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">No goals set for this client yet.</p>
                )}
              </div>
              
              <div>
                <h5>Recent Tasks</h5>
                {selectedClient.todos && selectedClient.todos.length > 0 ? (
                  <Table bordered>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClient.todos.slice(0, 5).map(todo => (
                        <tr key={todo.id}>
                          <td>{todo.title}</td>
                          <td>{new Date(todo.due_date).toLocaleDateString()}</td>
                          <td>
                            {todo.status === 'completed' ? (
                              <Badge bg="success">Completed</Badge>
                            ) : new Date(todo.due_date) < new Date() ? (
                              <Badge bg="danger">Overdue</Badge>
                            ) : (
                              <Badge bg="warning">Pending</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">No tasks assigned to this client yet.</p>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Link to={`/therapist/goal/new?client=${selectedClient.id}`}>
                <Button variant="primary">
                  Add New Goal
                </Button>
              </Link>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default ClientList;