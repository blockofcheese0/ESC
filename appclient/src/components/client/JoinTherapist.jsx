import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const JoinTherapist = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // This would fetch a list of therapists the client is already connected with
    const fetchTherapists = async () => {
      try {
        // This is a placeholder - the actual implementation would depend on your API
        // const response = await ...
        // setTherapists(response.data);
        
        // Placeholder data
        setTherapists([
          { id: 1, name: 'Dr. Jane Smith', specialty: 'Cognitive Behavioral Therapy' },
          { id: 2, name: 'Dr. John Doe', specialty: 'Family Therapy' }
        ]);
      } catch (err) {
        console.error('Error fetching therapists:', err);
      }
    };

    fetchTherapists();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await authService.joinTherapist(inviteCode);
      
      setSuccess('Successfully joined therapist! Redirecting to dashboard...');
      setInviteCode('');
      
      // Add the new therapist to the list or refresh the list
      // This is a placeholder - you would typically refresh the data
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/client');
      }, 2000);
    } catch (err) {
      console.error('Error joining therapist:', err);
      setError(err.response?.data?.detail || 'Failed to join therapist. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className="mb-4">Join a Therapist</h1>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Enter Invitation Code</Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formInviteCode">
                  <Form.Label>Therapist Invitation Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter the code provided by your therapist"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    Ask your therapist for their unique invitation code.
                  </Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Joining...' : 'Join Therapist'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header as="h5">My Therapists</Card.Header>
            <Card.Body>
              {therapists.length === 0 ? (
                <p className="text-muted">You haven't joined any therapists yet.</p>
              ) : (
                therapists.map((therapist) => (
                  <Card key={therapist.id} className="mb-2">
                    <Card.Body className="p-3">
                      <Card.Title className="h6">{therapist.name}</Card.Title>
                      <Card.Text className="small text-muted">
                        Specialty: {therapist.specialty}
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

export default JoinTherapist;