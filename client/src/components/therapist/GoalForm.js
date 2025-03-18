import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { goalService } from '../../services/goal.service';
import { authService } from '../../services/auth.service';

const GoalForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: '',
    frequency: 'weekly',
    duration: 30, // Default duration in days
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch clients for the therapist
        const clientsData = await authService.getTherapistClients();
        setClients(clientsData);
        
        // If editing an existing goal, fetch its data
        if (id) {
          setIsEditing(true);
          const goalData = await goalService.getGoalById(id);
          setFormData({
            title: goalData.title,
            description: goalData.description,
            client: goalData.client_id,
            frequency: goalData.frequency,
            duration: goalData.duration,
            start_date: goalData.start_date,
            end_date: goalData.end_date,
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'duration') {
      // When duration changes, also update the end date
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(value));
      
      setFormData({
        ...formData,
        [name]: value,
        end_date: endDate.toISOString().split('T')[0]
      });
    } else if (name === 'start_date') {
      // When start date changes, also update the end date based on duration
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(formData.duration));
      
      setFormData({
        ...formData,
        [name]: value,
        end_date: endDate.toISOString().split('T')[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const goalData = {
        title: formData.title,
        description: formData.description,
        client_id: formData.client,
        frequency: formData.frequency,
        duration: formData.duration,
        start_date: formData.start_date,
        end_date: formData.end_date
      };
      
      if (isEditing) {
        await goalService.updateGoal(id, goalData);
        setSuccess('Goal updated successfully!');
      } else {
        await goalService.createGoal(goalData);
        setSuccess('Goal created successfully! Redirecting to dashboard...');
        
        // Clear form
        setFormData({
          title: '',
          description: '',
          client: '',
          frequency: 'weekly',
          duration: 30,
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
        });
        
        // Redirect after successful creation
        setTimeout(() => {
          navigate('/therapist');
        }, 2000);
      }
    } catch (err) {
      console.error('Error saving goal:', err);
      setError(err.response?.data?.detail || 'Failed to save goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="text-center mt-5">Loading goal data...</div>;
  }

  return (
    <Container>
      <h1 className="mb-4">{isEditing ? 'Edit Goal' : 'Create New Goal'}</h1>
      
      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Goal Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a clear, concise goal title"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about the goal and expectations"
                rows={3}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formClient">
              <Form.Label>Client</Form.Label>
              <Form.Select
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
                disabled={isEditing}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formFrequency">
                  <Form.Label>Task Frequency</Form.Label>
                  <Form.Select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    How often tasks will be generated for this goal
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formDuration">
                  <Form.Label>Duration (days)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    max="365"
                    required
                  />
                  <Form.Text className="text-muted">
                    How long this goal should be active
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formStartDate">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formEndDate">
                  <Form.Label>End Date (Auto-calculated)</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/therapist')}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Goal' : 'Create Goal')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GoalForm;