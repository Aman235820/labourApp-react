import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaTools, FaPhone } from 'react-icons/fa';
import '../styles/LabourRegister.css';

function LabourRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    labourName: '',
    labourSkill: '',
    labourMobileNo: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:4000/labourapp/labour/registerLabour', formData);
      console.log('Registration response:', response.data); // Debug log
      
      // Store only labourDetails in localStorage
      const labourDetails = response.data.returnValue;
      localStorage.setItem('labourDetails', JSON.stringify(labourDetails));
      localStorage.setItem('isLabourLoggedIn', 'true');
      
      setSuccess('Registration successful!');
      // Redirect to labour dashboard after successful registration
      navigate('/labourDashboard');
    } catch (err) {
      console.error('Registration error:', err); // Debug log
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Labour Registration</h2>
                <p className="text-muted">Join InstaLab as a skilled professional</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaUser className="me-2" />
                    <Form.Label className="fw-bold mb-0">Full Name</Form.Label>
                  </div>
                  <Form.Control
                    type="text"
                    name="labourName"
                    value={formData.labourName}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                    placeholder="Enter your full name"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaTools className="me-2" />
                    <Form.Label className="fw-bold mb-0">Skill</Form.Label>
                  </div>
                  <Form.Control
                    type="text"
                    name="labourSkill"
                    value={formData.labourSkill}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                    placeholder="Enter your skill (e.g., cook, plumber, electrician)"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaPhone className="me-2" />
                    <Form.Label className="fw-bold mb-0">Mobile Number</Form.Label>
                  </div>
                  <Form.Control
                    type="tel"
                    name="labourMobileNo"
                    value={formData.labourMobileNo}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({
                        ...formData,
                        labourMobileNo: value
                      });
                    }}
                    required
                    pattern="[0-9]{10}"
                    className="form-control-lg"
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="btn-lg fw-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>

                <div className="text-center mt-4">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Button 
                      variant="link" 
                      className="p-0 text-decoration-none"
                      onClick={() => navigate('/labourLogin')}
                    >
                      Login here
                    </Button>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LabourRegister; 